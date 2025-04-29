const { Op } = require('sequelize');
const { create, update, destroy, find, list } = require('../services');

const DepreciacionController = {

  getdepreciaciones: async (req, res) => {
    try {
      const { empresa_id } = req.query;
      const depreciaciones = await list({
        modelName: 'Depreciacion',
        where: { empresa_id }
      });
      res.json({ depreciaciones });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  AddDepreciacionesLote: async (req, res) => {
    try {
      const { empresa_id, depreciaciones } = req.body;
      const addedDepreciaciones = [];

      for (const item of depreciaciones) {
        const { nombre, vida_util, coeficiente } = item;
        if (!nombre || !vida_util || !coeficiente) continue;

        const exist = await find({
          modelName: 'Depreciacion',
          where: { nombre, empresa_id }
        });

        if (!exist) {
          const newDepreciacion = await create({
            modelName: 'Depreciacion',
            data: { nombre, vida_util, coeficiente, empresa_id }
          });
          addedDepreciaciones.push(newDepreciacion);
        }
      }

      res.status(201).json({ message: 'Valores creados correctamente' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  adddepreciacion: async (req, res) => {
    try {
      const { empresa_id, nombre, vida_util, coeficiente } = req.body;

      await find({
        modelName: 'Depreciacion',
        where: { nombre, empresa_id },
        failIfFound: true,
        failMessage: 'El nombre del valor ya está en uso.'
      });

      await create({
        modelName: 'Depreciacion',
        data: { nombre, vida_util, coeficiente, empresa_id }
      });

      res.status(201).json({ message: 'Valor creado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editdepreciacion: async (req, res) => {
    try {
      const { id, nombre, vida_util, coeficiente, empresa_id } = req.body;

      const depreciacion = await find({
        modelName: 'Depreciacion',
        id,
        failIfNotFound: true,
        failMessage: 'Depreciación no encontrada'
      });

      await find({
        modelName: 'Depreciacion',
        where: { nombre, empresa_id, id: { [Op.ne]: id } },
        failIfFound: true,
        failMessage: 'El nombre del valor ya está en uso.'
      });

      await update({
        modelName: 'Depreciacion',
        id,
        data: { nombre, vida_util, coeficiente }
      });

      res.status(200).json({ message: 'Depreciación actualizada correctamente' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletedepreciacion: async (req, res) => {
    try {
      const { id } = req.params;

      const depreciacion = await find({
        modelName: 'Depreciacion',
        id,
        failIfNotFound: true,
        failMessage: 'Depreciación no encontrada'
      });

      await destroy({ modelName: 'Depreciacion', id });

      res.status(200).json({ message: 'Depreciación eliminada correctamente' });
    } catch (error) {
      if (error.name === 'SequelizeForeignKeyConstraintError' || error.message.includes('a foreign key constraint fails')) {
        res.status(400).json({ message: 'Este registro tiene dependencias y no puede ser eliminado.' });
      } else {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message });
      }
    }
  }

};

module.exports = DepreciacionController;
