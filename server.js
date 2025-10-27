require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const stripeController = require("./app/controllers/stripe.controller");

const app = express();
const PORT = process.env.PORT || 8082;

// CORS
const corsOptions = {
  origin: process.env.HOST_FRONTEND || "http://localhost:5173"
};
app.use(cors(corsOptions));

// ⚠️ Webhook de Stripe debe ir ANTES del bodyParser.json()
app.post("/api/stripe/webhook", bodyParser.raw({ type: "application/json" }), stripeController.webhookStripe);

// Middleware para JSON (después del webhook)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Base de datos
const db = require("./app/models");
db.sequelize.sync({ alter: true }).then(() => {
  console.log("🗄️ Base de datos sincronizada con cambios.");
});

// Ruta base
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Application" });
});

// Rutas de la app
require("./app/routes/cliente.routes")(app);
require("./app/routes/sucursal.routes")(app);
require("./app/routes/producto.routes")(app);
require("./app/routes/inventario.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/usuario.routes")(app);
require("./app/routes/rol.routes")(app);
require("./app/routes/proveedor.routes")(app);
require("./app/routes/venta.routes")(app);
require("./app/routes/factura.routes")(app);
require("./app/routes/transaccion.routes")(app);
require("./app/routes/carrito.routes")(app);
require("./app/routes/stripe.routes")(app); // ✅ Esta línea ya registra /api/stripe/checkout

// Swagger
const swaggerDocs = require("./swagger");
swaggerDocs(app);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
/*
require("dotenv").config();
const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");
const cors = require("cors");

const stripeRoutes = require("./app/routes/stripe.routes");
const stripeController = require("./app/controllers/stripe.controller");
const app = express();

var corsOptions = {
  origin: "http://localhost:5173"
};

app.use(cors(corsOptions));

// ✅ IMPORTANTE: El webhook debe estar ANTES de cualquier otro middleware que parse el body
app.post(
  "/api/stripe/webhook", 
  express.raw({ type: "application/json" }), 
  stripeController.webhookStripe
);

// ✅ Middlewares para el resto de rutas (DESPUÉS del webhook)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Base de datos
const db = require("./app/models");
db.sequelize.sync({ alter: true }).then(() => {
  console.log("Base de datos sincronizada con cambios.");
});

// Rutas básicas
app.get("/", (req, res) => {
  res.json({ message: "UMG Web Application" });
});

// Rutas de la app
require("./app/routes/cliente.routes")(app);
require("./app/routes/sucursal.routes")(app);
require("./app/routes/producto.routes")(app);
require("./app/routes/inventario.routes")(app);
require("./app/routes/auth.routes")(app);
require("./app/routes/usuario.routes")(app);
require("./app/routes/rol.routes")(app);
require("./app/routes/proveedor.routes")(app);
require("./app/routes/venta.routes")(app);
require("./app/routes/factura.routes")(app);
require("./app/routes/transaccion.routes")(app);
require("./app/routes/carrito.routes")(app);

// ✅ Esta línea ya no es necesaria si usas la ruta directa de arriba
// app.use("/api/stripe", stripeRoutes);

// Swagger
const swaggerDocs = require("./swagger");
swaggerDocs(app);

// Iniciar servidor
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
  console.log(`📍 Webhook Stripe disponible en: http://localhost:${PORT}/webhook/stripe`);
});*/