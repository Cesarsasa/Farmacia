const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../models");
const Venta = db.ventas;
const DetalleVenta = db.detalle_ventas;
const Inventario = db.inventarios;
const Carrito = db.carritos;

const bodyParser = require("body-parser");

// Stripe requiere el cuerpo sin procesar para verificar la firma
router.post("/webhook", bodyParser.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Error al verificar firma:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    const id_cliente = session.client_reference_id;
    const id_usuario = session.metadata.id_usuario;
    const id_sucursal = session.metadata.id_sucursal;

    try {
      const items = await Carrito.findAll({
        where: { id_cliente },
        include: [{ model: db.productos, as: "producto" }]
      });

      if (items.length === 0) return res.status(400).send({ message: "Carrito vacío." });

      let total = 0;
      items.forEach(item => {
        total += item.cantidad * item.producto.precio_unitario;
      });

      const venta = await Venta.create({
        id_cliente,
        id_usuario,
        id_sucursal,
        total
      });

      for (const item of items) {
        await DetalleVenta.create({
          id_venta: venta.id,
          id_producto: item.id_producto,
          cantidad: item.cantidad,
          precio_unitario: item.producto.precio_unitario
        });

        const inventario = await Inventario.findOne({
          where: { id_producto: item.id_producto, id_sucursal }
        });

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
});