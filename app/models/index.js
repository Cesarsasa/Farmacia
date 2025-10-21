const dbConfig = require("../config/db.config.js");
const Sequelize = require("sequelize");

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
  }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Importar modelos
db.carritos= require("./carrito.model.js")(sequelize, Sequelize);
db.clientes = require("./cliente.model.js")(sequelize, Sequelize);
db.sucursales = require("./sucursal.model.js")(sequelize, Sequelize);
db.productos = require("./producto.model.js")(sequelize, Sequelize);
db.inventarios = require("./inventario.model.js")(sequelize, Sequelize);
db.ventas = require("./venta.model.js")(sequelize, Sequelize);
db.usuarios = require("./usuario.model.js")(sequelize, Sequelize);
db.rols = require("./rol.model.js")(sequelize, Sequelize);
db.proveedores = require("./proveedor.model.js")(sequelize, Sequelize);
db.detalle_ventas= require("./detalle_venta.model.js")(sequelize, Sequelize);
db.facturas = require("./factura.model.js")(sequelize, Sequelize);
db.movimiento_inventarios = require("./movimiento_inventario.model.js")(sequelize, Sequelize);
db.transacciones = require("./transaccion.model.js")(sequelize, Sequelize);

// Ejecutar asociaciones
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
db.productos.hasMany(db.inventarios, { foreignKey: 'id_producto' });
db.inventarios.belongsTo(db.productos, { foreignKey: 'id_producto' });
db.ventas.hasMany(db.detalle_ventas, { foreignKey: 'id_venta', as: 'detalle_ventas' });
db.detalle_ventas.belongsTo(db.ventas, { foreignKey: 'id_venta' });

db.productos.hasMany(db.detalle_ventas, { foreignKey: 'id_producto' });
db.detalle_ventas.belongsTo(db.productos, { foreignKey: 'id_producto' });
db.clientes.hasMany(db.ventas, { foreignKey: 'id_cliente' });
db.ventas.belongsTo(db.clientes, { foreignKey: 'id_cliente' });
db.usuarios.hasMany(db.ventas, { foreignKey: 'id_usuario' });
db.ventas.belongsTo(db.usuarios, { foreignKey: 'id_usuario' });
db.sucursales.hasMany(db.ventas, { foreignKey: 'id_sucursal' });
db.ventas.belongsTo(db.sucursales, { foreignKey: 'id_sucursal' });
db.rols.hasMany(db.usuarios, { foreignKey: 'id_rol' });
db.usuarios.belongsTo(db.rols, { foreignKey: 'id_rol' });
db.facturas.hasMany(db.transacciones, { foreignKey: 'id_factura' });
db.transacciones.belongsTo(db.facturas, { foreignKey: 'id_factura' });
db.proveedores.hasMany(db.productos, { foreignKey: 'id_proveedor' });
db.productos.belongsTo(db.proveedores, { foreignKey: 'id_proveedor' });
db.productos.hasMany(db.movimiento_inventarios, { foreignKey: 'id_producto' });
db.movimiento_inventarios.belongsTo(db.productos, { foreignKey: 'id_producto' });
db.sucursales.hasMany(db.movimiento_inventarios, { foreignKey: 'id_sucursal' });
db.movimiento_inventarios.belongsTo(db.sucursales, { foreignKey: 'id_sucursal' });

db.sucursales.hasMany(db.movimiento_inventarios, { foreignKey: 'id_sucursal' });
db.movimiento_inventarios.belongsTo(db.sucursales, { foreignKey: 'id_sucursal' });

db.facturas.belongsTo(db.ventas, { foreignKey: 'id_venta', as: 'venta' });
db.ventas.hasOne(db.facturas, { foreignKey: 'id_venta', as: 'factura' });

db.sucursales.hasMany(db.inventarios, { foreignKey: 'id_sucursal' });
db.inventarios.belongsTo(db.sucursales, { foreignKey: 'id_sucursal' });


db.sucursales.hasMany(db.usuarios, { foreignKey: 'id_sucursal' });
db.usuarios.belongsTo(db.sucursales, { foreignKey: 'id_sucursal' });
// Carrito pertenece a Cliente
db.carritos.belongsTo(db.clientes, { foreignKey: 'id_cliente', as: 'cliente' });
db.clientes.hasMany(db.carritos, { foreignKey: 'id_cliente', as: 'carrito' });

// Carrito pertenece a Producto
db.carritos.belongsTo(db.productos, { foreignKey: 'id_producto', as: 'producto' });
db.productos.hasMany(db.carritos, { foreignKey: 'id_producto', as: 'carrito' });



module.exports = db;
/*db.deps =  require("./departamento.model.js")(sequelize,Sequelize);
db.proveedors =  require("./proveedor.model.js")(sequelize,Sequelize);
db.pedidos=  require("./pedido.model.js")(sequelize,Sequelize);
db.productos =  require("./producto.model.js")(sequelize,Sequelize);
db.detalle_pedidos =  require("./detalle_pedido.model.js")(sequelize,Sequelize);
db.libros=  require("./libro.model.js")(sequelize,Sequelize);
db.estudiantes =  require("./estudiante.model.js")(sequelize,Sequelize);
db.prestamos =  require("./prestamo.model.js")(sequelize,Sequelize);
db.catalogos =  require("./catalogo.model.js")(sequelize,Sequelize);*/

//db.clientes =  require("./cliente.model.js")(sequelize,Sequelize);
// puede seguir agregando mas modelos e importarlos de la seguiente manera
//db.tutorials = require("./tutorial.model.js")(sequelize, Sequelize);
// se utiliza el export para que el objeto db pueda ser accedio a travez de otras clases. 
/*db.clientes.hasMany(db.pedidos, { foreignKey: 'id_cliente' });
// Un pedido pertenece a un cliente
db.pedidos.belongsTo(db.clientes, { foreignKey: 'id_cliente' });*/

/*db.libros.hasMany(db.prestamos, { foreignKey: 'id_libro' });
// Un pedido pertenece a un cliente
db.prestamos.belongsTo(db.libros, { foreignKey: 'id_libro' });


db.estudiantes.hasMany(db.prestamos, { foreignKey: 'id_estudiante' });
// Un pedido pertenece a un cliente
db.prestamos.belongsTo(db.estudiantes, { foreignKey: 'id_estudiante' });*/
