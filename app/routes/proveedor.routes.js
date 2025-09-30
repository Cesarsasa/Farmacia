module.exports = app => {
    const proveedor= require("../controllers/proveedor.controller.js");
    var router = require("express").Router();
    // Create a new Client
    router.post("/create/", proveedor.create);
    // Retrieve all Client
    router.get("/", proveedor.findAll);
    // Retrieve all published Client
   // router.get("/status", clientes.findAllStatus);
    // Retrieve a single Client with ids
    router.get("/:id", proveedor.findOne);
    // Update a Client with id
    router.put("/update/:id", proveedor.update);
    // Delete a Client with id
    router.delete("/delete/:id", proveedor.delete);
    // Delete all Cliente
    router.delete("/delete/",proveedor.deleteAll);
    // Podemos utilizar como una ocpion app.use("EndPoint",router" para simplicar el URI
    // Ej.  http://localhost:Puerto/api/cliente/
    app.use("/api/prov", router);
};