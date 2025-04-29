const { create, update, destroy, list, find } = require("../services");
const models = require("../models/Relaciones");
const { Op } = require("sequelize");

const LibroController = {
  getdiarios: async (req, res) => {
    try {
      const { empresa_id, fecha_inicio, fecha_final } = req.query;

      const fechaInicio = new Date(fecha_inicio).toISOString().split("T")[0];
      const fechaFin = new Date(fecha_final).toISOString().split("T")[0];

      const diarios = await list({
        modelName: "Diario",
        where: {
          empresa_id,
          fecha: { [Op.between]: [fechaInicio, fechaFin] },
        },
        include: [
          {
            model: models.Asiento,
            as: "asientos",
            include: [{ model: models.CuentaContable, as: "cuenta" }],
          },
        ],
        order: [["nro", "DESC"]],
      });

      diarios.forEach((diario) => {
        diario.asientos.sort((a, b) => a.nro - b.nro);
      });

      const cuentasContables = await list({
        modelName: "CuentaContable",
        where: { empresa_id },
        order: [["nro", "ASC"]],
        attributes: ["id", "nombre", "nro"],
      });

      const empresa = await find({
        modelName: "Empresa",
        id: empresa_id,
      });

      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        titular: empresa.titular,
        ci: empresa.ci,
      };

      res.status(200).json({ diarios, cuentasContables, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getmayores: async (req, res) => {
    try {
      const { empresa_id, fecha_inicio, fecha_final } = req.query;

      const fechaInicio = new Date(fecha_inicio).toISOString().split("T")[0];
      const fechaFin = new Date(fecha_final).toISOString().split("T")[0];

      const cuentasContables = await list({
        modelName: "CuentaContable",
        where: {
          empresa_id,
          flujo: { [Op.ne]: null },
          moneda: { [Op.ne]: null },
          rubro: { [Op.ne]: null },
        },
        include: [
          {
            model: models.Asiento,
            as: "asientos",
            include: [
              {
                model: models.Diario,
                as: "diario",
                where: {
                  fecha: { [Op.between]: [fechaInicio, fechaFin] },
                },
              },
            ],
          },
        ],
        order: [["nro", "ASC"]],
        attributes: ["id", "nombre", "nro"],
      });

      const empresa = await find({
        modelName: "Empresa",
        id: empresa_id,
      });

      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        titular: empresa.titular,
        ci: empresa.ci,
      };

      res.status(200).json({ cuentasContables, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getbalancesumassaldos: async (req, res) => {
    try {
      const { empresa_id, fecha_inicio, fecha_final } = req.query;

      const fechaInicio = new Date(fecha_inicio).toISOString().split("T")[0];
      const fechaFin = new Date(fecha_final).toISOString().split("T")[0];

      const cuentasContables = await list({
        modelName: "CuentaContable",
        where: {
          empresa_id,
          flujo: { [Op.ne]: null },
          moneda: { [Op.ne]: null },
          rubro: { [Op.ne]: null },
        },
        include: [
          {
            model: models.Asiento,
            as: "asientos",
            required: true,
            include: [
              {
                model: models.Diario,
                as: "diario",
                where: {
                  fecha: { [Op.between]: [fechaInicio, fechaFin] },
                },
              },
            ],
          },
        ],
        order: [["nro", "ASC"]],
        attributes: ["id", "nombre", "nro"],
      });

      const empresa = await find({
        modelName: "Empresa",
        id: empresa_id,
      });

      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        titular: empresa.titular,
        ci: empresa.ci,
      };

      res.status(200).json({ cuentasContables, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  setDiarioWithAsientos: async (req, res) => {
    try {
      const { id, fecha, tipo, cheque, razon_social, glosa, asientos } = req.body;

      const diario = await find({
        modelName: "Diario",
        id,
        include: [{ model: models.Asiento, as: "asientos" }],
        failOnEmpty: true,
      });

      await update({
        modelName: "Diario",
        id: diario.id,
        data: { fecha, tipo, cheque_nro: cheque, razon_social, glosa },
      });

      const existingAsientoIds = diario.asientos.map((a) => a.id);
      const requestAsientoIds = asientos.filter((a) => a.id).map((a) => a.id);

      const asientosToDelete = existingAsientoIds.filter(
        (id) => !requestAsientoIds.includes(id)
      );

      if (asientosToDelete.length > 0) {
        await models.Asiento.destroy({ where: { id: asientosToDelete } });
      }

      for (const asiento of asientos) {
        if (asiento.id) {
          await update({
            modelName: "Asiento",
            id: asiento.id,
            data: {
              cuentaContable_id: asiento.cuentaContable_id,
              referencia: asiento.referencia,
              debe: asiento.debe,
              haber: asiento.haber,
              nro: asiento.nro,
            },
          });
        } else {
          await create({
            modelName: "Asiento",
            data: {
              diario_id: diario.id,
              cuentaContable_id: asiento.cuentaContable_id,
              referencia: asiento.referencia,
              debe: asiento.debe,
              haber: asiento.haber,
              nro: asiento.nro,
            },
          });
        }
      }

      res.status(201).json({ message: "Registro actualizado con éxito." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addonlydiario: async (req, res) => {
    try {
      const { fecha, tipo, cheque, razon_social, glosa, empresa_id } = req.body;

      const diario = await create({
        modelName: "Diario",
        data: { fecha, tipo, cheque_nro: cheque, razon_social, glosa, empresa_id },
      });

      res.status(201).json({ message: "Registro creado", id: diario.id, nro: diario.nro });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletediario: async (req, res) => {
    try {
      const { id } = req.params;

      await find({
        modelName: "Diario",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Diario",
        id,
      });

      res.status(200).json({ message: "Eliminación exitosa." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = LibroController;
