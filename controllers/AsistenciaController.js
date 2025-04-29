const { find, list, create, update, destroy } = require("../services");
const { Sequelize, Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

const models = require('../models/Relaciones');
const AsistenciaController = {
  getdependientesCASI: async (req, res) => {
    try {
      const { empresa_id, mes, gestion } = req.query;

      const dependientes = await list({
        modelName: "Dependiente",
        where: {
          empresa_id,
          estado: { [Op.or]: ["ACTIVO", "JUBILADO"] },
        },
        include: [
          {
            model: models.Asistencia,
            as: "asistencias",
            where: { periodo: `${mes}/${gestion}` },
            required: false,
          },
        ],
        order: [["apellido_paterno", "ASC"]],
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

      res.status(200).json({ dependientes, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  setAsistencias: async (req, res) => {
    try {
      const { dependientesData, mes, gestion } = req.body;

      for (const dependienteData of dependientesData) {
        const asistenciaExistente = await find({
          modelName: "Asistencia",
          id: dependienteData.asistencia.id,
        });

        const asistenciaData = {
          registros: dependienteData.asistencia.registros,
          turno: dependienteData.asistencia.turno,
          total_horas: dependienteData.asistencia.total_horas,
          dias: dependienteData.asistencia.dias,
        };

        if (asistenciaExistente) {
          await update({
            modelName: "Asistencia",
            id: asistenciaExistente.id,
            data: asistenciaData,
          });
        } else {
          await create({
            modelName: "Asistencia",
            data: {
              dependiente_id: dependienteData.id,
              periodo: `${mes}/${gestion}`,
              ...asistenciaData,
            },
          });
        }
      }

      res.status(201).json({ message: 'Valores creados o actualizados correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteAsistencia: async (req, res) => {
    try {
      const { id } = req.params;

      await find({
        modelName: "Asistencia",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Asistencia",
        id,
      });

      res.status(200).json({ message: 'Valor eliminado correctamente.' });
    } catch (error) {
      if (
        error.name === "SequelizeForeignKeyConstraintError" ||
        error.message.includes("a foreign key constraint fails")
      ) {
        res.status(400).json({ message: 'Este registro tiene dependencias y no puede ser eliminado.' });
      } else {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message });
      }
    }
  },
};

module.exports = AsistenciaController;
