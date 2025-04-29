const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const CodigosProductos = sequelize.define('CodigosProductos', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid()
    },
    codigo_producto_sin: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    codigo_actividad_caeb: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descripcion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    empresa_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = CodigosProductos;
