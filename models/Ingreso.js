const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const {nanoid} = require('nanoid');

const Ingreso = sequelize.define('Ingreso', {
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

module.exports = Ingreso;
