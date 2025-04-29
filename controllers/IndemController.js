const { create, update, destroy, find, list } = require("../services");
const models = require("../models/Relaciones");
const path = require("path");
const fs = require("fs");
const { Sequelize, Op } = require("sequelize");

const obtenerPeriodos = (mes, gestion) => {
  let periodos = [];
  for (let i = 0; i < 3; i++) {
    let mesActual = mes - i;
    if (mesActual < 1) {
      mesActual += 12;
      gestion -= 1;
    }
    periodos.push(`${mesActual}/${gestion}`);
  }
  return periodos;
};

const IndemController = {
  getdependientesIndem: async (req, res) => {
    try {
      const { empresa_id, mes, gestion, tipo } = req.query;

      const periodosPlanilla = obtenerPeriodos(mes, gestion);
      const tipoF = tipo === "EVENTUALES" ? "EVENTUAL" : "DEPENDIENTE";

      const dependientes = await list({
        modelName: "Dependiente",
        where: {
          empresa_id,
          estado: { [Op.or]: ["ACTIVO", "JUBILADO"] },
          tipo: tipoF,
        },
        include: [
          {
            model: models.Indem,
            as: "indems",
            where: { periodo: `${mes}/${gestion}` },
            required: false,
          },
          {
            model: models.PlanillaSueldo,
            as: "planillas",
            where: { periodo: { [Op.in]: periodosPlanilla } },
            attributes: ["id", "total_ganado", "periodo"],
            required: false,
          },
        ],
        order: [["apellido_paterno", "ASC"]],
      });

      for (const dependiente of dependientes) {
        let sueldo_ult = "0.00";
        let sueldo_pen = "0.00";
        let sueldo_ant = "0.00";

        periodosPlanilla.forEach((periodo, index) => {
          const planilla = dependiente.planillas.find(p => p.periodo === periodo);
          if (planilla) {
            if (index === 0) sueldo_ult = planilla.total_ganado;
            else if (index === 1) sueldo_pen = planilla.total_ganado;
            else if (index === 2) sueldo_ant = planilla.total_ganado;
          }
        });

        dependiente.dataValues.sueldo_ult = sueldo_ult;
        dependiente.dataValues.sueldo_pen = sueldo_pen;
        dependiente.dataValues.sueldo_ant = sueldo_ant;

        let mesAnterior = mes - 1;
        let gestionAnterior = gestion;
        if (mes === 1) {
          mesAnterior = 12;
          gestionAnterior -= 1;
        }
        const periodoAnterior = `${mesAnterior}/${gestionAnterior}`;

        const indemAnterior = await find({
          modelName: "Indem",
          where: {
            dependiente_id: dependiente.id,
            periodo: periodoAnterior,
          },
        });

        dependiente.dataValues.pagos = indemAnterior ? indemAnterior.pagos : "0.00";
      }

      const empresa = await find({ modelName: "Empresa", id: empresa_id });
      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        titular: empresa.titular,
        ci: empresa.ci,
        numero_patronal: empresa.numero_patronal,
      };

      if (empresa.logo) {
        const logoPath = path.join(__dirname, "..", "public", "logos", empresa.logo.replace("logos/", ""));
        if (fs.existsSync(logoPath)) {
          const imageBuffer = fs.readFileSync(logoPath);
          dataCustomer.logo = `data:image/webp;base64,${imageBuffer.toString("base64")}`;
        }
      }

      res.status(200).json({ dependientes, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  setIndems: async (req, res) => {
    try {
      const { mes, gestion, dependientesData } = req.body;

      for (const dependienteData of dependientesData) {
        const indem = await find({
          modelName: "Indem",
          id: dependienteData.indem.id,
        });

        const data = {
          periodo: `${mes}/${gestion}`,
          dias: dependienteData.indem.dias,
          meses: dependienteData.indem.meses,
          años: dependienteData.indem.años,
          sueldo_ult: dependienteData.indem.sueldo_ult,
          sueldo_pen: dependienteData.indem.sueldo_pen,
          sueldo_ant: dependienteData.indem.sueldo_ant,
          sueldo_pro: dependienteData.indem.sueldo_pro,
          pagos: dependienteData.indem.pagos,
          indem_mes: dependienteData.indem.indem_mes,
          indem_acumulada: dependienteData.indem.indem_acumulada,
        };

        if (indem) {
          await update({ modelName: "Indem", id: indem.id, data });
        } else {
          await create({
            modelName: "Indem",
            data: { ...data, dependiente_id: dependienteData.id },
          });
        }
      }

      res.status(201).json({ message: "Valores creados o actualizados correctamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteIndem: async (req, res) => {
    try {
      const { id } = req.params;

      await find({
        modelName: "Indem",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Indem",
        id,
      });

      res.status(200).json({ message: "Valor eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = IndemController;
