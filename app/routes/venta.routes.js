module.exports = app => {
  const venta = require("../controllers/venta.controller.js");
  const router = require("express").Router();

  // Crear una nueva venta con sus detalles
  router.post("/create", venta.create);

  // Obtener todas las ventas
  router.get("/", venta.findAll);

  // Obtener una venta por ID
  router.get("/:id", venta.findOne);

  // Actualizar una venta por ID
  router.put("/update/:id", venta.update);

  // Eliminar una venta por ID (y sus detalles)
  router.delete("/delete/:id", venta.delete);

  // Registrar el grupo de rutas bajo /api/ventas
  app.use("/api/ventas", router);
};