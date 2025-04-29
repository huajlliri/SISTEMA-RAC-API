const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const { nanoid } = require('nanoid');
const Dependiente = require('./Dependiente');

const PlanillaSueldo = sequelize.define('PlanillaSueldo', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
    defaultValue: () => nanoid()
  },

  saldo_anterior: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  saldo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  form110: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false,
    defaultValue: 0.00
  },

  dependiente_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  periodo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dias_mes: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  horas_dia: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  haber_basico: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  bono_antiguedad: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  bono_produccion: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  subsidio_frontera: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  horas_extras: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  anticipo: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  trabajo_extraordinario: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  pago_dominical: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  otros_bonos: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  total_ganado: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  aporte_afp: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  rc_iva: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  otros_descuentos: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  total_descuentos: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  liquido_pagable: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  liquido_pagable: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  nro: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
}, {
  hooks: {
    beforeCreate: async (planilla, options) => {

      const dependiente = await Dependiente.findByPk(planilla.dependiente_id);

      if (!dependiente) {
        throw new Error('Dependiente no encontrado');
      }

      const planillasEmpresa = await PlanillaSueldo.findAll({
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

      const maxCodigo = planillasEmpresa.length > 0
        ? Math.max(...planillasEmpresa.map(p => parseInt(p.nro)))
        : 0;

      planilla.nro = maxCodigo + 1;
    }
  }

});


module.exports = PlanillaSueldo;
