const express = require('express');
const routes = require('./routes/routes');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
require('./models/Relaciones');
const app = express();
const port = 4000;
const allowedOrigins = ['https://k0vbt10v-5173.brs.devtunnels.ms', 'http://localhost:5173', 'https://rac.esetel.com', process.env.URL_CLIENTE];
const corsOptions = {
  origin: allowedOrigins,
  optionsSuccessStatus: 200,
  credentials: true
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.get('/getimage/logos/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'public', 'logos', imageName);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send('Imagen no encontrada');
  }
});
app.get('/getimage/fotos_dependientes/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'public', 'fotos_dependientes', imageName);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send('Imagen no encontrada');
  }
});
app.get('/getimage/activos_fijos/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'public', 'activos_fijos', imageName);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send('Imagen no encontrada');
  }
});

app.get('/getimage/productos/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'public', 'productos', imageName);

  if (fs.existsSync(imagePath)) {
    res.sendFile(imagePath);
  } else {
    res.status(404).send('Imagen no encontrada');
  }
});



const EfectivoOld = require('./models/EfectivoOld');
const Efectivo = require('./models/Efectivo');
const Cuenta = require('./models/Cuenta');
const { Compra, Venta } = require('./models/Relaciones');
const Ingreso = require('./models/Ingreso');
const Gasto = require('./models/Gasto');
const Permission = require('./models/Permission');


