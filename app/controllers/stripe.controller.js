const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../models");
const Carrito = db.carritos;
const Producto = db.productos;
const Venta = db.ventas;
const DetalleVenta = db.detalle_ventas;
const Inventario = db.inventarios;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const tipoCambioGTQ_USD = 7.9; 
exports.crearSesionPago = async (req, res) => {
  const { id_cliente, cliente_email } = req.body;

  try {
    const items = await Carrito.findAll({
      where: { id_cliente },
      include: [{ model: Producto, as: "producto" }]
    });

    if (items.length === 0) return res.status(400).send({ message: "Carrito vacío." });

    const line_items = items.map(item => ({
      price_data: {
  currency: "usd",
  product_data: { name: item.producto.nombre },
  unit_amount: Math.round((item.producto.precio_unitario / tipoCambioGTQ_USD) * 100),
},
      quantity: item.cantidad,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: cliente_email,
      client_reference_id: id_cliente,
     success_url: "http://localhost:5173/factura/opc?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: "https://tuapp.com/cancel"
    });

    res.send({ url: session.url });

  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

exports.webhookStripe = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  console.log("📡 Webhook recibido. Verificando firma...");
  console.log("Tipo de cuerpo:", typeof req.body);
  console.log("¿Es Buffer?", Buffer.isBuffer(req.body));

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Error al verificar firma:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  console.log("📡 Webhook recibido:", event.type);


  console.log("✅ Firma verificada. Tipo de evento:", event.type);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const id_cliente = session.client_reference_id; 

    console.log("🧾 Datos recibidos:", { id_cliente});

    if (!id_cliente) {
      console.warn("⚠️ Datos faltantes en metadata. Evento ignorado.");
      return res.status(200).send("Evento ignorado por falta de datos.");
    }

    try {
      const items = await Carrito.findAll({
        where: { id_cliente },
        include: [{ model: Producto, as: "producto" }]
      });

      if (items.length === 0) {
        console.warn("⚠️ Carrito vacío. No se registró venta.");
        return res.status(400).send({ message: "Carrito vacío." });
      }

      let total = 0;
      items.forEach(item => {
        total += item.cantidad * item.producto.precio_unitario;
      });

      const venta = await Venta.create({ id_cliente, total });

      for (const item of items) {
        await DetalleVenta.create({
          id_venta: venta.id,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio_unitario
        });

        const inventario = await Inventario.findOne({
          where: { id_producto: item.id_producto }
        });

        if (inventario) {
          inventario.cantidad -= item.cantidad;
          await inventario.save();
        }
      }

      await Carrito.destroy({ where: { id_cliente } });

      console.log("✅ Venta registrada:", venta.id);
      console.log("🧹 Carrito eliminado para cliente:", id_cliente);
      res.status(200).send("Venta registrada");
    } catch (err) {
      console.error("❌ Error al registrar venta:", err.message);
      res.status(500).send({ message: err.message });
    }
  } else {
    console.log("📭 Evento ignorado:", event.type);
    res.status(200).send("Evento ignorado");
  }
};