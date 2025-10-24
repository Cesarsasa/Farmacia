module.exports = app => {
  const stripe = require("../controllers/stripe.controller.js");
  const router = require("express").Router();

  // 🎯 Ruta para crear sesión de pago
  // POST /api/stripe/checkout
  router.post("/checkout", stripe.crearSesionPago);

  // 📡 Ruta para recibir eventos de Stripe (webhook)
  // Esta ruta debe estar registrada en server.js con bodyParser.raw
  // POST /api/stripe/webhook → definida directamente en server.js

  app.use("/api/stripe", router);
};