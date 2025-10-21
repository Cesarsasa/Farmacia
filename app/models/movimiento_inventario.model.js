//Utilizamos module.export para exportar objetos para que puedan ser utilizados en otras clases
module.exports = (sequelize, Sequelize) => {
// usamos el sequelize.defina para "definir" el nombre de la entity en la BD, en este caso "cliente"
// Usamos type.Sequelize para definir el tipo de datos de cada atributo de la entidad 
    const Movimiento_inventario = sequelize.define("movimiento_inventario", {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
          id_producto: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'productos', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
        },  
          id_sucursal: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'sucursals', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
        },
        tipo_movimiento: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        cantidad: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        fecha: {
            type: Sequelize.DATE,
            allowNull: false
        },
         referencia: {
            type: Sequelize.STRING(150),
            allowNull: false
        }

    });
    return Movimiento_inventario ;
};