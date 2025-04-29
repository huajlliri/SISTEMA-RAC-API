const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const {nanoid} = require('nanoid');

const Compras = sequelize.define('Compra', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
   defaultValue: () => nanoid()
  },
  nro: {
    type: DataTypes.INTEGER(6),
    allowNull: false
  },
  especificacion: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 1
  },
  nit_proveedor: {
    type: DataTypes.STRING(12),
    allowNull: false
  },
  razon_social_proveedor: {
    type: DataTypes.STRING(240),
    allowNull: false
  },
  codigo_autorizacion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nro_factura: {
    type: DataTypes.BIGINT(20),
    allowNull: false
  },
  nro_dui_dim: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  fecha_factura_dui_dim: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  importe_total_compra: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  importe_ice: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  importe_iehd: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  importe_ipj: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  tasas: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  otros_no_sujetos_credito_fiscal: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  importes_exentos: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  importe_compras_gravadas_tasa_cero: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  subtotal: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  descuentos_bonificaciones_rebajas_sujetas_iva: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  importe_gift_card: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },

  importe_base_cf: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  credito_fiscal: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  tipo_compra: {
    type: DataTypes.TINYINT(1),
    allowNull: false
  },
  codigo_control: {
    type: DataTypes.STRING(17),
    allowNull: false,
    defaultValue: '0',
  },
  rubro: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  estado_consolidacion: {
    type: DataTypes.STRING(17),
    allowNull: true
  },
  fecha_limite: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  sucursal_id: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

module.exports = Compras;
