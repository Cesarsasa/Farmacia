const db = require("../models");
const Venta = db.ventas;
const DetalleVenta = db.detalle_ventas;
const Producto = db.productos;
const Sequelize = db.Sequelize;

// Crear una venta con sus detalles

const Inventario = db.inventarios;

exports.create = async (req, res) => {
  const { id_usuario, id_cliente, id_sucursal, detalle_ventas } = req.body;

  try {
    // Validar inventario
    for (const item of detalle_ventas) {
      const inventario = await Inventario.findOne({
        where: {
          id_producto: item.id_producto,
          id_sucursal: id_sucursal
        }
      });

      if (!inventario || inventario.cantidad < item.cantidad) {
        return res.status(400).send({
          message: `No hay suficiente inventario de ${item.id_producto} en la sucursal ${id_sucursal}.`
        });
      }
    }

    // Calcular total
    let total = 0;
    for (const item of detalle_ventas) {
      total += item.precio_unitario * item.cantidad;
    }

    // Crear venta
    const venta = await Venta.create({
      id_usuario,
      id_cliente,
      id_sucursal,
      total
    });

    // Crear detalles
    for (const item of detalle_ventas) {
      await DetalleVenta.create({
        id_venta: venta.id,
        ...item
      });

      // Actualizar inventario
      await Inventario.decrement("cantidad", {
        by: item.cantidad,
        where: {
          id_producto: item.id_producto,
          id_sucursal: id_sucursal
        }
      });
    }

    res.status(201).send({ message: "Venta registrada correctamente.", venta });
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "Error al registrar la venta." });
  }
};

// Obtener todas las ventas
exports.findAll = (req, res) => {
  Venta.findAll({
  include: [
    { association: "cliente" },
    { association: "usuario" },
    { association: "sucursal" },
    {
      association: "detalle_ventas",
      include: ["producto"]
    }
  ],
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
