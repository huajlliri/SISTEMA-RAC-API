const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');
const Anticipo = sequelize.define('Anticipos', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  dependiente_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  importe: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  tipo: {
    type: DataTypes.STRING,
    allowNull: false
  },

});


module.exports = Anticipo;
