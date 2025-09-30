module.exports = app => {
  const transaccion = require("../controllers/transaccion.controller.js");
  const router = require("express").Router();

  // Crear una nueva transacción
  router.post("/create", transaccion.create);

  // Obtener todas las transacciones
  router.get("/", transaccion.findAll);

  // Obtener una transacción por ID
  router.get("/:id", transaccion.findOne);

  // Eliminar una transacción por ID
  router.delete("/delete/:id", transaccion.delete);

  // Registrar el grupo de rutas bajo /api/transacciones
  app.use("/api/transacciones", router);
};