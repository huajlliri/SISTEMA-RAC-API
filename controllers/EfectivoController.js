const { Op } = require("sequelize");
const {
  create,
  update,
  destroy,
  find,
  list,
  adjustCuentaSaldo,
  adjustTransferencia,
  registroLog,
} = require("../services");
const models = require('../models/Relaciones');

const EfectivoController = {
  pushcuenta: async (req, res) => {
    try {
      const { id, nombre, detalle, sucursal_id } = req.body;
      let cuenta;
      if (id) {
        cuenta = await update({
          modelName: "Cuenta",
          id,
          data: { nombre, detalle },
        });
      } else {
        cuenta = await create({
          modelName: "Cuenta",
          data: { sucursal_id, nombre, detalle, saldo: 0.0 },
        });
        const fecha = cuenta.createdAt.toISOString().split("T")[0];
        await create({
          modelName: "Efectivo",
          data: {
            sucursal_id,
            fecha,
            monto: 0.0,
            movimiento: "Ingreso",
            cuenta_id: cuenta.id,
            ref_key: "SALDO INICIAL",
          },
        });
      }
      res.status(201).json({ message: "Éxito" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  pushCaja: async (req, res) => {
    try {
      const { id, caja_saldo_inicial, caja_fecha } = req.body;
      await update({
        modelName: "Efectivo",
        id,
        data: { monto: caja_saldo_inicial, fecha: caja_fecha },
      });
      res.status(201).json({ message: "Éxito" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getcuentas: async (req, res) => {
    try {
      const { sucursal_id } = req.params;
      const cuentas = await list({
        modelName: "Cuenta",
        where: { sucursal_id },
      });
      res.json({ cuentas });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletecuenta: async (req, res) => {
    try {
      const { id } = req.params;
      await destroy({ modelName: "Cuenta", id });
      res.status(200).json({ message: "Eliminación exitosa" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getingresosgastos: async (req, res) => {
    try {
      const { empresa_id } = req.query;
      const ingresos = await list({
        modelName: "Ingreso",
        where: { empresa_id },
      });
      const gastos = await list({ modelName: "Gasto", where: { empresa_id } });
      res.json({ ingresos, gastos });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addingresogasto: async (req, res) => {
    try {
      const { nombre, tipo, empresa_id } = req.body;
      const Modelo = tipo === "Ingreso" ? "Ingreso" : "Gasto";
      await find({
        modelName: Modelo,
        where: { nombre, empresa_id },
        failIfFound: true,
        failMessage: "El valor ya está registrado.",
      });
      await create({ modelName: Modelo, data: { nombre, empresa_id } });
      await registroLog({
        usuario: req.user.nombre,
        detalle: `Creó ${tipo}: ${nombre}`,
        accion: "Creación",
        empresa_id,
      });
      res.status(201).json({ message: `${tipo} creado exitosamente` });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteingresogasto: async (req, res) => {
    try {
      const { id } = req.params;
      const ingreso = await find({ modelName: "Ingreso", id });
      const gasto = await find({ modelName: "Gasto", id });
      if (ingreso) {
        await registroLog({
          usuario: req.user.nombre,
          detalle: `Eliminó ingreso: ${ingreso.nombre}`,
          accion: "Eliminación",
          empresa_id: ingreso.empresa_id,
        });
        await destroy({ modelName: "Ingreso", id });
      } else if (gasto) {
        await registroLog({
          usuario: req.user.nombre,
          detalle: `Eliminó gasto: ${gasto.nombre}`,
          accion: "Eliminación",
          empresa_id: gasto.empresa_id,
        });
        await destroy({ modelName: "Gasto", id });
      } else {
        return res.status(404).json({ message: "Dato no encontrado" });
      }
      res.status(200).json({ message: "Eliminación exitosa" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editingresogasto: async (req, res) => {
    try {
      const { id, nombre, tipo, empresa_id } = req.body;
      const Modelo = tipo === "Ingreso" ? "Ingreso" : "Gasto";
      await find({
        modelName: Modelo,
        where: { nombre, empresa_id, id: { [Op.ne]: id } },
        failIfFound: true,
        failMessage: "El dato ya está registrado.",
      });
      await update({ modelName: Modelo, id, data: { nombre } });
      res.status(201).json({ message: "Dato actualizado exitosamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getefectivos: async (req, res) => {
    try {
      const { sucursal_id, mes, gestion, dia } = req.query;
      if (!sucursal_id || isNaN(mes) || isNaN(gestion)) {
        return res.status(400).json({ message: "Parámetros inválidos." });
      }

      const where = { sucursal_id };
      if (dia) {
        where.fecha = dia;
      } else {
        where.fecha = {
          [Op.and]: [
            { [Op.gte]: new Date(gestion, mes - 1, 1) },
            { [Op.lte]: new Date(gestion, mes, 0) },
          ],
        };
      }

      const efectivos = await list({
        modelName: "Efectivo",
        where,
        include: [
          { model: models.Venta, as: "venta", required: false },
          { model: models.Compra, as: "compra", required: false },
          { model: models.Cuenta, as: "cuenta", required: true },
          { model: models.Cuenta, as: "cuentaRef", required: false },
          { model: models.Ingreso, as: "ingreso", required: false },
          { model: models.Gasto, as: "gasto", required: false },
        ],
        order: [
          ["fecha", "DESC"],
          ["createdAt", "DESC"],
        ],
      });

      const sucursal = await find({
        modelName: "Sucursal",
        id: sucursal_id,
        include: { model: models.Empresa },
      });
      const cuentas = await list({
        modelName: "Cuenta",
        where: { sucursal_id },
      });

      const dataCustomer = {
        nit: sucursal.Empresa.nit,
        razon_social: sucursal.Empresa.razon_social,
        sucursal: `${sucursal.codigo} - ${sucursal.zona_lugar} - ${sucursal.direccion}`,
        titular: sucursal.Empresa.titular,
        ci: sucursal.Empresa.ci,
      };

      res.json({ efectivos, dataCustomer, cuentas });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addingreso: async (req, res) => {
    try {
      const {
        nombre,
        ci,
        sucursal_id,
        ref_id,
        nro_documento,
        respaldo,
        monto,
        fecha,
        detalle,
        cuenta_id,
      } = req.body;

      const ingreso = await find({ modelName: "Ingreso", id: ref_id });
      if (!ingreso)
        return res.status(404).json({ message: "Ingreso no encontrado." });

      await create({
        modelName: "Efectivo",
        data: {
          sucursal_id,
          ingreso_id: ref_id,
          ref_key: ingreso.nombre,
          detalle,
          fecha,
          monto,
          movimiento: "Ingreso",
          respaldo,
          nombre,
          ci,
          nro_documento,
          cuenta_id,
        },
      });

      await adjustCuentaSaldo({
        cuentaId: cuenta_id,
        monto,
        operacion: "sumar",
      });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Registró un ingreso: ${monto}`,
        accion: "Creación",
        empresa_id: ingreso.empresa_id,
      });

      res.status(201).json({ message: "Ingreso registrado" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addgasto: async (req, res) => {
    try {
      const {
        nombre,
        ci,
        sucursal_id,
        ref_id,
        monto,
        nro_documento,
        respaldo,
        fecha,
        detalle,
        cuenta_id,
      } = req.body;

      const gasto = await find({ modelName: "Gasto", id: ref_id });
      if (!gasto)
        return res.status(404).json({ message: "Gasto no encontrado." });

      await create({
        modelName: "Efectivo",
        data: {
          sucursal_id,
          gasto_id: ref_id,
          ref_key: gasto.nombre,
          detalle,
          fecha,
          monto,
          movimiento: "Egreso",
          respaldo,
          nombre,
          ci,
          nro_documento,
          cuenta_id,
        },
      });

      await adjustCuentaSaldo({
        cuentaId: cuenta_id,
        monto,
        operacion: "restar",
      });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Registró un gasto: ${monto}`,
        accion: "Creación",
        empresa_id: gasto.empresa_id,
      });

      res.status(201).json({ message: "Gasto registrado" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addtransferencia: async (req, res) => {
    try {
      const {
        sucursal_id,
        monto,
        fecha,
        nro_documento,
        respaldo,
        detalle,
        cuenta_id,
        cuenta_ref_id,
      } = req.body;

      await create({
        modelName: "Efectivo",
        data: {
          sucursal_id,
          ref_key: "TRANSFERENCIA",
          detalle,
          fecha,
          monto,
          movimiento: "Transferencia",
          respaldo,
          nro_documento,
          cuenta_id,
          cuenta_ref_id,
        },
      });

      await adjustTransferencia({
        cuentaOrigenId: cuenta_id,
        cuentaDestinoId: cuenta_ref_id,
        monto,
      });

      const sucursal = await find({ modelName: "Sucursal", id: sucursal_id });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Registró transferencia de ${monto}`,
        accion: "Creación",
        empresa_id: sucursal.empresa_id,
      });

      res.status(201).json({ message: "Transferencia registrada" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editEfectivoIngresoGasto: async (req, res) => {
    try {
      const {
        nombre,
        ci,
        id,
        ref_id,
        nro_documento,
        respaldo,
        monto,
        fecha,
        detalle,
        cuenta_id,
      } = req.body;

      const efectivo = await find({ modelName: "Efectivo", id });

      if (
        efectivo.movimiento === "Ingreso" ||
        efectivo.movimiento === "Egreso"
      ) {
        if (ref_id !== "SALDO INICIAL") {
          const refModel =
            efectivo.movimiento === "Ingreso" ? "Ingreso" : "Gasto";
          const valor = await find({ modelName: refModel, id: ref_id });
          efectivo.ref_key = valor.nombre;
          efectivo.ingreso_id =
            efectivo.movimiento === "Ingreso" ? ref_id : null;
          efectivo.gasto_id = efectivo.movimiento === "Egreso" ? ref_id : null;
        } else {
          efectivo.ref_key = "SALDO INICIAL";
        }

        await adjustCuentaSaldo({
          cuentaId: efectivo.cuenta_id,
          monto: efectivo.monto,
          operacion: efectivo.movimiento === "Ingreso" ? "restar" : "sumar",
        });
        await adjustCuentaSaldo({
          cuentaId,
          monto,
          operacion: efectivo.movimiento === "Ingreso" ? "sumar" : "restar",
        });
      }

      await update({
        modelName: "Efectivo",
        id,
        data: {
          detalle,
          fecha,
          monto,
          respaldo,
          nombre,
          ci,
          nro_documento,
          cuenta_id,
        },
      });

      res.status(201).json({ message: "Éxito" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editEfectivoFactura: async (req, res) => {
    try {
      const { fecha_limite, id, fecha_pago, cuenta_id } = req.body;

      const efectivo = await find({ modelName: "Efectivo", id });

      if (
        efectivo.movimiento === "Ingreso" ||
        efectivo.movimiento === "Egreso"
      ) {
        const facturaModel =
          efectivo.movimiento === "Ingreso" ? "Venta" : "Compra";
        const factura = await find({
          modelName: facturaModel,
          id:
            efectivo.movimiento === "Ingreso"
              ? efectivo.venta_id
              : efectivo.compra_id,
        });
        await update({
          modelName: facturaModel,
          id: factura.id,
          data: { fecha_limite },
        });
      }

      if (cuenta_id === "none") {
        await adjustCuentaSaldo({
          cuentaId: efectivo.cuenta_id,
          monto: efectivo.monto,
          operacion: efectivo.movimiento === "Ingreso" ? "restar" : "sumar",
        });
        await destroy({ modelName: "Efectivo", id });
      } else {
        await adjustCuentaSaldo({
          cuentaId: efectivo.cuenta_id,
          monto: efectivo.monto,
          operacion: efectivo.movimiento === "Ingreso" ? "restar" : "sumar",
        });
        await adjustCuentaSaldo({
          cuentaId,
          monto: efectivo.monto,
          operacion: efectivo.movimiento === "Ingreso" ? "sumar" : "restar",
        });
        await update({
          modelName: "Efectivo",
          id,
          data: { cuenta_id, fecha: fecha_pago },
        });
      }

      res.status(201).json({ message: "Éxito" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteefectivo: async (req, res) => {
    try {
      const { id } = req.params;

      const efectivo = await find({ modelName: "Efectivo", id });

      if (
        efectivo.movimiento === "Ingreso" ||
        efectivo.movimiento === "Egreso" ||
        efectivo.movimiento === "Transferencia"
      ) {
        await adjustCuentaSaldo({
          cuentaId: efectivo.cuenta_id,
          monto: efectivo.monto,
          operacion: efectivo.movimiento === "Ingreso" ? "restar" : "sumar",
        });

        if (efectivo.movimiento === "Transferencia") {
          await adjustCuentaSaldo({
            cuentaId: efectivo.cuenta_ref_id,
            monto: efectivo.monto,
            operacion: "restar",
          });
        }
      }

      const sucursal = await find({
        modelName: "Sucursal",
        id: efectivo.sucursal_id,
      });

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Eliminó efectivo: ${efectivo.movimiento} - ${efectivo.monto}`,
        accion: "Eliminación",
        empresa_id: sucursal.empresa_id,
      });

      await destroy({ modelName: "Efectivo", id });

      res.status(200).json({ message: "Eliminación exitosa" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = EfectivoController;
