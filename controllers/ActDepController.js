const { find, list, create, update, destroy } = require("../services");
const { Sequelize } = require('sequelize');
const models = require('../models/Relaciones');

const ActDepController = {
  getactdeps: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const actdeps = await list({
        modelName: "ActDep",
        include: [
          {
            model: models.Activo,
            as: "activo",
            required: true,
            where: { empresa_id },
            include: [
              {
                model: models.Depreciacion,
                as: "depreciacion",
              },
            ],
          },
        ],
        order: [["nro", "DESC"]],
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
      };

      res.status(200).json({ actdeps, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addactdep: async (req, res) => {
    try {
      const {
        activo_id,
        fecha,
        ufv_actual,
        ufv_anterior,
        valor_contabilizado,
        factor_actualizacion,
        valor_actualizado,
        incremento_por_actualizacion,
        depreciacion_acumulada_anterior,
        incremento_depreciacion_acumulada,
        depreciacion_periodo,
        depreciacion_acumulada_actualizada,
        valor_neto,
      } = req.body;

      await find({
        modelName: "Activo",
        id: activo_id,
        failOnEmpty: true,
      });

      await create({
        modelName: "ActDep",
        data: {
          activo_id,
          fecha,
          ufv_actual,
          ufv_anterior,
          valor_contabilizado,
          factor_actualizacion,
          valor_actualizado,
          incremento_por_actualizacion,
          depreciacion_acumulada_anterior,
          incremento_depreciacion_acumulada,
          depreciacion_periodo,
          depreciacion_acumulada_actualizada,
          valor_neto,
        },
      });

      res.status(201).json({ message: 'Valor creado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editactdep: async (req, res) => {
    try {
      const {
        id,
        fecha,
        ufv_actual,
        ufv_anterior,
        valor_contabilizado,
        factor_actualizacion,
        valor_actualizado,
        incremento_por_actualizacion,
        depreciacion_acumulada_anterior,
        incremento_depreciacion_acumulada,
        depreciacion_periodo,
        depreciacion_acumulada_actualizada,
        valor_neto,
      } = req.body;

      await update({
        modelName: "ActDep",
        id,
        data: {
          fecha,
          ufv_actual,
          ufv_anterior,
          valor_contabilizado,
          factor_actualizacion,
          valor_actualizado,
          incremento_por_actualizacion,
          depreciacion_acumulada_anterior,
          incremento_depreciacion_acumulada,
          depreciacion_periodo,
          depreciacion_acumulada_actualizada,
          valor_neto,
        },
      });

      res.status(200).json({ message: 'Valor actualizado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteactdep: async (req, res) => {
    try {
      const { id } = req.params;

      await destroy({
        modelName: "ActDep",
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

module.exports = ActDepController;
