//Utilizamos module.export para exportar objetos para que puedan ser utilizados en otras clases//*
/*CREATE TABLE venta (
  id SERIAL PRIMARY KEY,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  id_usuario INT REFERENCES usuario(id),
  id_cliente INT REFERENCES cliente(id),
  id_sucursal INT REFERENCES sucursal(id),
  total NUMERIC(10,2) NOT NULL
);
*/ 
module.exports = (sequelize, Sequelize) => {
// usamos el sequelize.defina para "definir" el nombre de la entity en la BD, en este caso "cliente"
// Usamos type.Sequelize para definir el tipo de datos de cada atributo de la entidad 
    const Venta= sequelize.define("venta", {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
            fecha: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW

        },
          id_usuario: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'usuarios', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
        },  
          id_cliente: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'clientes', // nombre de la tabla a la que referencia
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
        total: {
            type: Sequelize.NUMERIC(10,2),
            allowNull: false
        }

    });
    return Venta;
};