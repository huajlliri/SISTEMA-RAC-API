const {
  create,
  update,
  destroy,
  find,
  list,
  bulkCreate,
} = require("../services");
const { Op } = require("sequelize");

const UfvController = {
  updateSmn: async (req, res) => {
    try {
      const { data, gestion } = req.body;

      const smn = await find({ modelName: "Smn", id: data.id });
      if (smn) await destroy({ modelName: "Smn", id: smn.id });

      const smnNew = await find({ modelName: "Smn", where: { gestion } });
      if (smnNew) {
        await update({
          modelName: "Smn",
          id: smnNew.id,
          data: { valor: data.valor, gestion },
        });
      } else {
        await create({
          modelName: "Smn",
          data: { valor: data.valor, gestion },
        });
      }

      res
        .status(201)
        .json({ success: true, message: "Valor actualizado correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getufvs: async (req, res) => {
    try {
      const { gestion } = req.query;

      const [smn, ufvs] = await Promise.all([
        find({ modelName: "Smn", where: { gestion } }),
        list({
          modelName: "Ufv",
          where: {
            fecha: {
              [Op.and]: [
                { [Op.gte]: new Date(gestion, 0, 1) },
                { [Op.lte]: new Date(gestion, 11, 31) },
              ],
            },
          },
          order: [["fecha", "ASC"]],
        }),
      ]);

      res.status(200).json({ success: true, data: { ufvs, smn } });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getufv: async (req, res) => {
    try {
      const { fecha } = req.query;
      const año = fecha.slice(0, 4);

      const [ufvAnterior, ufvActual] = await Promise.all([
        find({ modelName: "Ufv", where: { fecha: new Date(año, 0, 1) } }),
        find({ modelName: "Ufv", where: { fecha } }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          ufv_actual: ufvActual ? ufvActual.valor : "0.00000",
          ufv_anterior: ufvAnterior ? ufvAnterior.valor : "0.00000",
        },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  AddUfvsLote: async (req, res) => {
    try {
      const { ufvs } = req.body;

      if (!Array.isArray(ufvs) || ufvs.length === 0) {
        return res
          .status(400)
          .json({ message: "Debe proporcionar datos válidos." });
      }

      const fechas = ufvs.map((item) => item.fecha).filter(Boolean);

      const existentes = await list({
        modelName: "Ufv",
        where: { fecha: { [Op.in]: fechas } },
        attributes: ["id", "fecha", "valor"],
      });

      const mapExistentes = new Map(
        existentes.map((item) => [item.fecha.toISOString().split("T")[0], item])
      );

      const nuevos = [];
      const actualizaciones = [];

      for (const { fecha, valor } of ufvs) {
        if (!fecha || !valor) continue;

        const valorFormateado = valor.replace(/,/g, ".");

        const existente = mapExistentes.get(fecha);

        if (existente) {
          if (existente.valor !== valorFormateado) {
            actualizaciones.push({
              id: existente.id,
              data: { valor: valorFormateado },
            });
          }
        } else {
          nuevos.push({
            fecha,
            valor: valorFormateado,
          });
        }
      }

      if (nuevos.length > 0) {
        await bulkCreate({
          modelName: "Ufv",
          data: nuevos,
        });
      }

      for (const item of actualizaciones) {
        await update({
          modelName: "Ufv",
          id: item.id,
          data: item.data,
        });
      }

      res.status(201).json({
        success: true,
        message: `Se crearon ${nuevos.length} y actualizaron ${actualizaciones.length} registros correctamente.`,
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addufv: async (req, res) => {
    try {
      const { fecha, valor } = req.body;

      const ufvExist = await find({ modelName: "Ufv", where: { fecha } });

      if (ufvExist) {
        await update({ modelName: "Ufv", id: ufvExist.id, data: { valor } });
      } else {
        await create({ modelName: "Ufv", data: { fecha, valor } });
      }

      res
        .status(201)
        .json({ success: true, message: "Valor creado correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editufv: async (req, res) => {
    try {
      const { id, fecha, valor } = req.body;

      const ufv = await find({ modelName: "Ufv", id, failOnEmpty: true });
      const exist = await find({
        modelName: "Ufv",
        where: { fecha, id: { [Op.ne]: id } },
      });

      if (exist) {
        await destroy({ modelName: "Ufv", id: ufv.id });
        await update({ modelName: "Ufv", id: exist.id, data: { valor } });
      } else {
        await update({ modelName: "Ufv", id: ufv.id, data: { valor, fecha } });
      }

      res
        .status(200)
        .json({ success: true, message: "Valor actualizado correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteufv: async (req, res) => {
    try {
      const { id } = req.params;

      await find({ modelName: "Ufv", id, failOnEmpty: true });
      await destroy({ modelName: "Ufv", id });

      res
        .status(200)
        .json({ success: true, message: "Ufv eliminada correctamente." });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = UfvController;
