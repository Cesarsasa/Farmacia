const db = require("../models");
const Inventario = db.inventarios;
const Op = db.Sequelize.Op;

// Create and Save a new Inventory
exports.create = (req, res) => {
    if (!req.body.cantidad || !req.body.id_producto || !req.body.id_sucursal) {
        res.status(400).send({ 
            message: "La cantidad, id_producto e id_sucursal son obligatorios." 
        });
        return;
    }

    const inventario = {
        cantidad: req.body.cantidad,
        id_producto: req.body.id_producto,
        id_sucursal: req.body.id_sucursal
    };

    Inventario.create(inventario)
        .then(data => res.status(201).send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ocurrió un error al crear el registro de inventario."
            });
        });
};

// Retrieve all Inventory
exports.findAll = (req, res) => {
    const cantidad = req.query.cantidad;
    const condition = cantidad ? { cantidad: { [Op.iLike]: `%${cantidad}%` } } : null;

    Inventario.findAll({ where: condition })
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al recuperar los registros de inventario."
            });
        });
};

// Find one Inventory by ID
exports.findOne = (req, res) => {
    const id = req.params.id;

    Inventario.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({ 
                    message: `No se encontró el inventario con id=${id}.` 
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al recuperar el inventario con id=" + id
            });
        });
};

// Update Inventory by ID
exports.update = (req, res) => {
    const id = req.params.id;

    Inventario.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Inventario actualizado correctamente." });
            } else {
                res.status(404).send({ 
                    message: `No se pudo actualizar el inventario con id=${id}.` 
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al actualizar el inventario con id=" + id
            });
        });
};

// Delete Inventory by ID
exports.delete = (req, res) => {
    const id = req.params.id;

    Inventario.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Inventario eliminado correctamente." });
            } else {
                res.status(404).send({ 
                    message: `No se encontró el inventario con id=${id}.` 
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al eliminar el inventario con id=" + id
            });
        });
};

// Delete all Inventory
exports.deleteAll = (req, res) => {
    Inventario.destroy({ where: {}, truncate: false })
        .then(nums => {
            res.send({ message: `${nums} registros de inventario fueron eliminados.` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al eliminar todos los registros de inventario."
            });
        });
};