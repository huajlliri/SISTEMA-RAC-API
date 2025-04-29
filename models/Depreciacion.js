const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');
const Depreciacion = sequelize.define('Depreciaciones', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid()
    },
    empresa_id: {
        type: DataTypes.STRING,
        allowNull: false
      },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    vida_util: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    coeficiente: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false
    }
});

module.exports = Depreciacion; 