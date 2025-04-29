const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const {nanoid} = require('nanoid');

const Sucursal = sequelize.define('Sucursales', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
   defaultValue: () => nanoid()
  },
  codigo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  zona_lugar: {
    type: DataTypes.STRING,
    allowNull: false
  },
  direccion: {
    type: DataTypes.STRING,
    allowNull: false
  },  

  empresa_id: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Sucursal;
