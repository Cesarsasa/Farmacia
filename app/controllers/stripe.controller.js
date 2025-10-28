const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../models");
const Carrito = db.carritos;
const Producto = db.productos;
const Venta = db.ventas;
const DetalleVenta = db.detalle_ventas;
const Inventario = db.inventarios;

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
const hostfrontend = process.env.HOST_FRONTEND ;
const tipoCambioGTQ_USD = 7.9;

/**
 * @route POST /api/stripe/checkout
 * @desc Crea sesión de pago en Stripe
 */
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
      success_url: `${process.env.HOST_FRONTEND}/factura/opc`,
      cancel_url:  `${process.env.HOST_FRONTEND}/cancel`
    });

    res.send({ url: session.url });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

/**
 * @route POST /api/stripe/webhook
 * @desc Recibe eventos de Stripe
 */
exports.webhookStripe = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Firma inválida:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const id_cliente = session.client_reference_id;

    try {
      const items = await Carrito.findAll({
        where: { id_cliente },
        include: [{ model: Producto, as: "producto" }]
      });

      if (items.length === 0) return res.status(400).send({ message: "Carrito vacío." });

      let total = 0;
      items.forEach(item => {
        total += item.cantidad * item.producto.precio_unitario;
      });

      const venta = await Venta.create({
  id_cliente,
  id_usuario: 23,
  id_sucursal: 9,  // ✅ Usuario fijo para ventas web
  total
});


      for (const item of items) {
        await DetalleVenta.create({
          id_venta: venta.id,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio_unitario
        });

        const inventario = await Inventario.findOne({ where: { id_producto: item.id_producto } });
        if (inventario) {
          inventario.cantidad -= item.cantidad;
          await inventario.save();
        }
      }

      await Carrito.destroy({ where: { id_cliente } });

      console.log("✅ Venta registrada:", venta.id);
      res.status(200).send("Venta registrada");
    } catch (err) {
      console.error("❌ Error al registrar venta:", err.message);
      res.status(500).send({ message: err.message });
    }
  } else {
    res.status(200).send("Evento ignorado");
  }
};