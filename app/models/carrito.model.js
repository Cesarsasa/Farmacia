module.exports = (sequelize, Sequelize) => {
  const Carrito = sequelize.define("carrito", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_cliente: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'clientes', // nombre de la tabla referenciada
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    id_producto: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'productos', // nombre de la tabla referenciada
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    cantidad: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    fecha_agregado: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['id_cliente', 'id_producto']
      }
    ]
  });

  return Carrito;
};