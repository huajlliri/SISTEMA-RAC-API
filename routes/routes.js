const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController')
const UsuarioController = require('../controllers/UsuarioController')
const validateToken = require('../middlewares/ValidateToken');
const SucursalController = require('../controllers/SucursalController');
const VentaController = require('../controllers/VentaController');
const CompraController = require('../controllers/CompraController');
const ClienteController = require('../controllers/ClienteController');
const ProveedorController = require('../controllers/ProveedorController');
const EmpresaController = require('../controllers/EmpresaController');
const RubroController = require('../controllers/RubroController');
const EfectivoController = require('../controllers/EfectivoController');
const ActividadController = require('../controllers/ActividadController');






const DependienteController = require('../controllers/DependienteController');
router.get('/getdependientes', validateToken, DependienteController.getdependientes);
router.get('/getdependientesOnly', validateToken, DependienteController.getdependientesOnly);
router.post('/adddependiente', validateToken, DependienteController.adddependiente);
router.delete('/deletedependiente/:id', validateToken, DependienteController.deletedependiente);
router.post('/editdependiente', validateToken, DependienteController.editdependiente);


const PlanillaSueldoController = require('../controllers/PlanillaSueldoController');
router.get('/getdependientesCP', validateToken, PlanillaSueldoController.getdependientesCP);
router.post('/setPlanillaSueldo', validateToken, PlanillaSueldoController.setPlanillaSueldo);
router.delete('/deletePlanillaSueldo/:id', validateToken, PlanillaSueldoController.deletePlanillaSueldo);

const AguinaldoController = require('../controllers/AguinaldoController');
router.get('/getdependientesCA', validateToken, AguinaldoController.getdependientesCA);
router.post('/setPlanillaAguinaldo', validateToken, AguinaldoController.setPlanillaAguinaldo);
router.delete('/deleteAguinaldo/:id', validateToken, AguinaldoController.deleteAguinaldo);


const AnticipoController = require('../controllers/AnticipoController');
router.get('/getdependientesCANT', validateToken, AnticipoController.getdependientesCANT);
router.post('/setAnticipos', validateToken, AnticipoController.setAnticipos);
router.delete('/deleteAnticipo/:id', validateToken, AnticipoController.deleteAnticipo);



const AsistenciaController = require('../controllers/AsistenciaController');
router.get('/getdependientesCASI', validateToken, AsistenciaController.getdependientesCASI);
router.post('/setAsistencias', validateToken, AsistenciaController.setAsistencias);
router.delete('/deleteAsistencia/:id', validateToken, AsistenciaController.deleteAsistencia);



const PatronalController = require('../controllers/PatronalController');
router.get('/getpatronales', validateToken, PatronalController.getpatronales);
router.post('/setPatronales', validateToken, PatronalController.setPatronales);
router.delete('/deletePatronal/:id', validateToken, PatronalController.deletePatronal);

const IndemController = require('../controllers/IndemController');
router.get('/getdependientesIndem', validateToken, IndemController.getdependientesIndem);
router.post('/setIndems', validateToken, IndemController.setIndems);
router.delete('/deleteIndem/:id', validateToken, IndemController.deleteIndem);


