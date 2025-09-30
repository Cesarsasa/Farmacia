const db = require("../models");
const Sucursal = db.sucursales;
const Op = db.Sequelize.Op;

// Create and Save a new Client
exports.create = (req, res) => {
    if (!req.body.nombre) {
        res.status(400).send({ message: "El nombre no puede estar vacío." });
        return;
    }

    const sucursal = {
        nombre: req.body.nombre,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
    };

    Sucursal.create(sucursal)
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ocurrió un error al crear el sucursal."
            });
        });
};

// Retrieve all Clients
exports.findAll = (req, res) => {
    const nombre = req.query.nombre;
    const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

    Sucursal.findAll({ where: condition })
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

    Sucursal.findByPk(id)
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

    Sucursal.update(req.body, { where: { id: id } })
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

    Sucursal.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Cliente eliminado correctamente." });
            } else {
                res.send({ message: `No se encontró el sucs con id=${id}.` });
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
    Sucursal.destroy({ where: {}, truncate: false })
        .then(nums => {
            res.send({ message: `${nums} sucursal fueron eliminados.` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al eliminar todos lo sucursal."
            });
        });
};