require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const stripeController = require("./app/controllers/stripe.controller");

const app = express();

const corsOptions = { origin: process.env.HOST_FRONTEND };
app.use(cors(corsOptions));

app.post("/api/stripe/webhook", bodyParser.raw({ type: "application/json" }), stripeController.webhookStripe);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./app/models");
db.sequelize.sync({ alter: true });

app.get("/", (req, res) => res.json({ message: "UMG Web Application" }));

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
require("./app/routes/stripe.routes")(app);

module.exports = app;