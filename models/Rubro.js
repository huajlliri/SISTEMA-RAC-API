const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const {nanoid} = require('nanoid');

const Rubro = sequelize.define('Rubro', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
       defaultValue: () => nanoid()
    },
    nombre: {
        type: DataTypes.STRING,
        allowNull: false
    },
    empresa_id: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = Rubro;
