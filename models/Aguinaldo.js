const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');
const Dependiente = require('./Dependiente');

const Aguinaldo = sequelize.define('Aguinaldos', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },
  nro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  dependiente_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  gestion: {
    type: DataTypes.STRING,
    allowNull: false
  },
  meses: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dias: {
    type: DataTypes.STRING,
    allowNull: false
  },
  sueldo_septiembre: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  sueldo_octubre: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  sueldo_noviembre: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  sueldo_promedio: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  liquido_pagable: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },

}, {
  hooks: {
    beforeCreate: async (aguinaldo, options) => {
      const dependiente = await Dependiente.findByPk(aguinaldo.dependiente_id);

      if (!dependiente) {
        throw new Error('Dependiente no encontrado');
      }

      const aguinaldoEmpresa = await Aguinaldo.findAll({
        include: [
          {
            model: Dependiente,
            as: 'dependiente',
            where: {
              empresa_id: dependiente.empresa_id
            },
            required: true
          }
        ]
      });

      const maxCodigo = aguinaldoEmpresa.length > 0
        ? Math.max(...aguinaldoEmpresa.map(p => parseInt(p.nro)))
        : 0;


      aguinaldo.nro = maxCodigo + 1;
    }
  }

});


module.exports = Aguinaldo;
