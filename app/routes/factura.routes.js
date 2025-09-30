module.exports = app => {
  const factura = require("../controllers/factura.controller.js");
  const router = require("express").Router();

  // Crear una nueva factura a partir de una venta
  router.post("/create", factura.create);

  // Obtener todas las facturas
  router.get("/", factura.findAll);

  // Obtener una factura por ID
  router.get("/:id", factura.findOne);

  // Eliminar una factura por ID
  router.delete("/delete/:id", factura.delete);

  // Registrar el grupo de rutas bajo /api/facturas
    router.get("/pdf/:id", factura.generarFacturaPDF);
  app.use("/api/facturas", router);
  
};