const { find, list, create, update, destroy } = require("../services");
const { Op } = require("sequelize");
const { format } = require("date-fns");

const VentaController = {
  addcsv: async (req, res) => {
    try {
      const { csvData, sucursal_id } = req.body;
      const sucursal = await find({
        modelName: "Sucursal",
        id: sucursal_id,
        include: [{ modelName: "Empresa" }],
      });
      let aceptados = 0;
      let rechazados = 0;

      for (const item of csvData) {
        const [dia, mes, año] = item.fecha_factura.split("/");
        const fechaFactura = `${año}-${mes}-${dia}`;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaFactura)) {
          rechazados++;
          continue;
        }

        const facturaExistente = await find({
          modelName: "Venta",
          where: {
            sucursal_id,
            nro_factura: item.nro_factura,
            fecha_factura,
          },
          failIfNotFound: false,
        });

        if (facturaExistente) {
          rechazados++;
          continue;
        }

        const countVentas = await list({
          modelName: "Venta",
          where: {
            sucursal_id,
            fecha_factura: {
              [Op.between]: [new Date(año, mes - 1, 1), new Date(año, mes, 0)],
            },
          },
        });

        const estadoMap = {
          VALIDA: "V",
          ANULADA: "A",
          "EMITIDA EN CONTINGENCIA": "C",
          "LIBRE CONSIGNACIÓN": "L",
        };

        await create({
          modelName: "Venta",
          data: {
            ...item,
            sucursal_id,
            nro: countVentas.length + 1,
            fecha_factura: fechaFactura,
            estado: estadoMap[item.estado] || "V",
            codigo_control: item.codigo_control || 0,
            tipo_venta: item.tipo_venta === "OTROS" ? 0 : 1,
          },
        });

        aceptados++;
      }

      if (aceptados > 0) {
        await create({
          modelName: "Registro",
          data: {
            usuario: req.user.nombre,
            detalle: `Cargó ventas masivas: ${aceptados}`,
            accion: "Creación",
            empresa_id: sucursal.empresa_id,
          },
        });
      }

      res.json({
        message: "Proceso de carga completado",
        ventasAceptadas: aceptados,
        ventasRechazadas: rechazados,
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addventa: async (req, res) => {
    try {
      const ventaData = req.body;
      const sucursal = await find({
        modelName: "Sucursal",
        id: ventaData.sucursal_id,
        include: [{ modelName: "Empresa" }],
      });

      const count = await list({
        modelName: "Venta",
        where: {
          sucursal_id: ventaData.sucursal_id,
          fecha_factura: {
            [Op.between]: [
              new Date(
                ...ventaData.fecha_factura
                  .split("-")
                  .map((v, i) => (i === 1 ? v - 1 : v))
              ),
              new Date(
                ...ventaData.fecha_factura
                  .split("-")
                  .map((v, i) => (i === 1 ? v : v))
              ),
            ],
          },
        },
      });

      ventaData.nro = count.length + 1;
      ventaData.codigo_control = ventaData.codigo_control || 0;
      const venta = await create({ modelName: "Venta", data: ventaData });

      // Cliente
      const cliente = await find({
        modelName: "Cliente",
        where: {
          nit_ci_cex: ventaData.nit_ci_cliente,
          empresa_id: sucursal.Empresa.id,
        },
        failIfNotFound: false,
      });

      if (cliente) {
        await update({
          modelName: "Cliente",
          id: cliente.id,
          data: {
            complemento: ventaData.complemento,
            razon_social: ventaData.razon_social,
          },
        });
      } else {
        await create({
          modelName: "Cliente",
          data: {
            empresa_id: sucursal.Empresa.id,
            nit_ci_cex: ventaData.nit_ci_cliente,
            complemento: ventaData.complemento,
            razon_social: ventaData.razon_social,
          },
        });
      }

      res.json({ message: "Venta registrada", success: true });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
  editventa: async (req, res) => {
    try {
      const ventaData = req.body;
      const venta = await find({ modelName: "Venta", id: ventaData.venta_id });

      await update({
        modelName: "Venta",
        id: venta.id,
        data: {
          estado: ventaData.estado,
          tipo_venta: ventaData.tipo_venta,
          fecha_factura: ventaData.fecha_factura,
          nit_ci_cliente: ventaData.nit_ci_cliente,
          complemento: ventaData.complemento,
          razon_social: ventaData.razon_social,
          nro_factura: ventaData.nro_factura,
          codigo_autorizacion: ventaData.codigo_autorizacion,
          codigo_control: ventaData.codigo_control,
          importe_total: ventaData.importe_total,
          importe_ice: ventaData.importe_ice,
          importe_iehd: ventaData.importe_iehd,
          importe_ipj: ventaData.importe_ipj,
          tasas: ventaData.tasas,
          actividad: ventaData.actividad,
          otros_no_sujetos_iva: ventaData.otros_no_sujetos_iva,
          exportaciones_operaciones_exentas:
            ventaData.exportaciones_operaciones_exentas,
          ventas_gravadas_tasa_cero: ventaData.ventas_gravadas_tasa_cero,
          subtotal: ventaData.subtotal,
          descuentos_bonificaciones_rebajas_sujetas_iva:
            ventaData.descuentos_bonificaciones_rebajas_sujetas_iva,
          importe_gift_card: ventaData.importe_gift_card,
          importe_basico_debito_fiscal: ventaData.importe_basico_debito_fiscal,
          debito_fiscal: ventaData.debito_fiscal,
        },
      });

      res.json({ message: "Venta actualizada", success: true });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
  getallventas: async (req, res) => {
    try {
      const { sucursal_id, mes, gestion } = req.query;
      const ventas = await list({
        modelName: "Venta",
        where: {
          sucursal_id,
          fecha_factura: {
            [Op.between]: [
              new Date(gestion, mes - 1, 1),
              new Date(gestion, mes, 0),
            ],
          },
        },
      });
      const salesKeys = ventas.map(
        (v) =>
          `${v.fecha_factura}~${v.nro_factura}~${v.nit_ci_cliente}~${v.subtotal}`
      );
      res.json({ salesKeys });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getventas: async (req, res) => {
    try {
      const { sucursal_id, mes, gestion } = req.query;
      if (!sucursal_id || isNaN(parseInt(mes)) || isNaN(parseInt(gestion))) {
        return res.status(400).json({ message: "Parámetros inválidos." });
      }

      const ultimaVenta = await find({
        modelName: "Venta",
        where: { sucursal_id },
        order: [["fecha_factura", "DESC"]],
      });

      const ventas = await list({
        modelName: "Venta",
        where: {
          sucursal_id,
          fecha_factura: {
            [Op.between]: [
              new Date(gestion, mes - 1, 1),
              new Date(gestion, mes, 0),
            ],
          },
        },
        order: [["fecha_factura", "ASC"]],
      });

      ventas.forEach((venta, index) => (venta.nro = index + 1));
      ventas.reverse();

      const sucursal = await find({
        modelName: "Sucursal",
        id: sucursal_id,
        include: [{ modelName: "Empresa" }],
      });
      const empresa = sucursal.Empresa;
      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        sucursal: `${sucursal.codigo} - ${sucursal.zona_lugar} - ${sucursal.direccion}`,
        titular: empresa.titular,
        ci: empresa.ci,
      };

      res.json({
        ventas,
        dataCustomer,
        codigo_autorizacion_last: ultimaVenta?.codigo_autorizacion || null,
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
  getCPC: async (req, res) => {
    try {
      const { sucursal_id } = req.query;

      const ventas = await list({
        modelName: "Venta",
        where: {
          sucursal_id,
          estado: { [Op.ne]: "A" },
        },
        include: [
          { modelName: "Efectivo", as: "efectivoVenta", required: false },
        ],
        order: [["nro", "ASC"]],
      });

      const ventasSinEfectivo = ventas.filter((v) => !v.efectivoVenta);

      const sucursal = await find({
        modelName: "Sucursal",
        id: sucursal_id,
        include: [{ modelName: "Empresa" }],
      });

      const dataCustomer = {
        nit: sucursal.Empresa.nit,
        razon_social: sucursal.Empresa.razon_social,
        sucursal: `${sucursal.codigo} - ${sucursal.zona_lugar} - ${sucursal.direccion}`,
        titular: sucursal.Empresa.titular,
        ci: sucursal.Empresa.ci,
      };

      res.json({ ventas: ventasSinEfectivo, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteventa: async (req, res) => {
    try {
      const { id } = req.params;
      await destroy({ modelName: "Venta", id });
      res.status(200).json({ message: "Venta eliminada correctamente" });
    } catch (error) {
      if (error.name === "SequelizeForeignKeyConstraintError") {
        res
          .status(400)
          .json({
            message:
              "Este registro tiene dependencias y no puede ser eliminado.",
          });
      } else {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message });
      }
    }
  },
  editmetodopago: async (req, res) => {
    try {
      const { venta_selected } = req.body;

      const venta = await find({ modelName: "Venta", id: venta_selected.id });

      await update({
        modelName: "Venta",
        id: venta.id,
        data: { fecha_limite: venta_selected.fecha_limite },
      });

      if (venta.estado !== "A" && venta_selected.cuenta_id !== "none") {
        await create({
          modelName: "Efectivo",
          data: {
            sucursal_id: venta.sucursal_id,
            venta_id: venta.id,
            ref_key: "VENTA",
            detalle: venta.razon_social,
            fecha: venta_selected.fecha_pago,
            monto: parseFloat(
              (
                venta.importe_total -
                venta.descuentos_bonificaciones_rebajas_sujetas_iva
              ).toFixed(2)
            ),
            movimiento: "Ingreso",
            respaldo: "FACTURA",
            nro_documento: venta.nro_factura,
            cuenta_id: venta_selected.cuenta_id,
          },
        });
      }

      res.status(201).json({ message: "Datos actualizados exitosamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
  editmetodopagoLote: async (req, res) => {
    try {
      const { selected, cuenta_id, fecha_limite, fecha_pago } = req.body;

      for (const item of selected) {
        const venta = await find({ modelName: "Venta", id: item.id });

        await update({
          modelName: "Venta",
          id: venta.id,
          data: { fecha_limite },
        });

        if (venta.estado !== "A" && cuenta_id !== "none") {
          await create({
            modelName: "Efectivo",
            data: {
              sucursal_id: venta.sucursal_id,
              venta_id: venta.id,
              ref_key: "VENTA",
              detalle: venta.razon_social,
              fecha: fecha_pago,
              monto: parseFloat(
                (
                  venta.importe_total -
                  venta.descuentos_bonificaciones_rebajas_sujetas_iva
                ).toFixed(2)
              ),
              movimiento: "Ingreso",
              respaldo: "FACTURA",
              nro_documento: venta.nro_factura,
              cuenta_id,
            },
          });
        }
      }

      res.status(201).json({ message: "Datos actualizados exitosamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};
module.exports = VentaController;
