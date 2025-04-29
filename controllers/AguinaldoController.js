const { find, list, create, update, destroy } = require("../services");

const models = require('../models/Relaciones');
const { Sequelize } = require("sequelize");
const moment = require("moment");
const path = require("path");
const fs = require("fs");

const calcularMesesYDiasTrabajados = (fechaIngreso, gestion) => {
  const fechaIngresoMoment = moment(fechaIngreso, 'YYYY-MM-DD');
  const inicioGestionMoment = moment(`${gestion}-01-01`, 'YYYY-MM-DD');
  const finGestionMoment = moment(`${gestion}-12-31`, 'YYYY-MM-DD');

  if (fechaIngresoMoment.isBefore(inicioGestionMoment)) {
    return { meses: '12', dias: '0' };
  }

  if (fechaIngresoMoment.isAfter(finGestionMoment)) {
    return { meses: '0', dias: '0' };
  }

  const fechaInicioTrabajo = fechaIngresoMoment.isBefore(inicioGestionMoment) ? inicioGestionMoment : fechaIngresoMoment;

  let mesesTrabajados = finGestionMoment.diff(fechaInicioTrabajo, 'months');
  const fechaUltimoDia = moment(fechaInicioTrabajo).add(mesesTrabajados, 'months');

  if (fechaUltimoDia.isAfter(finGestionMoment)) {
    mesesTrabajados -= 1;
  }

  const diasTrabajados = finGestionMoment.diff(fechaUltimoDia, 'days') + 1;

  return { meses: mesesTrabajados.toString(), dias: diasTrabajados.toString() };
};

const AguinaldoController = {
  getdependientesCA: async (req, res) => {
    try {
      const { empresa_id, mes, gestion, tipo } = req.query;

      const smn = await find({
        modelName: "Smn",
        where: { gestion },
      });

      const tipoF = tipo === "EVENTUALES" ? "EVENTUAL" : "DEPENDIENTE";

      const dependientes = await list({
        modelName: "Dependiente",
        where: {
          empresa_id,
          tipo: tipoF,
          estado: { [Sequelize.Op.or]: ["ACTIVO", "JUBILADO"] },
        },
        include: [
          {
            model: models.Aguinaldo,
            as: "aguinaldos",
            where: { gestion: `${gestion}` },
            required: false,
          },
          {
            model: models.PlanillaSueldo,
            as: "planillas",
            where: {
              periodo: { [Sequelize.Op.in]: [`9/${gestion}`, `10/${gestion}`, `11/${gestion}`] },
            },
            attributes: ["id", "total_ganado", "periodo"],
            required: false,
          },
        ],
        order: [["apellido_paterno", "ASC"]],
      });

      dependientes.forEach((dependiente) => {
        const fechaIngreso = dependiente.fecha_ingreso;
        const { meses, dias } = calcularMesesYDiasTrabajados(fechaIngreso, gestion);

        dependiente.dataValues.meses_trabajados = meses;
        dependiente.dataValues.dias_trabajados = dias;

        const planillas = dependiente.planillas || [];
        dependiente.dataValues.sueldo_septiembre = planillas.find(p => p.periodo === `9/${gestion}`)?.total_ganado || '0.00';
        dependiente.dataValues.sueldo_octubre = planillas.find(p => p.periodo === `10/${gestion}`)?.total_ganado || '0.00';
        dependiente.dataValues.sueldo_noviembre = planillas.find(p => p.periodo === `11/${gestion}`)?.total_ganado || '0.00';
      });

      const empresa = await find({
        modelName: "Empresa",
        id: empresa_id,
        failOnEmpty: true,
      });

      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        titular: empresa.titular,
        ci: empresa.ci,
        numero_patronal: empresa.numero_patronal,
        logo: null,
      };

      if (empresa.logo) {
        const logoPath = path.resolve(__dirname, "../public", "logos", empresa.logo.replace("logos/", ""));
        if (fs.existsSync(logoPath)) {
          const imageBuffer = fs.readFileSync(logoPath);
          const imageBase64 = imageBuffer.toString("base64");
          dataCustomer.logo = `data:image/webp;base64,${imageBase64}`;
        }
      }

      res.status(200).json({ dependientes, dataCustomer, smn: smn?.value || "0.00" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  setPlanillaAguinaldo: async (req, res) => {
    try {
      const { mes, gestion, dependientesData } = req.body;

      for (const dependienteData of dependientesData) {
        const dependiente = await find({
          modelName: "Dependiente",
          id: dependienteData.id,
          include: [{ model: models.Aguinaldo, as: "aguinaldos", where: { gestion }, required: false }],
          failOnEmpty: true,
        });

        if (dependiente.aguinaldos && dependiente.aguinaldos.length > 0) {
          await update({
            modelName: "Aguinaldo",
            id: dependiente.aguinaldos[0].id,
            data: { ...dependienteData.aguinaldo },
          });
        } else {
          await create({
            modelName: "Aguinaldo",
            data: {
              dependiente_id: dependienteData.id,
              gestion,
              ...dependienteData.aguinaldo,
            },
          });
        }
      }

      res.status(201).json({ message: "Valores creados o actualizados correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteAguinaldo: async (req, res) => {
    try {
      const { id } = req.params;

      await find({
        modelName: "Aguinaldo",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Aguinaldo",
        id,
      });

      res.status(200).json({ message: "Valor eliminado correctamente." });
    } catch (error) {
      if (
        error.name === "SequelizeForeignKeyConstraintError" ||
        error.message.includes("a foreign key constraint fails")
      ) {
        res.status(400).json({ message: "Este registro tiene dependencias y no puede ser eliminado." });
      } else {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message });
      }
    }
  },
};

module.exports = AguinaldoController;
