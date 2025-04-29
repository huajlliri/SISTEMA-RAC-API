const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const Ufv = sequelize.define('Ufvs', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        defaultValue: () => nanoid()
    },
    fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        unique: true
    },
    valor: {
        type: DataTypes.DECIMAL(20, 5),
        allowNull: false
    },
});

module.exports = Ufv;
