const { list, find, create, update, destroy } = require("../services");
const models = require("../models/Relaciones");
const { Op } = require("sequelize");

const LineaController = {
  getlineas: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const lineas = await list({
        modelName: "Linea",
        where: { empresa_id },
        include: [
          {
            model: models.SubLinea,
            as: "sublineas",
          },
        ],
      });

      res.status(200).json({ success: true, data: { lineas } });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getlineasvalidas: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const lineas = await list({
        modelName: "Linea",
        where: { empresa_id },
        include: [
          {
            model: models.SubLinea,
            as: "sublineas",
            required: true, // Solo con sublineas
          },
        ],
      });

      res.status(200).json({ success: true, data: { lineas } });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addlinea: async (req, res) => {
    try {
      const { nombre, empresa_id } = req.body;

      await create({
        modelName: "Linea",
        data: { nombre, empresa_id },
        validate: [
          {
            field: "nombre",
            unique: true,
            where: { empresa_id },
            errorMessage: "La línea ya está registrada.",
          },
        ],
      });

      res.status(201).json({ message: "Línea creada correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editlinea: async (req, res) => {
    try {
      const { id, nombre, sublineas } = req.body;

      const linea = await find({
        modelName: "Linea",
        id,
        include: [
          {
            model: models.SubLinea,
            as: "sublineas",
          },
        ],
        failOnEmpty: true,
      });

      await update({
        modelName: "Linea",
        id: linea.id,
        data: { nombre },
        validate: [
          {
            field: "nombre",
            unique: true,
            where: { empresa_id: linea.empresa_id },
            excludeId: id,
            errorMessage: "La línea ya está registrada.",
          },
        ],
      });

      const receivedSublineaIds = sublineas
        .map((s) => s.id)
        .filter((id) => id !== null);

      // 🔥 Eliminar sublíneas que ya no existen
      for (const existing of linea.sublineas) {
        if (!receivedSublineaIds.includes(existing.id)) {
          await destroy({
            modelName: "SubLinea",
            id: existing.id,
          });
        }
      }

      // 🔥 Actualizar o crear sublíneas
      for (const sublinea of sublineas) {
        if (sublinea.id) {
          await update({
            modelName: "SubLinea",
            id: sublinea.id,
            data: { nombre: sublinea.nombre },
          });
        } else {
          await create({
            modelName: "SubLinea",
            data: {
              nombre: sublinea.nombre,
              linea_id: linea.id,
            },
          });
        }
      }

      res.status(200).json({ message: "Línea actualizada correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletelinea: async (req, res) => {
    try {
      const { id } = req.params;

      await find({
        modelName: "Linea",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Linea",
        id,
      });

      res.status(200).json({ message: "Línea eliminada correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = LineaController;
