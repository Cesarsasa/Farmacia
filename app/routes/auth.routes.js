module.exports = app => {
  const auth = require("../controllers/auth.controller.js");
  const router = require("express").Router();

  router.post("/login-cliente", auth.loginCliente);
  router.post("/login-empleado", auth.loginEmpleado);

  app.use("/api/auth", router);
};