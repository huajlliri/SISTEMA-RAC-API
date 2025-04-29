const Cliente = require('./Cliente');
const Almacen = require('./Almacen');
const EfectivoOld = require('./EfectivoOld');
const Registro = require('./Registro');
const Compra = require('./Compra');
const Empresa = require('./Empresa');
const Proveedor = require('./Proveedor');
const Sucursal = require('./Sucursal');
const Usuario = require('./Usuario');
const Venta = require('./Venta');
const Efectivo = require('./Efectivo');
const Cuenta = require('./Cuenta');
const Rubro = require('./Rubro');
const Actividad = require('./Actividad');
const Role = require('./Role');
const Permission = require('./Permission');
const Dependiente = require('./Dependiente')
const PlanillaSueldo = require('./PlanillaSueldo');
const Ingreso = require('./Ingreso');
const Gasto = require('./Gasto');
const sequelize = require('../config/db');
const bcrypt = require('bcrypt');
const Ufv = require('./Ufv');
const Smn = require('./Smn');
const Aguinaldo = require('./Aguinaldo');
const Anticipo = require('./Anticipo');
const Patronal = require('./Patronal');
const Indem = require('./Indem');
const Asistencia = require('./Asistencia');
Dependiente.hasMany(PlanillaSueldo, { foreignKey: 'dependiente_id', as: 'planillas', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
PlanillaSueldo.belongsTo(Dependiente, { foreignKey: 'dependiente_id', as: 'dependiente', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Dependiente.hasMany(Aguinaldo, { foreignKey: 'dependiente_id', as: 'aguinaldos', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Aguinaldo.belongsTo(Dependiente, { foreignKey: 'dependiente_id', as: 'dependiente', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Dependiente.hasMany(Asistencia, { foreignKey: 'dependiente_id', as: 'asistencias', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Asistencia.belongsTo(Dependiente, { foreignKey: 'dependiente_id', as: 'dependiente', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Dependiente.hasMany(Anticipo, { foreignKey: 'dependiente_id', as: 'anticipos', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Anticipo.belongsTo(Dependiente, { foreignKey: 'dependiente_id', as: 'dependiente', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Dependiente.hasMany(Patronal, { foreignKey: 'dependiente_id', as: 'patronales', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Patronal.belongsTo(Dependiente, { foreignKey: 'dependiente_id', as: 'dependiente', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Dependiente.hasMany(Indem, { foreignKey: 'dependiente_id', as: 'indems', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Indem.belongsTo(Dependiente, { foreignKey: 'dependiente_id', as: 'dependiente', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Empresa.hasMany(Dependiente, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Dependiente.belongsTo(Empresa, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Role.belongsToMany(Permission, { through: 'RolePermission', foreignKey: 'roleId' });
Permission.belongsToMany(Role, { through: 'RolePermission', foreignKey: 'permissionId' });
Empresa.belongsToMany(Usuario, { through: 'EmpresaUsuario', foreignKey: 'empresa_id' });
Usuario.belongsToMany(Empresa, { through: 'EmpresaUsuario', foreignKey: 'usuario_id' });
Empresa.hasMany(Sucursal, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Sucursal.belongsTo(Empresa, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Empresa.hasMany(Actividad, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Actividad.belongsTo(Empresa, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Role.hasMany(Usuario, { foreignKey: 'role_id', as: 'usuario' });
Usuario.belongsTo(Role, { foreignKey: 'role_id', as: 'rol' });
Sucursal.hasMany(Venta, { foreignKey: 'sucursal_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Venta.belongsTo(Sucursal, { foreignKey: 'sucursal_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Sucursal.hasMany(Cuenta, { foreignKey: 'sucursal_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Cuenta.belongsTo(Sucursal, { foreignKey: 'sucursal_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Sucursal.hasMany(Compra, { foreignKey: 'sucursal_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Compra.belongsTo(Sucursal, { foreignKey: 'sucursal_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Sucursal.hasMany(Efectivo, { foreignKey: 'sucursal_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Efectivo.belongsTo(Sucursal, { foreignKey: 'sucursal_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Cuenta.hasOne(Efectivo, { foreignKey: 'cuenta_id', as: 'efectivoCuenta', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Efectivo.belongsTo(Cuenta, { foreignKey: 'cuenta_id', as: 'cuenta', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Cuenta.hasOne(Efectivo, { foreignKey: 'cuenta_ref_id', as: 'efectivoCuentaRef', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Efectivo.belongsTo(Cuenta, { foreignKey: 'cuenta_ref_id', as: 'cuentaRef', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Compra.hasOne(Efectivo, { foreignKey: 'compra_id', as: 'efectivoCompra', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Efectivo.belongsTo(Compra, { foreignKey: 'compra_id', as: 'compra', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Venta.hasOne(Efectivo, { foreignKey: 'venta_id', as: 'efectivoVenta', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Efectivo.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Ingreso.hasOne(Efectivo, { foreignKey: 'ingreso_id', as: 'efectivoIngreso', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Efectivo.belongsTo(Ingreso, { foreignKey: 'ingreso_id', as: 'ingreso', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Gasto.hasOne(Efectivo, { foreignKey: 'gasto_id', as: 'efectivoGasto', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Efectivo.belongsTo(Gasto, { foreignKey: 'gasto_id', as: 'gasto', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });



//////////////////////////

const Producto = require('./Producto');
const CodigosProductos = require('./CodigosProductos');
const Depreciacion = require('./Depreciacion');
const CuentaContable = require('./CuentaContable');
const Inventario = require('./Inventario');
const HistorialInventario = require('./HistorialInventario');
const Linea = require('./Linea');
const SubLinea = require('./SubLinea');
const Activo = require('./Activo');
const ActDep = require('./ActDep');
const Asiento = require('./Asiento');
const Diario = require('./Diario');
const Marca = require('./Marca');
const Modelo = require('./Modelo');
const UnidadesMedida = require('./UnidadesMedida');
Marca.hasMany(Modelo, { foreignKey: 'marca_id', as: 'modelos', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Modelo.belongsTo(Marca, { foreignKey: 'marca_id', as: 'marca', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Dependiente.hasMany(Activo, { foreignKey: 'dependiente_id', as: 'activos', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Activo.belongsTo(Dependiente, { foreignKey: 'dependiente_id', as: 'dependiente', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Modelo.hasMany(Activo, { foreignKey: 'modelo_id', as: 'activos', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Activo.belongsTo(Modelo, { foreignKey: 'modelo_id', as: 'modelo', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Empresa.hasMany(CuentaContable, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
CuentaContable.belongsTo(Empresa, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Empresa.hasMany(CodigosProductos, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
CodigosProductos.belongsTo(Empresa, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Empresa.hasMany(Producto, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Producto.belongsTo(Empresa, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Inventario.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(Inventario, { foreignKey: 'producto_id', as: 'inventarios' });
HistorialInventario.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(HistorialInventario, { foreignKey: 'producto_id', as: 'historiales' });
Asiento.belongsTo(Diario, { foreignKey: 'diario_id', as: 'diario', onDelete: 'RESTRICT' });
Diario.hasMany(Asiento, { foreignKey: 'diario_id', as: 'asientos', onDelete: 'RESTRICT' });
Empresa.hasMany(Diario, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Diario.belongsTo(Empresa, { foreignKey: 'empresa_id', onDelete: 'RESTRICT', onUpdate: 'CASCADE' });
Asiento.belongsTo(CuentaContable, { foreignKey: 'cuentaContable_id', as: 'cuenta', onDelete: 'RESTRICT' });
CuentaContable.hasMany(Asiento, { foreignKey: 'cuentaContable_id', as: 'asientos', onDelete: 'RESTRICT' });
SubLinea.belongsTo(Linea, { foreignKey: 'linea_id', as: 'linea', onDelete: 'RESTRICT' });
Linea.hasMany(SubLinea, { foreignKey: 'linea_id', as: 'sublineas', onDelete: 'RESTRICT' });
Producto.belongsTo(SubLinea, { foreignKey: 'sublinea_id', as: 'sublinea' });
SubLinea.hasMany(Producto, { foreignKey: 'sublinea_id', as: 'productos' });
Activo.belongsTo(Depreciacion, { foreignKey: 'depreciacion_id', as: 'depreciacion' });
Depreciacion.hasMany(Activo, { foreignKey: 'depreciacion_id', as: 'activos' });
Activo.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
Empresa.hasMany(Activo, { foreignKey: 'empresa_id', as: 'activos' });
ActDep.belongsTo(Activo, { foreignKey: 'activo_id', as: 'activo' });
Activo.hasMany(ActDep, { foreignKey: 'activo_id', as: 'actdeps' });


UnidadesMedida.belongsTo(Empresa, { foreignKey: 'empresa_id', as: 'empresa' });
Empresa.hasMany(UnidadesMedida, { foreignKey: 'empresa_id', as: 'unidadesmedidas' });

async function seedDatabase() {
  try {
    await sequelize.sync();
    console.log('Base de datos sincronizada sin pérdida de datos.');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
}
//seedDatabase();

module.exports = {
  ActDep, Actividad, Activo, Aguinaldo, Almacen, Anticipo, Asiento, Asistencia,
  Cliente, CodigosProductos, Compra, Cuenta, CuentaContable, Dependiente, Depreciacion,
  Diario, Efectivo, EfectivoOld, Empresa, Gasto, HistorialInventario, Indem, Ingreso,
  Inventario, Linea, Marca, Modelo, Patronal, Permission, PlanillaSueldo, Producto,
  Proveedor, Registro, Role, Rubro, Smn, SubLinea, Sucursal, Ufv, UnidadesMedida,
  Usuario, Venta
};