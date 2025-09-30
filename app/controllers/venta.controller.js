const db = require("../models");
const Venta = db.ventas;
const DetalleVenta = db.detalle_ventas;
const Producto = db.productos;
const Sequelize = db.Sequelize;

// Crear una venta con sus detalles
exports.create = async (req, res) => {
  const { id_usuario, id_cliente, id_sucursal, detalles } = req.body;

  if (!detalles || detalles.length === 0) {
    return res.status(400).send({ message: "La venta debe tener al menos un producto." });
  }

  try {
    // Calcular total
    let total = 0;
    for (const item of detalles) {
      total += item.precio_unitario * item.cantidad;
    }

    // Crear la venta
    const venta = await Venta.create({
      id_usuario,
      id_cliente,
      id_sucursal,
      total
    });

    // Registrar los detalles
    for (const item of detalles) {
      await DetalleVenta.create({
        id_venta: venta.id,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario
      });
    }

    res.status(201).send({ 
      message: "Venta registrada correctamente", 
      ventaId: venta.id,
      total: total
    });
  } catch (err) {
    res.status(500).send({ message: err.message || "Error al registrar la venta." });
  }
};

// Obtener todas las ventas
exports.findAll = (req, res) => {
  Venta.findAll({
    include: [{
      association: "detalle_ventas",
      include: ["producto"]
    }],
    order: [["fecha", "DESC"]]
  })
    .then(data => res.send(data))
    .catch(err => {
      res.status(500).send({
        message: err.message || "Error al recuperar las ventas."
      });
    });
};

// Obtener una venta por ID
exports.findOne = (req, res) => {
  const id = req.params.id;

  Venta.findByPk(id, {
    include: [{
      association: "detalle_ventas",
      include: ["producto"]
    }]
  })
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({ message: `No se encontró la venta con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al recuperar la venta con id=" + id
      });
    });
};

// Actualizar una venta
exports.update = (req, res) => {
  const id = req.params.id;

  Venta.update(req.body, { where: { id: id } })
    .then(num => {
      if (num == 1) {
        res.send({ message: "Venta actualizada correctamente." });
      } else {
        res.status(404).send({ message: `No se pudo actualizar la venta con id=${id}.` });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error al actualizar la venta con id=" + id
      });
    });
};

// Eliminar una venta
exports.delete = async (req, res) => {
  const id = req.params.id;

  try {
    // Eliminar detalles primero
    await DetalleVenta.destroy({ where: { id_venta: id } });

    // Luego eliminar la venta
    const num = await Venta.destroy({ where: { id: id } });

    if (num == 1) {
      res.send({ message: "Venta eliminada correctamente." });
    } else {
      res.status(404).send({ message: `No se encontró la venta con id=${id}.` });
    }
  } catch (err) {
    res.status(500).send({
      message: "Error al eliminar la venta con id=" + id
    });
  }
};