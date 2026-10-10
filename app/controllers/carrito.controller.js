const db = require("../models");
const Carrito = db.carritos;
const Producto = db.productos;
const Venta = db.ventas;
const DetalleVenta = db.detalle_ventas;
const Inventario = db.inventarios;
const Cliente = db.clientes;
const Sucursal = db.sucursals;
const Usuario = db.usuarios;
const Sequelize = db.Sequelize;
const Op = Sequelize.Op;

// 1. Agregar producto al carrito
exports.agregar = async (req, res) => {
  const { id_cliente, id_producto, cantidad } = req.body;

  if (!id_cliente || !id_producto || !cantidad) {
    return res.status(400).send({ message: "Datos incompletos." });
  }

  try {
    const existente = await Carrito.findOne({ where: { id_cliente, id_producto } });

    if (existente) {
      existente.cantidad += cantidad;
      await existente.save();
      return res.send(existente);
    }

    const nuevo = await Carrito.create({ id_cliente, id_producto, cantidad });
    res.status(201).send(nuevo);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 2. Ver contenido del carrito
exports.verCarrito = async (req, res) => {
  const id_cliente = req.params.id_cliente;

  try {
    const items = await Carrito.findAll({
      where: { id_cliente },
      include: [
        { model: Producto, as: "producto"},
         { model: Cliente, as: "cliente" }
        ]
    });

    res.send(items);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 3. Actualizar cantidad
// - cantidad inválida (no entera o negativa) -> 400
// - cantidad 0 -> se elimina el ítem del carrito
exports.actualizarCantidad = async (req, res) => {
  const { id_cliente, id_producto } = req.body;
  const cantidad = Number(req.body.cantidad);

  if (!Number.isInteger(cantidad) || cantidad < 0) {
    return res.status(400).send({ message: "La cantidad debe ser un entero mayor o igual a 0." });
  }

  try {
    const item = await Carrito.findOne({ where: { id_cliente, id_producto } });

    if (!item) return res.status(404).send({ message: "Producto no encontrado en el carrito." });

    if (cantidad === 0) {
      await item.destroy();
      return res.send({ message: "Producto eliminado del carrito." });
    }

    item.cantidad = cantidad;
    await item.save();
    res.send(item);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 4. Eliminar producto del carrito
exports.eliminarItem = async (req, res) => {
  const { id_cliente, id_producto } = req.body;

  try {
    const eliminado = await Carrito.destroy({ where: { id_cliente, id_producto } });
    res.send({ message: "Producto eliminado del carrito." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 5. Vaciar carrito
exports.vaciarCarrito = async (req, res) => {
  const id_cliente = req.params.id_cliente;

  try {
    await Carrito.destroy({ where: { id_cliente } });
    res.send({ message: "Carrito vaciado." });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

// 6. Confirmar compra → genera venta
// Valida el stock ANTES de crear la venta y todo corre en una transacción:
// si algo falla no queda una venta huérfana ni el carrito a medias.
exports.confirmarCompra = async (req, res) => {
  const { id_cliente, id_usuario, id_sucursal } = req.body;
  const t = await db.sequelize.transaction();

  try {
    const items = await Carrito.findAll({
      where: { id_cliente },
      include: [{ model: Producto, as: "producto" },
                { model: Cliente, as: "cliente" }],
      transaction: t
    });

    if (items.length === 0) {
      await t.rollback();
      return res.status(400).send({ message: "Carrito vacío." });
    }

    // 1) Validar stock de todos los ítems antes de escribir nada
    const inventarios = new Map();
    for (const item of items) {
      const inventario = await Inventario.findOne({
        where: { id_producto: item.id_producto, id_sucursal },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!inventario || inventario.cantidad < item.cantidad) {
        await t.rollback();
        return res.status(400).send({
          message: `Stock insuficiente para "${item.producto.nombre}".`
        });
      }
      inventarios.set(item.id_producto, inventario);
    }

    // 2) Crear la venta, el detalle y descontar inventario
    let total = 0;
    items.forEach(item => {
      total += item.cantidad * item.producto.precio_unitario;
    });

    const venta = await Venta.create(
      { id_cliente, id_usuario, id_sucursal, total },
      { transaction: t }
    );

    for (const item of items) {
      await DetalleVenta.create({
        id_venta: venta.id,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: item.producto.precio_unitario
      }, { transaction: t });

      const inventario = inventarios.get(item.id_producto);
      inventario.cantidad -= item.cantidad;
      await inventario.save({ transaction: t });
    }

    await Carrito.destroy({ where: { id_cliente }, transaction: t });

    await t.commit();
    res.send({ message: "Compra confirmada.", venta });
  } catch (err) {
    await t.rollback();
    res.status(500).send({ message: err.message });
  }
};