const UfvController = require('../controllers/UfvController');
router.post('/updateSmn', validateToken, UfvController.updateSmn);
router.get('/getufvs', validateToken, UfvController.getufvs);
router.get('/getufv', validateToken, UfvController.getufv);
router.post('/addufv', validateToken, UfvController.addufv);
router.post('/editufv', validateToken, UfvController.editufv);
router.delete('/deleteufv/:id', validateToken, UfvController.deleteufv);
router.post('/AddUfvsLote', validateToken, UfvController.AddUfvsLote);
const RoleController = require('../controllers/RoleController'); 
router.get('/getRoles', validateToken, RoleController.getRoles);
router.post('/addRol', validateToken, RoleController.addRol);
router.post('/editRol', validateToken, RoleController.editRol);
router.delete('/deleteRol/:id', validateToken, RoleController.deleteRol);
router.get('/getactividades', validateToken, ActividadController.getactividades);
router.get('/getactividadesname', validateToken, ActividadController.getactividadesname);
router.post('/addactividad', validateToken, ActividadController.addactividad);
router.delete('/deleteactividad/:id', validateToken, ActividadController.deleteactividad);
router.post('/editactividad', validateToken, ActividadController.editactividad);
router.post('/addempresa', validateToken, EmpresaController.addempresa);
router.post('/editempresa', validateToken, EmpresaController.editempresa);
router.get('/getEmpresasRoles', validateToken, EmpresaController.getEmpresasRoles);
router.post('/login', AuthController.login);
router.post('/changepassword', validateToken, UsuarioController.changepassword);
router.get('/getusers', validateToken, UsuarioController.getusers);
router.post('/deleteuser', validateToken, UsuarioController.deleteuser);
router.get('/getusername', validateToken, UsuarioController.getusername);
router.get('/getdata', validateToken, UsuarioController.getdata);
router.post('/adduser', validateToken, UsuarioController.adduser);
router.post('/edituser', validateToken, UsuarioController.edituser);
router.put('/changeState/:id', validateToken, UsuarioController.changeState);
router.get('/getsucursales', validateToken, SucursalController.getsucursales);
router.post('/addsucursal', validateToken, SucursalController.addsucursal);
router.post('/editsucursal', validateToken, SucursalController.editsucursal);
router.delete('/deletesucursal/:id', validateToken, SucursalController.deletesucursal);
router.post('/addventa', validateToken, VentaController.addventa);
router.post('/editventa', validateToken, VentaController.editventa);
router.get('/getventas', validateToken, VentaController.getventas);
router.get('/getallventas', validateToken, VentaController.getallventas);
router.delete('/deleteventa/:id', validateToken, VentaController.deleteventa);
router.post('/addcsv', validateToken, VentaController.addcsv);
router.get('/getCPC', validateToken, VentaController.getCPC);
router.post('/editmetodopago', validateToken, VentaController.editmetodopago);
router.post('/editmetodopagoLote', validateToken, VentaController.editmetodopagoLote);
router.get('/getregistros', validateToken, UsuarioController.getregistros);
router.get('/getcompras', validateToken, CompraController.getcompras);
router.get('/getallcompras', validateToken, CompraController.getallcompras);
router.get('/getcomprasrubros', validateToken, CompraController.getcomprasrubros);
router.delete('/deletecompra/:id', validateToken, CompraController.deletecompra);
router.post('/editcompra', validateToken, CompraController.editcompra);
router.post('/addcompra', validateToken, CompraController.addcompra);
router.post('/addcsvCompras', validateToken, CompraController.addcsvCompras);
router.get('/searchproveedor', validateToken, ProveedorController.searchproveedor);
router.get('/getCPP', validateToken, CompraController.getCPP);
router.post('/editmetodopagoCompra', validateToken, CompraController.editmetodopagoCompra);
router.post('/editmetodopagoCompraLote', validateToken, CompraController.editmetodopagoCompraLote);
router.get('/searchcliente', validateToken, ClienteController.searchcliente);
router.get('/getestadisticas', validateToken, EmpresaController.getestadisticas);
router.post('/editdatosinfo', validateToken, UsuarioController.editdatosinfo);
router.get('/getrubros', validateToken, RubroController.getrubros);
router.get('/getrubrosname', validateToken, RubroController.getrubrosname);
router.post('/addrubro', validateToken, RubroController.addrubro);
router.post('/AddRubrosLote', validateToken, RubroController.AddRubrosLote);
router.delete('/deleterubro/:id', validateToken, RubroController.deleterubro);
router.post('/editrubro', validateToken, RubroController.editrubro);

router.get('/getingresosgastos', validateToken, EfectivoController.getingresosgastos);
router.post('/addingresogasto', validateToken, EfectivoController.addingresogasto);
router.delete('/deleteingresogasto/:id', validateToken, EfectivoController.deleteingresogasto);
router.post('/editingresogasto', validateToken, EfectivoController.editingresogasto);

