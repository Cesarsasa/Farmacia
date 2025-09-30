//Utilizamos module.export para exportar objetos para que puedan ser utilizados en otras clases//*
/*CREATE TABLE factura (
  id SERIAL PRIMARY KEY,
  id_venta INT REFERENCES venta(id),
  numero_factura VARCHAR(50) UNIQUE NOT NULL,
  fecha_emision TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

*/ 
module.exports = (sequelize, Sequelize) => {
// usamos el sequelize.defina para "definir" el nombre de la entity en la BD, en este caso "cliente"
// Usamos type.Sequelize para definir el tipo de datos de cada atributo de la entidad 
    const Factura= sequelize.define("factura", {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
         numero_factura: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
            },

            fecha_emision: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW

        },
          id_venta : {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'venta', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
        }
    });
    return Factura;
};