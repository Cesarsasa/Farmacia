const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const stripeController = require("../controllers/stripe.controller");

router.post("/crear-sesion", stripeController.crearSesionPago);


module.exports = router;