router.get('/getefectivos', validateToken, EfectivoController.getefectivos);
router.post('/addingreso', validateToken, EfectivoController.addingreso);
router.post('/addgasto', validateToken, EfectivoController.addgasto);
router.post('/editEfectivoIngresoGasto', validateToken, EfectivoController.editEfectivoIngresoGasto);
router.post('/editEfectivoFactura', validateToken, EfectivoController.editEfectivoFactura);
router.delete('/deleteefectivo/:id', validateToken, EfectivoController.deleteefectivo);
router.post('/addtransferencia', validateToken, EfectivoController.addtransferencia);
router.post('/pushCaja', validateToken, EfectivoController.pushCaja);
router.post('/pushcuenta', validateToken, EfectivoController.pushcuenta);
router.get('/getcuentas/:sucursal_id', validateToken, EfectivoController.getcuentas);
router.delete('/deletebanco/:id', validateToken, EfectivoController.deletecuenta);
router.get('/getempresas', validateToken, EmpresaController.getempresas);
router.get('/getclientes', validateToken, ClienteController.getclientes);
router.post('/editcliente', validateToken, ClienteController.editcliente);
router.get('/getproveedores', validateToken, ProveedorController.getproveedores);
router.post('/editproveedor', validateToken, ProveedorController.editproveedor);
router.post('/deleteempresa', validateToken, EmpresaController.deleteempresa);




////////////////////////////////////////////
const CuentaContableController = require('../controllers/CuentaContableController');
router.get('/getcuentascontables', validateToken, CuentaContableController.getcuentascontables);
router.post('/addcuentacontable', validateToken, CuentaContableController.addcuentacontable);
router.delete('/deletecuentacontable/:id', validateToken, CuentaContableController.deletecuentacontable);
router.post('/editcuentacontable', validateToken, CuentaContableController.editcuentacontable);
router.post('/AddCuentasContablesLote', validateToken, CuentaContableController.AddCuentasContablesLote);

const LibroController = require('../controllers/LibroController');
router.get('/getdiarios', validateToken, LibroController.getdiarios);
router.get('/getmayores', validateToken, LibroController.getmayores);
router.get('/getbalancesumassaldos', validateToken, LibroController.getbalancesumassaldos); 
router.post('/addonlydiario', validateToken, LibroController.addonlydiario);
router.post('/setDiarioWithAsientos', validateToken, LibroController.setDiarioWithAsientos); 
router.delete('/deletediario/:id', validateToken, LibroController.deletediario); 

const DepreciacionController = require('../controllers/DepreciacionController'); 
router.get('/getdepreciaciones', validateToken, DepreciacionController.getdepreciaciones);
router.post('/adddepreciacion', validateToken, DepreciacionController.adddepreciacion);
router.post('/editdepreciacion', validateToken, DepreciacionController.editdepreciacion);
router.delete('/deletedepreciacion/:id', validateToken, DepreciacionController.deletedepreciacion);
router.post('/AddDepreciacionesLote', validateToken, DepreciacionController.AddDepreciacionesLote); 

const ActivoController = require('../controllers/ActivoController');
router.get('/getactivos', validateToken, ActivoController.getactivos);
router.post('/addactivo', validateToken, ActivoController.addactivo);
router.post('/editactivo', validateToken, ActivoController.editactivo);
router.delete('/deleteactivo/:id', validateToken, ActivoController.deleteactivo);

const ActDepController = require('../controllers/ActDepController');
router.get('/getactdeps', validateToken, ActDepController.getactdeps);
router.post('/addactdep', validateToken, ActDepController.addactdep);
router.delete('/deleteactdep/:id', validateToken, ActDepController.deleteactdep);
router.post('/editactdep', validateToken, ActDepController.editactdep); 

