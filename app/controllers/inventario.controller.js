const db = require("../models");
const Inventario = db.inventarios;
const Op = db.Sequelize.Op;

// Create and Save a new Client
exports.create = (req, res) => {
    if (!req.body.cantidad) {
        res.status(400).send({ message: "El nombre no puede estar vacío." });
        return;
    }

    const inventario = {
        cantidad: req.body.cantidad,
        id_producto: req.body.id_producto,
        id_sucursal: req.body.id_sucursal
    };

    Inventario.create(inventario)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ocurrió un error al crear el cliente."
            });
        });
};

// Retrieve all Clients
exports.findAll = (req, res) => {
    const  cantidad= req.query. cantidad;
    const condition =  cantidad ? {  cantidad: { [Op.iLike]: `%${ cantidad}%` } } : null;

    Inventario.findAll({ where: condition })
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

    Inventario.findByPk(id)
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

    Inventario.update(req.body, { where: { id: id } })
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

   Inventario.destroy({ where: { id: id } })
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
   Inventario.destroy({ where: {}, truncate: false })
        .then(nums => {
            res.send({ message: `${nums} clientes fueron eliminados.` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al eliminar todos los clientes."
            });
        });
};