async function migrateCuentas() {
  try {
    const cuentas = await Cuenta.findAll();
    for (const cuenta of cuentas) {
      await cuenta.update({
        saldo: 0.00
      })
    }
    console.log('Migración completada exitosamente.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}


async function migrateEfectivos() {
  try {
    const oldRecords = await EfectivoOld.findAll();
    for (const oldRecord of oldRecords) {
      let cuentaId = null;
      if (oldRecord.origen === 'Efectivo') {
        const cuenta = await Cuenta.findOne({
          where: { sucursal_id: oldRecord.sucursal_id, nombre: 'CAJA' },
        });
        cuentaId = cuenta.id;
      } else if (oldRecord.origen === 'Transferencia/Deposito') {
        cuentaId = oldRecord.banco_id;
      } else if (oldRecord.destino === 'Efectivo') {
        const cuenta = await Cuenta.findOne({
          where: { sucursal_id: oldRecord.sucursal_id, nombre: 'CAJA' },
        });
        cuentaId = cuenta.id;
      } else if (oldRecord.destino === 'Transferencia/Deposito') {
        cuentaId = oldRecord.banco_id;
      }

      let compraId = null;
      let ventaId = null;
      let ingresoId = null;
      let gastoId = null;

      const compra = await Compra.findOne({ where: { id: oldRecord.ref_id } });
      compraId = compra ? compra.id : null;
      const venta = await Venta.findOne({ where: { id: oldRecord.ref_id } });
      ventaId = venta ? venta.id : null;
      const ingreso = await Ingreso.findOne({ where: { id: oldRecord.ref_id } });
      ingresoId = ingreso ? ingreso.id : null;
      const gasto = await Gasto.findOne({ where: { id: oldRecord.ref_id } });
      gastoId = gasto ? gasto.id : null;
      const newRecord = {
        id: oldRecord.id,
        sucursal_id: oldRecord.sucursal_id,
        ref_key: oldRecord.ref_key,
        detalle: oldRecord.detalle,
        fecha: oldRecord.fecha,
        monto: oldRecord.monto,
        movimiento: oldRecord.movimiento,
        cuenta_id: cuentaId,
        cuenta_ref_id: null,
        respaldo: oldRecord.respaldo,
        nro_documento: oldRecord.nro_documento,
        nombre: oldRecord.nombre || null,
        ci: oldRecord.ci || null,
        compra_id: compraId,
        venta_id: ventaId,
        ingreso_id: ingresoId,
        gasto_id: gastoId,
        createdAt: oldRecord.createdAt,
        updatedAt: oldRecord.updatedAt,
      };


      const cuenta = await Cuenta.findByPk(cuentaId);
      if (cuenta) {
        const saldoActual = parseFloat(cuenta.saldo)
        const monto = parseFloat(oldRecord.monto)
        if (oldRecord.movimiento === 'Ingreso') {
          cuenta.saldo = saldoActual + monto;
        } else if (oldRecord.movimiento === 'Egreso') {
          cuenta.saldo = saldoActual - monto;
        }
        await cuenta.save();
      }
      await Efectivo.create(newRecord);
    }
    console.log('Migración completada exitosamente.');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}
/*
app.get('/migrate', async (req, res) => {
  try {
    await migrateEfectivos();
    res.send('Migración completada exitosamente.');
  } catch (error) {
    res.status(500).send('Error durante la migración.');
  }
});
*/
/*
app.get('/setsaldo', async (req, res) => {
  try {
    await migrateCuentas();
    res.send('Migración completada exitosamente.');
  } catch (error) {
    res.status(500).send('Error durante la migración.');
  }
});
*/

/*
app.get('/setpermisos', async (req, res) => {
  try {
    const lista_permisos = [
      { action: 'Ver', subject: 'activos fijos' },
      { action: 'Editar', subject: 'activos fijos' },
      { action: 'Crear', subject: 'activos fijos' },
      { action: 'Eliminar', subject: 'activos fijos' },

      { action: 'Ver', subject: 'almacenes, productos y líneas' },
      { action: 'Editar', subject: 'almacenes, productos y líneas' },
      { action: 'Crear', subject: 'almacenes, productos y líneas' },
      { action: 'Eliminar', subject: 'almacenes, productos y líneas' },

      { action: 'Ver', subject: 'inventario' },
      { action: 'Editar', subject: 'inventario' },
      { action: 'Crear', subject: 'inventario' },
      { action: 'Eliminar', subject: 'inventario' },


      { action: 'Ver', subject: 'contabilidad' },
      { action: 'Editar', subject: 'contabilidad' },
      { action: 'Crear', subject: 'contabilidad' },
      { action: 'Eliminar', subject: 'contabilidad' },

      { action: 'Ver', subject: 'unidades de medida' },
      { action: 'Editar', subject: 'unidades de medida' },
      { action: 'Crear', subject: 'unidades de medida' },
      { action: 'Eliminar', subject: 'unidades de medida' },

      { action: 'Ver', subject: 'codigos productos sin' },
      { action: 'Editar', subject: 'codigos productos sin' },
      { action: 'Crear', subject: 'codigos productos sin' },
      { action: 'Eliminar', subject: 'codigos productos sin' },

   ///////////////////////
      { action: 'Ver', subject: 'gráfico de compras y ventas' },
      { action: 'Ver', subject: 'gráfico de CP y CC' },
      { action: 'Ver', subject: 'registro de compras' },
      { action: 'Editar', subject: 'registro de compras' },
      { action: 'Crear', subject: 'registro de compras' },
      { action: 'Eliminar', subject: 'registro de compras' },
      { action: 'Ver', subject: 'registro de ventas' },
      { action: 'Editar', subject: 'registro de ventas' },
      { action: 'Crear', subject: 'registro de ventas' },
      { action: 'Eliminar', subject: 'registro de ventas' },
      { action: 'Ver', subject: 'compras por rubros' },
      { action: 'Ver', subject: 'cuentas por cobrar' },
      { action: 'Editar', subject: 'cuentas por cobrar' },
      { action: 'Ver', subject: 'cuentas por pagar' },
      { action: 'Editar', subject: 'cuentas por pagar' },
      { action: 'Ver', subject: 'clientes' },
      { action: 'Editar', subject: 'clientes' },
      { action: 'Ver', subject: 'proveedores' },
      { action: 'Editar', subject: 'proveedores' },
      { action: 'Ver', subject: 'cuentas financieras' },
      { action: 'Editar', subject: 'cuentas financieras' },
      { action: 'Crear', subject: 'cuentas financieras' },
      { action: 'Ver', subject: 'caja y banco' },
      { action: 'Editar', subject: 'caja y banco' },
      { action: 'Crear', subject: 'caja y banco' },
      { action: 'Eliminar', subject: 'caja y banco' },
      { action: 'Ver', subject: 'tipos de ingresos y gastos' },
      { action: 'Editar', subject: 'tipos de ingresos y gastos' },
      { action: 'Crear', subject: 'tipos de ingresos y gastos' },
      { action: 'Eliminar', subject: 'tipos de ingresos y gastos' },
      { action: 'Ver', subject: 'sucursales' },
      { action: 'Editar', subject: 'sucursales' },
      { action: 'Eliminar', subject: 'sucursales' },
      { action: 'Crear', subject: 'sucursales' },
      { action: 'Ver', subject: 'actividades' },
      { action: 'Editar', subject: 'actividades' },
      { action: 'Eliminar', subject: 'actividades' },
      { action: 'Crear', subject: 'actividades' },
      { action: 'Ver', subject: 'rubros' },
      { action: 'Editar', subject: 'rubros' },
      { action: 'Eliminar', subject: 'rubros' },
      { action: 'Crear', subject: 'rubros' },
      { action: 'Ver', subject: 'recursos humanos' },
      { action: 'Editar', subject: 'recursos humanos' },
      { action: 'Eliminar', subject: 'recursos humanos' },
      { action: 'Crear', subject: 'recursos humanos' },
      { action: 'Ver', subject: 'log' },
      { action: 'Ver', subject: 'ufv' },
      { action: 'Editar', subject: 'ufv' },
      { action: 'Eliminar', subject: 'ufv' },
      { action: 'Crear', subject: 'ufv' },
      { action: 'Ver', subject: 'usuarios' },
      { action: 'Editar', subject: 'usuarios' },
      { action: 'Eliminar', subject: 'usuarios' },
      { action: 'Crear', subject: 'usuarios' },
      { action: 'Ver', subject: 'empresas' },
      { action: 'Editar', subject: 'empresas' },
      { action: 'Eliminar', subject: 'empresas' },
      { action: 'Crear', subject: 'empresas' },
      { action: 'Ver', subject: 'roles' },
      { action: 'Editar', subject: 'roles' },
      { action: 'Eliminar', subject: 'roles' },
      { action: 'Crear', subject: 'roles' },
       
    ];

    const permisosCount = await Permission.count();
    if (permisosCount === 0) {
      await Permission.bulkCreate(lista_permisos);
      return res.status(200).send('Permisos creados exitosamente.');
    }

    res.status(200).send('Los permisos ya estaban configurados.');
  } catch (error) {
    console.error('Error durante la configuración de permisos:', error);
    res.status(500).send(`Error durante la configuración de permisos: ${error.message}`);
  }
});
*/




app.use(fileUpload());
app.use(express.static('public'));
app.use(routes);
app.listen(port, () => {
  console.log(`Server OK http://localhost:${port}`);
});