const CodigosProductosController = require('../controllers/CodigosProductosController');
router.get('/getcodigosProductos', validateToken, CodigosProductosController.getcodigosProductos);
router.post('/AddcodigosProductosLote', validateToken, CodigosProductosController.AddcodigosProductosLote);
router.get('/getcodigosProductosname', validateToken, CodigosProductosController.getcodigosProductosname);
router.get('/getcodigosProductosvalores', validateToken, CodigosProductosController.getcodigosProductosvalores);
router.post('/addcodigosProducto', validateToken, CodigosProductosController.addcodigosProducto);
router.delete('/deletecodigosProducto/:id', validateToken, CodigosProductosController.deletecodigosProducto);
router.post('/editcodigosProducto', validateToken, CodigosProductosController.editcodigosProducto);

const UnidadesMedida = require('../controllers//UnidadesMedidaController');
router.get('/getUnidadesMedida', validateToken, UnidadesMedida.getUnidadesMedida);
router.post('/addUnidadesMedida', validateToken, UnidadesMedida.addUnidadesMedida);
router.post('/editUnidadMedida', validateToken, UnidadesMedida.editUnidadMedida);
router.delete('/deleteUnidadMedida/:id', validateToken, UnidadesMedida.deleteUnidadMedida);
router.post('/AddUnidadesMedidaLote', validateToken, UnidadesMedida.AddUnidadesMedidaLote);
router.get('/getUnidadesMedidaName', validateToken, UnidadesMedida.getUnidadesMedidaName);

const InventarioController = require('../controllers/InventarioController');
router.get('/getinventario', validateToken, InventarioController.getinventario);
router.post('/addproductoinventario', validateToken, InventarioController.addproductoinventario);
router.get('/gethistorialInventarios', validateToken, InventarioController.gethistorialInventarios);
router.delete('/deleteHistorialInventario/:id', validateToken, InventarioController.deleteHistorialInventario);
router.post('/editproductoinventario', validateToken, InventarioController.editproductoinventario);

const ProductoController = require('../controllers/ProductoController');
router.get('/getproductosInventario', validateToken, ProductoController.getproductosInventario);
router.get('/getproductos', validateToken, ProductoController.getproductos);
router.post('/addproducto', validateToken, ProductoController.addproducto);
router.post('/editproducto', validateToken, ProductoController.editproducto);
router.delete('/deleteproducto/:id', validateToken, ProductoController.deleteproducto);
//router.get('/getrubrosname', validateToken, ProductoController.getrubrosname); 

const AlmacenController = require('../controllers/AlmacenController');
router.post('/editalmacen', validateToken, AlmacenController.editalmacen);
router.delete('/deletealmacen/:id', validateToken, AlmacenController.deletealmacen); 
router.get('/getalmacenes', validateToken, AlmacenController.getalmacenes);
router.post('/addalmacen', validateToken, AlmacenController.addalmacen);
router.post('/editalmacen', validateToken, AlmacenController.editalmacen);
router.delete('/deletealmacen/:id', validateToken, AlmacenController.deletealmacen);
//router.get('/getrubrosname', validateToken, RubroController.getrubrosname); 

const LineaController = require('../controllers/LineaController');
router.get('/getlineasvalidas', validateToken, LineaController.getlineasvalidas);
router.get('/getlineas', validateToken, LineaController.getlineas);
router.post('/addlinea', validateToken, LineaController.addlinea);
router.post('/editlinea', validateToken, LineaController.editlinea);
router.delete('/deletelinea/:id', validateToken, LineaController.deletelinea);

const MarcaController = require('../controllers/MarcaController');
router.get('/getmarcasvalidas', validateToken, MarcaController.getmarcasvalidas);
router.get('/getmarcas', validateToken, MarcaController.getmarcas);
router.post('/addmarca', validateToken, MarcaController.addmarca);
router.post('/editmarca', validateToken, MarcaController.editmarca);
router.delete('/deletemarca/:id', validateToken, MarcaController.deletemarca);





router.get('/', (req, res) => {
    res.send('<h1>¡Servidor ESETEL!</h1>');
});
module.exports = router;