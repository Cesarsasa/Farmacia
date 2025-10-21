//Utilizamos module.export para exportar objetos para que puedan ser utilizados en otras clases//*
/*CREATE TABLE detalle_venta (
  id SERIAL PRIMARY KEY,
  id_venta INT REFERENCES venta(id),
  id_producto INT REFERENCES producto(id),
  cantidad INT NOT NULL,
  precio_unitario NUMERIC(10,2) NOT NULL
);

*/ 
module.exports = (sequelize, Sequelize) => {
// usamos el sequelize.defina para "definir" el nombre de la entity en la BD, en este caso "cliente"
// Usamos type.Sequelize para definir el tipo de datos de cada atributo de la entidad 
    const Detalle_venta = sequelize.define("detalle_venta", {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
          id_venta: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'venta', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
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
        cantidad: {
            type: Sequelize.NUMERIC(10,2),
            allowNull: false
        },
            precio_unitario: {
                         type: Sequelize.NUMERIC(10,2),
            allowNull: false
                 }


    });
    return Detalle_venta;
};