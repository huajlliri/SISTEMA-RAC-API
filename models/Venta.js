const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const {nanoid} = require('nanoid');

const Venta = sequelize.define('Ventas', {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
   defaultValue: () => nanoid()
  },
  nro: {
    type: DataTypes.INTEGER(8),
    allowNull: false
  },
  especificacion: {
    type: DataTypes.TINYINT(1),
    allowNull: false,
    defaultValue: 2
  },
  fecha_factura: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  nro_factura: {
    type: DataTypes.BIGINT(15),
    allowNull: false
  },
  codigo_autorizacion: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nit_ci_cliente: {
    type: DataTypes.STRING(15),
    allowNull: false
  },
  complemento: {
    type: DataTypes.STRING(5),
    allowNull: false
  },
  razon_social: {
    type: DataTypes.STRING(240),
    allowNull: false
  },
  importe_total: {
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
  otros_no_sujetos_iva: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  exportaciones_operaciones_exentas: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  ventas_gravadas_tasa_cero: {
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

  importe_basico_debito_fiscal: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  debito_fiscal: {
    type: DataTypes.DECIMAL(20, 2),
    allowNull: false
  },
  estado: {
    type: DataTypes.CHAR(1),
    allowNull: false
  },
  codigo_control: {
    type: DataTypes.STRING(17),
    allowNull: false
  },
  tipo_venta: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  fecha_limite: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  sucursal_id: {
    type: DataTypes.STRING,
    allowNull: false
  },
  actividad: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
});

module.exports = Venta;
