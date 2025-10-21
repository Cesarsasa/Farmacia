const db = require("../models");
const Sucursal = db.sucursales;
const Op = db.Sequelize.Op;

// Crear una nueva sucursal
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
        .then(data => res.status(201).send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ocurrió un error al crear la sucursal."
            });
        });
};

// Obtener todas las sucursales
exports.findAll = (req, res) => {
    const nombre = req.query.nombre;
    const condition = nombre ? { nombre: { [Op.iLike]: `%${nombre}%` } } : null;

    Sucursal.findAll({ where: condition })
        .then(data => res.send(data))
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al recuperar las sucursales."
            });
        });
};

// Obtener una sucursal por ID
exports.findOne = (req, res) => {
    const id = req.params.id;

    Sucursal.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({ 
                    message: `No se encontró la sucursal con id=${id}.` 
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al recuperar la sucursal con id=" + id
            });
        });
};

// Actualizar sucursal por ID
exports.update = (req, res) => {
    const id = req.params.id;

    Sucursal.update(req.body, { where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Sucursal actualizada correctamente." });
            } else {
                res.status(404).send({ 
                    message: `No se pudo actualizar la sucursal con id=${id}.` 
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al actualizar la sucursal con id=" + id
            });
        });
};

// Eliminar sucursal por ID
exports.delete = (req, res) => {
    const id = req.params.id;

    Sucursal.destroy({ where: { id: id } })
        .then(num => {
            if (num == 1) {
                res.send({ message: "Sucursal eliminada correctamente." });
            } else {
                res.status(404).send({ 
                    message: `No se encontró la sucursal con id=${id}.` 
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: "Error al eliminar la sucursal con id=" + id
            });
        });
};

// Eliminar todas las sucursales
exports.deleteAll = (req, res) => {
    Sucursal.destroy({ where: {}, truncate: false })
        .then(nums => {
            res.send({ message: `${nums} sucursales fueron eliminadas.` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al eliminar todas las sucursales."
            });
        });
};