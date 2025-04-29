const { list, find, create, update, destroy } = require("../services");
const models = require("../models/Relaciones");
const { Op, Sequelize } = require("sequelize");
const path = require("path");
const fs = require("fs");

const PlanillaSueldoController = {
  getdependientesCP: async (req, res) => {
    try {
      const { empresa_id, mes, gestion, tipo } = req.query;

      const diaFinActual = new Date(gestion, mes, 0).getDate();
      const fechaFinActual = `${gestion}-${String(mes).padStart(2, "0")}-${diaFinActual}`;

      let mesAnterior = mes - 1;
      let gestionAnterior = gestion;
      if (mesAnterior === 0) {
        mesAnterior = 12;
        gestionAnterior--;
      }
      const diaFinAnterior = new Date(gestionAnterior, mesAnterior, 0).getDate();
      const fechaFinAnterior = `${gestionAnterior}-${String(mesAnterior).padStart(2, "0")}-${diaFinAnterior}`;

      const [ufv_actual, ufv_anterior, smn] = await Promise.all([
        find({ modelName: "Ufv", where: { fecha: fechaFinActual } }),
        find({ modelName: "Ufv", where: { fecha: fechaFinAnterior } }),
        find({ modelName: "Smn", where: { gestion } }),
      ]);

      const whereDependientes = {
        empresa_id,
        estado: { [Sequelize.Op.or]: ["ACTIVO", "JUBILADO"] },
      };
      if (tipo) whereDependientes.tipo = tipo;

      const dependientes = await list({
        modelName: "Dependiente",
        where: whereDependientes,
        include: [
          {
            model: models.PlanillaSueldo,
            as: "planillas",
            where: { periodo: `${mes}/${gestion}` },
            required: false,
          },
        ],
        order: [["apellido_paterno", "ASC"]],
      });

      for (const dependiente of dependientes) {
        const currentMonth = parseInt(mes);
        const currentYear = parseInt(gestion);
        let previousMonth = currentMonth - 1;
        let previousYear = currentYear;
        if (previousMonth === 0) {
          previousMonth = 12;
          previousYear--;
        }
        const previousPeriod = `${previousMonth}/${previousYear}`;

        const [planillaAnterior, asistencia, anticipos] = await Promise.all([
          find({ modelName: "PlanillaSueldo", where: { periodo: previousPeriod, dependiente_id: dependiente.id } }),
          find({ modelName: "Asistencia", where: { periodo: `${mes}/${gestion}`, dependiente_id: dependiente.id } }),
          list({
            modelName: "Anticipo",
            where: {
              fecha: {
                [Op.and]: [
                  { [Op.gte]: new Date(currentYear, currentMonth - 1, 1) },
                  { [Op.lte]: new Date(currentYear, currentMonth, 0) },
                ],
              },
              dependiente_id: dependiente.id,
            },
          }),
        ]);

        const totalAnticipos = anticipos.reduce((total, anticipo) => total + parseFloat(anticipo.importe || 0), 0).toFixed(2);

        dependiente.dataValues.horasTrabajadas = asistencia?.total_horas || "240.00";
        dependiente.dataValues.anticipo = totalAnticipos;
        dependiente.dataValues.saldo = planillaAnterior?.saldo || "0.00";
      }

      const empresa = await find({ modelName: "Empresa", id: empresa_id, failOnEmpty: true });
      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        titular: empresa.titular,
        ci: empresa.ci,
        ciudad: empresa.ciudad,
        numero_patronal: empresa.numero_patronal,
        logo: null,
      };

      if (empresa.logo) {
        const imagePath = path.join(__dirname, "..", "public", "logos", empresa.logo.replace("logos/", ""));
        if (fs.existsSync(imagePath)) {
          const imageBuffer = fs.readFileSync(imagePath);
          const imageBase64 = imageBuffer.toString("base64");
          const mimeType = "image/webp";
          dataCustomer.logo = `data:${mimeType};base64,${imageBase64}`;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          dependientes,
          dataCustomer,
          smn,
          ufv_actual: ufv_actual?.valor || "1.00000",
          ufv_anterior: ufv_anterior?.valor || "1.00000",
        },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  setPlanillaSueldo: async (req, res) => {
    try {
      const { dependientesData, mes, gestion, fecha } = req.body;

      for (const dep of dependientesData) {
        const planillaExistente = await find({
          modelName: "PlanillaSueldo",
          where: {
            periodo: `${mes}/${gestion}`,
            dependiente_id: dep.id,
          },
        });

        if (planillaExistente) {
          await update({
            modelName: "PlanillaSueldo",
            id: planillaExistente.id,
            data: { ...dep.planilla, fecha, periodo: `${mes}/${gestion}` },
          });
        } else {
          await create({
            modelName: "PlanillaSueldo",
            data: {
              dependiente_id: dep.id,
              fecha,
              periodo: `${mes}/${gestion}`,
              ...dep.planilla,
            },
          });
        }
      }

      res.status(201).json({ message: "Valores creados o actualizados correctamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletePlanillaSueldo: async (req, res) => {
    try {
      const { id } = req.params;

      await find({
        modelName: "PlanillaSueldo",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "PlanillaSueldo",
        id,
      });

      res.status(200).json({ message: "Valor eliminado correctamente" });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = PlanillaSueldoController;
