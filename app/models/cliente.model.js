//Utilizamos module.export para exportar objetos para que puedan ser utilizados en otras clases
module.exports = (sequelize, Sequelize) => {
// usamos el sequelize.defina para "definir" el nombre de la entity en la BD, en este caso "cliente"
// Usamos type.Sequelize para definir el tipo de datos de cada atributo de la entidad 
    const Cliente = sequelize.define("cliente", {
         id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        apellido: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        nit: {
            type: Sequelize.STRING(20),
            allowNull: false
        },
        contrasena: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        direccion: {
            type: Sequelize.TEXT
        },
        telefono: {
            type: Sequelize.STRING(20)
        },
        correo: {
            type: Sequelize.STRING(100),
            unique: true
        }

    });
    return Cliente;
};