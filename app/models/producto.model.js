module.exports = (sequelize, Sequelize) => {
    const Producto = sequelize.define("producto", {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        nombre: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        descripcion: {
            type: Sequelize.STRING(100),
            allowNull: false
        },
        precio_unitario: {
            type: Sequelize.NUMERIC(10, 2),
            allowNull: false
        },
        imagen_url: {
            type: Sequelize.STRING,
            allowNull: true
        },
        categoria: {
            type: Sequelize.ENUM(
                'Analgésico',
                'Antibiótico',
                'Antiinflamatorio',
                'Antigripal',
                'Antialérgico',
                'Vitaminas',
                
                'Otros'
            ),
            allowNull: true
        },
        id_proveedor: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'proveedors',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
        }
    });

    return Producto;
};