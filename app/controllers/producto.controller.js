const db = require("../models");
const Producto = db.productos;
const Proveedor = db.proveedores;
const Op = db.Sequelize.Op;

// Create and Save a new Product
exports.create = (req, res) => {
    if (!req.body.nombre || !req.body.precio_unitario) {
        res.status(400).send({ 
            message: "El nombre y precio unitario son obligatorios." 
        });
        return;
    }

    const producto = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio_unitario: req.body.precio_unitario,
        imagen_url: req.body.imagen_url,
        id_proveedor: req.body.id_proveedor
    };
console.log("Datos recibidos:", req.body);

    Producto.create(producto)
        .then(data => res.status(201).send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ocurrió un error al crear el producto."
            });
        });
};

// Retrieve all Products
exports.findAll = (req, res) => {
  const nombre = req.query.nombre;
  const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : undefined;

  Producto.findAll({
    where: condition,
    include: {
      model: Proveedor,
      as: "proveedor",
      attributes: ["id", "nombre"]
    }
  })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al recuperar los productos."
      });
    });
};


// Find one Product by ID
exports.findOne = (req, res) => {
    const id = req.params.id;

    Producto.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({ 
                    message: `No se encontró el producto con id=${id}.` 
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al recuperar el producto con id=" + id
            });
        });
};

// Update Product by ID
exports.update = (req, res) => {
    const id = req.params.id;

    Producto.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Producto actualizado correctamente." });
            } else {
                res.status(404).send({ 
                    message: `No se pudo actualizar el producto con id=${id}.` 
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al actualizar el producto con id=" + id
            });
        });
};

// Delete Product by ID
exports.delete = (req, res) => {
    const id = req.params.id;

    Producto.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Producto eliminado correctamente." });
            } else {
                res.status(404).send({ 
                    message: `No se encontró el producto con id=${id}.` 
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al eliminar el producto con id=" + id
            });
        });
};

// Delete all Products
exports.deleteAll = (req, res) => {
    Producto.destroy({ where: {}, truncate: false })
        .then(nums => {
            res.send({ message: `${nums} productos fueron eliminados.` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al eliminar todos los productos."
            });
        });
};