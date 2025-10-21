const db = require("../models");
const Cliente = db.clientes;
const Op = db.Sequelize.Op;
const bcrypt = require("bcrypt");

// Create and Save a new Client
exports.create = (req, res) => {
  if (!req.body.nombre || !req.body.correo || !req.body.contrasena) {
    res.status(400).send({ message: "Nombre, correo y contraseña son obligatorios." });
    return;
  }

    const cliente = {
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        nit: req.body.nit,
        contrasena: req.body.contrasena,
        direccion: req.body.direccion,
        telefono: req.body.telefono,
        correo: req.body.correo
    };

    Cliente.create(cliente)
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

    Cliente.findAll({ where: condition })
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

    Cliente.findByPk(id)
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

    Cliente.update(req.body, { where: { id: id } })
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

    Cliente.destroy({ where: { id: id } })
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
    Cliente.destroy({ where: {}, truncate: false })
        .then(nums => {
            res.send({ message: `${nums} clientes fueron eliminados.` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Error al eliminar todos los clientes."
            });
        });
};


Cliente.beforeCreate(async (cliente, options) => {
  const salt = await bcrypt.genSalt(10);
  cliente.contrasena = await bcrypt.hash(cliente.contrasena, salt);
});

Cliente.beforeUpdate(async (cliente, options) => {
  if (cliente.changed("contrasena")) {
    const salt = await bcrypt.genSalt(10);
    cliente.contrasena = await bcrypt.hash(cliente.contrasena, salt);
  }
});
