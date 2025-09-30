module.exports = app => {
    const sucursals= require("../controllers/sucursal.controller.js");
    var router = require("express").Router();
    // Create a new Client
    router.post("/create/", sucursals.create);
    // Retrieve all Client
    router.get("/", sucursals.findAll);
    // Retrieve all published Client
   // router.get("/status", clientes.findAllStatus);
    // Retrieve a single Client with ids
    router.get("/:id", sucursals.findOne);
    // Update a Client with id
    router.put("/update/:id", sucursals.update);
    // Delete a Client with id
    router.delete("/delete/:id", sucursals.delete);
    // Delete all Cliente
    router.delete("/delete/",sucursals.deleteAll);
    // Podemos utilizar como una ocpion app.use("EndPoint",router" para simplicar el URI
    // Ej.  http://localhost:Puerto/api/cliente/
    app.use("/api/sucursal", router);
};