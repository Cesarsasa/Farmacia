module.exports = app => {
    const rol= require("../controllers/rol.controller.js");
    var  router = require("express").Router();
    // Create a new Client
    router.post("/create/", rol.create);
    // Retrieve all Client
    router.get("/", rol.findAll);
    // Retrieve all published Client
   // router.get("/status", clientes.findAllStatus);
    // Retrieve a single Client with id
    router.get("/:id", rol.findOne);
    // Update a Client with id
    router.put("/update/:id",rol.update);
    // Delete a Client with id
    router.delete("/delete/:id", rol.delete);
    // Delete all Cliente
    router.delete("/delete/", rol.deleteAll);
    // Podemos utilizar como una ocpion app.use("EndPoint",router" para simplicar el URI
    // Ej.  http://localhost:Puerto/api/cliente/
    app.use("/api/rol", router);
};