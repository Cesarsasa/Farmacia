module.exports = app => {
    const inventarios= require("../controllers/inventario.controller.js");
    var  router = require("express").Router();
    // Create a new Client
    router.post("/create/", inventarios.create);
    // Retrieve all Client
    router.get("/", inventarios.findAll);
    // Retrieve all published Client
   // router.get("/status", clientes.findAllStatus);
    // Retrieve a single Client with id
    router.get("/:id", inventarios.findOne);
    // Update a Client with id
    router.put("/update/:id",inventarios.update);
    // Delete a Client with id
    router.delete("/delete/:id", inventarios.delete);
    // Delete all Cliente
    router.delete("/delete/",inventarios.deleteAll);
    // Podemos utilizar como una ocpion app.use("EndPoint",router" para simplicar el URI
    // Ej.  http://localhost:Puerto/api/cliente/
    app.use("/api/inventario", router);
};