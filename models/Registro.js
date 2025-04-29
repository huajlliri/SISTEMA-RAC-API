const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Registro = sequelize.define('Registro', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    usuario: {
        type: DataTypes.STRING,
        allowNull: false
    },
    detalle: {
        type: DataTypes.STRING,
        allowNull: false
    }, 
    accion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    empresa_id: {
        type: DataTypes.STRING,
        allowNull: false
    },

});

module.exports = Registro;
