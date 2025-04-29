const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const SubLineaController = sequelize.define('SubLineas', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid()
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    linea_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = SubLineaController;
