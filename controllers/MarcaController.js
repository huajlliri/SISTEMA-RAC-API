const { list, find, create, update, destroy } = require("../services");
const models = require("../models/Relaciones");
const { Op } = require("sequelize");

const MarcaController = {
  getmarcas: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const marcas = await list({
        modelName: "Marca",
        where: { empresa_id },
        include: [
          {
            model: models.Modelo,
            as: "modelos",
          },
        ],
      });

      res.status(200).json({ success: true, data: { marcas } });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getmarcasvalidas: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const marcas = await list({
        modelName: "Marca",
        where: { empresa_id },
        include: [
          {
            model: models.Modelo,
            as: "modelos",
            required: true, // Solo marcas con modelos
          },
        ],
      });

      res.status(200).json({ success: true, data: { marcas } });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addmarca: async (req, res) => {
    try {
      const { nombre, empresa_id } = req.body;

      await create({
        modelName: "Marca",
        data: { nombre, empresa_id },
        validate: [
          {
            field: "nombre",
            unique: true,
            where: { empresa_id },
            errorMessage: "La marca ya está registrada.",
          },
        ],
      });

      res.status(201).json({ message: "Marca creada correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editmarca: async (req, res) => {
    try {
      const { id, nombre, modelos } = req.body;

      const marca = await find({
        modelName: "Marca",
        id,
        include: [
          {
            model: models.Modelo,
            as: "modelos",
          },
        ],
        failOnEmpty: true,
      });

      await update({
        modelName: "Marca",
        id: marca.id,
        data: { nombre },
        validate: [
          {
            field: "nombre",
            unique: true,
            where: { empresa_id: marca.empresa_id },
            excludeId: id,
            errorMessage: "La marca ya está registrada.",
          },
        ],
      });

      const receivedModeloIds = modelos.map((modelo) => modelo.id).filter((id) => id !== null);

      // Eliminar modelos que ya no están en la lista
      for (const existingModelo of marca.modelos) {
        if (!receivedModeloIds.includes(existingModelo.id)) {
          await destroy({
            modelName: "Modelo",
            id: existingModelo.id,
          });
        }
      }

      // Actualizar o crear modelos
      for (const modelo of modelos) {
        if (modelo.id) {
          await update({
            modelName: "Modelo",
            id: modelo.id,
            data: { nombre: modelo.nombre },
          });
        } else {
          await create({
            modelName: "Modelo",
            data: {
              nombre: modelo.nombre,
              marca_id: marca.id,
            },
          });
        }
      }

      res.status(200).json({ message: "Marca actualizada correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletemarca: async (req, res) => {
    try {
      const { id } = req.params;

      await find({
        modelName: "Marca",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Marca",
        id,
      });

      res.status(200).json({ message: "Marca eliminada correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = MarcaController;
