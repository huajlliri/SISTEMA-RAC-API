const { Op } = require("sequelize");
const {
  create,
  update,
  destroy,
  find,
  list,
  adjustCuentaSaldo,
  registroLog,
} = require("../services");
const Empresa = require('../models/Empresa');
const Sucursal = require('../models/Sucursal');
const Efectivo = require('../models/Efectivo');
const Compra = require('../models/Compra');
const models = require('../models/Relaciones')



const CompraController = {
  getcompras: async (req, res) => {
    try {
      const { sucursal_id, mes, gestion } = req.query;

      if (!sucursal_id || isNaN(mes) || isNaN(gestion)) {
        return res.status(400).json({ message: "Parámetros inválidos." });
      }

      const compras = await list({
        modelName: "Compra",
        where: {
          sucursal_id,
          fecha_factura_dui_dim: {
            [Op.between]: [
              new Date(gestion, mes - 1, 1),
              new Date(gestion, mes, 0),
            ],
          },
        },
        order: [["fecha_factura_dui_dim", "ASC"]],
      });

      compras.forEach((compra, index) => (compra.nro = index + 1));
      compras.reverse();
      
      const sucursal = await find({
        modelName: "Sucursal",
        id: sucursal_id,
        include: [{ model: models.Empresa }], 
      });

      const dataCustomer = {
        nit: sucursal.Empresa.nit,
        razon_social: sucursal.Empresa.razon_social,
        sucursal: `${sucursal.codigo} - ${sucursal.zona_lugar} - ${sucursal.direccion}`,
        titular: sucursal.Empresa.titular,
        ci: sucursal.Empresa.ci,
      };

      res.json({ compras, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getallcompras: async (req, res) => {
    try {
      const { sucursal_id, mes, gestion } = req.query;

      if (!sucursal_id) {
        return res.status(400).json({ message: "Parámetros inválidos." });
      }

      const allcompras = await list({
        modelName: "Compra",
        where: {
          sucursal_id,
          fecha_factura_dui_dim: {
            [Op.between]: [
              new Date(gestion, mes - 1, 1),
              new Date(gestion, mes, 0),
            ],
          },
        },
      });

      const salesKeys = allcompras.map(
        (sale) =>
          `${sale.fecha_factura_dui_dim}~${sale.nro_factura}~${sale.nro_dui_dim}~${sale.nit_proveedor}~${sale.subtotal}`
      );

      res.json({ salesKeys });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getcomprasrubros: async (req, res) => {
    try {
      const { sucursal_id, fecha_inicio, fecha_final } = req.query;

      if (!sucursal_id) {
        return res.status(400).json({ message: "Parámetros inválidos." });
      }

      const compras = await list({
        modelName: "Compra",
        where: {
          sucursal_id,
          fecha_factura_dui_dim: {
            [Op.between]: [
              new Date(fecha_inicio),
              new Date(new Date(fecha_final).getTime() + 24 * 60 * 60 * 1000),
            ],
          },
        },
        order: [["nro", "ASC"]],
      });

      const comprasPorRubro = compras.reduce((acc, compra) => {
        if (!acc[compra.rubro]) {
          acc[compra.rubro] = [];
        }
        acc[compra.rubro].push(compra);
        return acc;
      }, {});

      const sucursal = await find({
        modelName: "Sucursal",
        id: sucursal_id,
        include: [{ model: models.Empresa }],
      });

      const dataCustomer = {
        nit: sucursal.Empresa.nit,
        razon_social: sucursal.Empresa.razon_social,
        sucursal: `${sucursal.codigo} - ${sucursal.zona_lugar} - ${sucursal.direccion}`,
        titular: sucursal.Empresa.titular,
        ci: sucursal.Empresa.ci,
      };

      res.json({ compras: comprasPorRubro, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletecompra: async (req, res) => {
    try {
      const { id } = req.params;

      const compra = await find({
        modelName: "Compra",
        id,
        failIfNotFound: true,
        failMessage: "Compra no encontrada",
      });

      const efectivo = await find({
        modelName: "Efectivo",
        where: { compra_id: compra.id },
        failIfNotFound: false,
      });
      if (efectivo) {
        await adjustCuentaSaldo({
          cuentaId: efectivo.cuenta_id,
          monto: efectivo.monto,
          operacion: "sumar",
        });
        await destroy({ modelName: "Efectivo", id: efectivo.id });
      }

      const sucursal = await find({
        modelName: "Sucursal",
        id: compra.sucursal_id,
      });
      await registroLog({
        usuario: req.user.nombre,
        detalle: `Eliminó compra factura: ${compra.nro_factura}`,
        accion: "Eliminación",
        empresa_id: sucursal.empresa_id,
      });

      await destroy({ modelName: "Compra", id: compra.id });

      res.status(200).json({ message: "Eliminación exitosa" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addcompra: async (req, res) => {
    try {
      const compraData = req.body;
      const { sucursal_id, fecha_factura_dui_dim } = compraData;

      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha_factura_dui_dim)) {
        return res.status(400).json({ message: "Fecha de factura no válida." });
      }

      const [añoFactura, mesFactura] = fecha_factura_dui_dim
        .split("-")
        .map(Number);

      await find({
        modelName: "Compra",
        where: {
          sucursal_id,
          nro_factura: compraData.nro_factura,
          nit_proveedor: compraData.nit_proveedor,
          nro_dui_dim: compraData.nro_dui_dim,
          fecha_factura_dui_dim: {
            [Op.between]: [
              new Date(añoFactura, mesFactura - 1, 1),
              new Date(añoFactura, mesFactura, 0),
            ],
          },
        },
        failIfFound: true,
        failMessage: "Número de factura ya registrado",
      });

      const countCompras = await list({
        modelName: "Compra",
        where: {
          sucursal_id,
          fecha_factura_dui_dim: {
            [Op.between]: [
              new Date(añoFactura, mesFactura - 1, 1),
              new Date(añoFactura, mesFactura, 0),
            ],
          },
        },
      });

      compraData.nro = countCompras.length + 1;
      compraData.codigo_control ||= 0;
      compraData.nro_factura ||= 0;
      compraData.nro_dui_dim ||= 0;

      const compra = await create({ modelName: "Compra", data: compraData });

      if (compraData.cuenta_id !== "none") {
        const monto = parseFloat(
          (
            compra.importe_total_compra -
            compra.descuentos_bonificaciones_rebajas_sujetas_iva
          ).toFixed(2)
        );
        await create({
          modelName: "Efectivo",
          data: {
            sucursal_id,
            compra_id: compra.id,
            ref_key: "COMPRA",
            detalle: compra.razon_social_proveedor,
            fecha: compra.fecha_factura_dui_dim,
            monto,
            movimiento: "Egreso",
            cuenta_id: compraData.cuenta_id,
            respaldo: "FACTURA",
            nro_documento: compra.nro_factura,
          },
        });
        await adjustCuentaSaldo({
          cuentaId: compraData.cuenta_id,
          monto,
          operacion: "restar",
        });
      }

      const sucursal = await find({
        modelName: "Sucursal",
        id: sucursal_id,
        include: [{ model: models.Empresa }],
      });
      console.log(sucursal);

      await registroLog({
        usuario: req.user.nombre,
        detalle: `Registró una compra factura: ${compra.nro_factura}`,
        accion: "Creación",
        empresa_id: sucursal.empresa_id,
      });

      res.status(201).json({ message: "Compra registrada", success: true });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editcompra: async (req, res) => {
    try {
      const compraData = req.body;
      const { sucursal_id, compra_id } = compraData;

      const compra = await find({
        modelName: "Compra",
        id: compra_id,
        where: { sucursal_id },
        failIfNotFound: true,
        failMessage: "Compra no encontrada",
      });

      compraData.codigo_control ||= 0;
      compraData.nro_factura ||= 0;
      compraData.nro_dui_dim ||= 0;

      const updatedCompra = await update({
        modelName: "Compra",
        id: compra.id,
        data: {
          tipo_compra: compraData.tipo_compra,
          fecha_factura_dui_dim: compraData.fecha_factura_dui_dim,
          nit_proveedor: compraData.nit_proveedor,
          nro_dui_dim: compraData.nro_dui_dim,
          razon_social_proveedor: compraData.razon_social_proveedor,
          nro_factura: compraData.nro_factura,
          codigo_autorizacion: compraData.codigo_autorizacion,
          codigo_control: compraData.codigo_control,
          importe_total_compra: compraData.importe_total_compra,
          importe_ice: compraData.importe_ice,
          importe_iehd: compraData.importe_iehd,
          importe_ipj: compraData.importe_ipj,
          tasas: compraData.tasas,
          otros_no_sujetos_credito_fiscal:
            compraData.otros_no_sujetos_credito_fiscal,
          importes_exentos: compraData.importes_exentos,
          importe_compras_gravadas_tasa_cero:
            compraData.importe_compras_gravadas_tasa_cero,
          subtotal: compraData.subtotal,
          descuentos_bonificaciones_rebajas_sujetas_iva:
            compraData.descuentos_bonificaciones_rebajas_sujetas_iva,
          importe_gift_card: compraData.importe_gift_card,
          importe_base_cf: compraData.importe_base_cf,
          credito_fiscal: compraData.credito_fiscal,
          rubro: compraData.rubro,
        },
      });

      const efectivo = await find({
        modelName: "Efectivo",
        where: { compra_id: updatedCompra.id },
        failIfNotFound: false,
      });
      if (efectivo) {
        const nuevoMonto = parseFloat(
          (
            updatedCompra.importe_total_compra -
            updatedCompra.descuentos_bonificaciones_rebajas_sujetas_iva
          ).toFixed(2)
        );
        await adjustCuentaSaldo({
          cuentaId: efectivo.cuenta_id,
          monto: efectivo.monto,
          operacion: "sumar",
        });
        await update({
          modelName: "Efectivo",
          id: efectivo.id,
          data: { monto: nuevoMonto },
        });
        await adjustCuentaSaldo({
          cuentaId: efectivo.cuenta_id,
          monto: nuevoMonto,
          operacion: "restar",
        });
      }

      res.status(201).json({ message: "Compra actualizada", success: true });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addcsvCompras: async (req, res) => {
    try {
      const { sucursal_id, csvData } = req.body;
      let aceptados = 0;
      let rechazados = 0;

      for (const item of csvData) {
        try {
          const fechaFactura = item.fecha_factura_dui_dim;
          const [dia, mes, año] = fechaFactura.split("/");
          const fechaFacturaDB = `${año}-${mes}-${dia}`;

          await find({
            modelName: "Compra",
            where: {
              sucursal_id,
              nro_factura: item.nro_factura,
              nit_proveedor: item.nit_proveedor,
              nro_dui_dim: item.nro_dui_dim,
              fecha_factura_dui_dim: {
                [Op.between]: [
                  new Date(año, mes - 1, 1),
                  new Date(año, mes, 0),
                ],
              },
            },
            failIfFound: true,
          });

          const compra = await create({
            modelName: "Compra",
            data: {
              ...item,
              sucursal_id,
              fecha_factura_dui_dim: fechaFacturaDB,
            },
          });

          aceptados++;
        } catch (err) {
          rechazados++;
        }
      }

      res
        .status(201)
        .json({ message: "Carga finalizada", aceptados, rechazados });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getCPP: async (req, res) => {
    try {
      const { sucursal_id } = req.query;

      if (!sucursal_id) {
        return res.status(400).json({ message: "Sucursal inválida." });
      }

      const compras = await list({
        modelName: "Compra",
        where: {
          sucursal_id,
          "$efectivoCompra.id$": null,
        },
        include: [{ model: Efectivo, as: "efectivoCompra" }],
        order: [["nro", "ASC"]],
      });

      res.json({ compras });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editmetodopagoCompra: async (req, res) => {
    try {
      const { compra_selected } = req.body;

      const compra = await find({
        modelName: "Compra",
        id: compra_selected.id,
        failIfNotFound: true,
      });

      await update({
        modelName: "Compra",
        id: compra.id,
        data: { fecha_limite: compra_selected.fecha_limite },
      });

      if (compra_selected.cuenta_id !== "none") {
        const monto = parseFloat(
          (
            compra.importe_total_compra -
            compra.descuentos_bonificaciones_rebajas_sujetas_iva
          ).toFixed(2)
        );
        await create({
          modelName: "Efectivo",
          data: {
            sucursal_id: compra.sucursal_id,
            compra_id: compra.id,
            ref_key: "COMPRA",
            detalle: compra.razon_social_proveedor,
            fecha: compra_selected.fecha_pago,
            monto,
            movimiento: "Egreso",
            respaldo: "FACTURA",
            nro_documento: compra.nro_factura,
            cuenta_id: compra_selected.cuenta_id,
          },
        });
        await adjustCuentaSaldo({
          cuentaId: compra_selected.cuenta_id,
          monto,
          operacion: "restar",
        });
      }

      res.status(201).json({ message: "Método de pago actualizado" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editmetodopagoCompraLote: async (req, res) => {
    try {
      const { selected, cuenta_id, fecha_limite, fecha_pago } = req.body;

      for (const item of selected) {
        const compra = await find({
          modelName: "Compra",
          id: item.id,
          failIfNotFound: true,
        });
        await update({
          modelName: "Compra",
          id: compra.id,
          data: { fecha_limite },
        });

        if (cuenta_id !== "none") {
          const monto = parseFloat(
            (
              compra.importe_total_compra -
              compra.descuentos_bonificaciones_rebajas_sujetas_iva
            ).toFixed(2)
          );
          await create({
            modelName: "Efectivo",
            data: {
              sucursal_id: compra.sucursal_id,
              compra_id: compra.id,
              ref_key: "COMPRA",
              detalle: compra.razon_social_proveedor,
              fecha: fecha_pago,
              monto,
              movimiento: "Egreso",
              respaldo: "FACTURA",
              nro_documento: compra.nro_factura,
              cuenta_id,
            },
          });
          await adjustCuentaSaldo({
            cuentaId: cuenta_id,
            monto,
            operacion: "restar",
          });
        }
      }

      res
        .status(201)
        .json({ message: "Lote de compras actualizado exitosamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = CompraController;
