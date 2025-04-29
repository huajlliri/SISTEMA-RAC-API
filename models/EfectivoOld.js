const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');

const EfectivoOld = sequelize.define('EfectivosOld', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  sucursal_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  ref_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ref_key: {
    type: DataTypes.STRING,
    allowNull: true
  },
  detalle: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  monto: { 
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  movimiento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  origen: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destino: {
    type: DataTypes.STRING,
    allowNull: false
  },
  banco_id: {
    type: DataTypes.STRING,
    allowNull: true
  }, 
  respaldo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nro_documento: {
    type: DataTypes.STRING,
    allowNull: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true
  },
  ci: {
    type: DataTypes.STRING,
    allowNull: true
  },
});

module.exports = EfectivoOld;
