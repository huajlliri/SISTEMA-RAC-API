const { find, list, create, update, destroy } = require("../services");
const { Sequelize, Op } = require("sequelize");
const path = require("path");
const fs = require("fs");

const models = require('../models/Relaciones');

const AguinaldoController = {
  getdependientesCANT: async (req, res) => {
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
            model: models.Anticipo,
            as: "anticipos",
            where: {
              fecha: {
                [Op.and]: [
                  { [Op.gte]: new Date(gestion, mes - 1, 1) },
                  { [Op.lte]: new Date(gestion, mes, 0) },
                ],
              },
            },
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

  setAnticipos: async (req, res) => {
    try {
      const { fecha, dependientesData, tipo } = req.body;

      for (const dependienteData of dependientesData) {
        const anticipoExistente = await find({
          modelName: "Anticipo",
          id: dependienteData.anticipo.id,
        });

        const anticipoData = {
          dependiente_id: dependienteData.id,
          fecha,
          tipo,
          importe: dependienteData.anticipo.importe,
        };

        if (anticipoExistente) {
          await update({
            modelName: "Anticipo",
            id: anticipoExistente.id,
            data: anticipoData,
          });
        } else {
          await create({
            modelName: "Anticipo",
            data: anticipoData,
          });
        }
      }

      res.status(201).json({ message: 'Valores creados o actualizados correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteAnticipo: async (req, res) => {
    try {
      const { id } = req.params;

      await find({
        modelName: "Anticipo",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Anticipo",
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

module.exports = AguinaldoController;
