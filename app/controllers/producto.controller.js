const db = require("../models");
const Producto = db.productos;
const Op = db.Sequelize.Op;

// Create and Save a new Client
exports.create = (req, res) => {
    if (!req.body.nombre) {
        res.status(400).send({ message: "El nombre no puede estar vacío." });
        return;
    }

    const producto = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio_unitario: req.body.precio_unitario,
        id_proveedor: req.body.id_proveedor
    };

    Producto.create(producto)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ocurrió un error al crear el cliente."
            });
        });
};

// Retrieve all Clients
exports.findAll = (req, res) => {
    const nombre = req.query.nombre;
    const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

    Producto.findAll({ where: condition })
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al recuperar los clientes."
            });
        });
};

// Find one Client by ID
exports.findOne = (req, res) => {
    const id = req.params.id;

    Producto.findByPk(id)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: "Error al recuperar el cliente con id=" + id
            });
        });
};

// Update Client by ID
exports.update = (req, res) => {
    const id = req.params.id;

    Producto.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Cliente actualizado correctamente." });
            } else {
                res.send({ message: `No se pudo actualizar el cliente con id=${id}.` });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al actualizar el cliente con id=" + id
            });
        });
};

// Delete Client by ID
exports.delete = (req, res) => {
    const id = req.params.id;

    Producto.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Cliente eliminado correctamente." });
            } else {
                res.send({ message: `No se encontró el cliente con id=${id}.` });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al eliminar el cliente con id=" + id
            });
        });
};

// Delete all Clients
exports.deleteAll = (req, res) => {
    Producto.destroy({ where: {}, truncate: false })
        .then(nums => {
            res.send({ message: `${nums} clientes fueron eliminados.` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al eliminar todos los clientes."
            });
        });
};