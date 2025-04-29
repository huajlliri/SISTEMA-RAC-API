const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const Actividad = sequelize.define('Actividades', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid()
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    codigo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    empresa_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

module.exports = Actividad;
