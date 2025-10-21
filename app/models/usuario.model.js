//Utilizamos module.export para exportar objetos para que puedan ser utilizados en otras clases
module.exports = (sequelize, Sequelize) => {
// usamos el sequelize.defina para "definir" el nombre de la entity en la BD, en este caso "cliente"
// Usamos type.Sequelize para definir el tipo de datos de cada atributo de la entidad 
    const Usuario = sequelize.define("usuario", {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        correo: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        contrasena: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
         puesto: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        telefono: {
            type: Sequelize.STRING(100),
            allowNull: false
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
          id_rol: {
           type: Sequelize.INTEGER,
            allowNull: false,
             references: {
            model: 'rols', // nombre de la tabla a la que referencia
             key: 'id'  // nombre del campo clave primaria en Cliente
                     },
                onUpdate: 'CASCADE',
             onDelete: 'SET NULL'
        }

    });
    return Usuario;
};