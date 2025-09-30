module.exports = app => {
    const productos= require("../controllers/producto.controller.js");
    var router  = require("express").Router();
    // Create a new Client
    router.post("/create/", productos.create);
    // Retrieve all Client
    router.get("/", productos.findAll);
    // Retrieve all published Client
   // router.get("/status", clientes.findAllStatus);
    // Retrieve a single Client with id
    router.get("/:id", productos.findOne);
    // Update a Client with id
    router.put("/update/:id",productos.update);
    // Delete a Client with id
    router.delete("/delete/:id", productos.delete);
    // Delete all Cliente
    router.delete("/delete/",productos.deleteAll);
    // Podemos utilizar como una ocpion app.use("EndPoint",router" para simplicar el URI
    // Ej.  http://localhost:Puerto/api/cliente/
    app.use("/api/producto", router);
};