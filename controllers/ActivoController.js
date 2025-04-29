const { find, list, create, update, destroy, uploadFile, deleteFile } = require("../services");

const { Op } = require('sequelize');
const path = require('path');
const models = require('../models/Relaciones');

const uploadFolder = "activos_fijos"; // Carpeta dentro de /public

const ActivoController = {
  getactivos: async (req, res) => {
    try {
      const { empresa_id } = req.query;

      const activos = await list({
        modelName: "Activo",
        where: { empresa_id },
        include: [
          {
            model: models.Depreciacion,
            as: "depreciacion",
          },
          {
            model: models.Modelo,
            as: "modelo",
            include: [{ model: models.Marca, as: "marca" }],
          },
          {
            model: models.Dependiente,
            as: "dependiente",
          },
          {
            model: models.ActDep,
            as: "actdeps",
            separate: true,
            limit: 1,
            order: [["nro", "DESC"]],
          },
        ],
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
        ciudad: empresa.ciudad,
      };

      res.status(200).json({ activos, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addactivo: async (req, res) => {
    try {
      const { fecha_asignacion, placa, modelo_id, dependiente_id, empresa_id, detalle, depreciacion_id, fecha_compra, valor_inicial, codigo } = req.body;

      const activoExist = await find({
        modelName: "Activo",
        where: { codigo, empresa_id },
      });

      if (activoExist) {
        return res.status(400).json({ message: 'El código del valor ya está en uso.' });
      }

      const nuevoActivo = await create({
        modelName: "Activo",
        data: {
          placa,
          fecha_asignacion: dependiente_id && dependiente_id !== 'null' ? fecha_asignacion : null,
          modelo_id: modelo_id && modelo_id !== 'null' ? modelo_id : null,
          dependiente_id: dependiente_id && dependiente_id !== 'null' ? dependiente_id : null,
          empresa_id,
          detalle,
          depreciacion_id,
          fecha_compra,
          valor_inicial,
          valor_contabilizado: valor_inicial,
          codigo,
        },
      });

      if (req.files?.foto) {
        const fotoPath = await uploadFile({
          fileData: req.files.foto,
          folder: uploadFolder,
          resizeImage: true,
        });
        nuevoActivo.foto = fotoPath;
      }

      if (req.files?.documento) {
        const documentoPath = await uploadFile({
          fileData: req.files.documento,
          folder: uploadFolder,
          resizeImage: false,
        });
        nuevoActivo.documento = documentoPath;
      }

      await nuevoActivo.save();

      res.status(201).json({ message: 'Valor creado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editactivo: async (req, res) => {
    try {
      const { fecha_asignacion, placa, modelo_id, dependiente_id, id, empresa_id, detalle, depreciacion_id, fecha_compra, valor_inicial, codigo } = req.body;

      const activo = await find({
        modelName: "Activo",
        id,
        failOnEmpty: true,
      });

      const activoExist = await find({
        modelName: "Activo",
        where: {
          codigo,
          empresa_id,
          id: { [Op.ne]: id },
        },
      });

      if (activoExist) {
        return res.status(400).json({ message: 'El código del valor ya está en uso.' });
      }

      await update({
        modelName: "Activo",
        id,
        data: {
          placa,
          fecha_asignacion: dependiente_id && dependiente_id !== 'null' ? fecha_asignacion : null,
          modelo_id: modelo_id && modelo_id !== 'null' ? modelo_id : null,
          dependiente_id: dependiente_id && dependiente_id !== 'null' ? dependiente_id : null,
          detalle,
          depreciacion_id,
          fecha_compra,
          valor_inicial,
          codigo,
        },
      });

      // Eliminar archivo viejo si existe
      if (activo.foto) {
        await deleteFile(activo.foto);
        activo.foto = null;
      }
      if (activo.documento) {
        await deleteFile(activo.documento);
        activo.documento = null;
      }

      // Subir nuevos archivos
      if (req.files?.foto) {
        const fotoPath = await uploadFile({
          fileData: req.files.foto,
          folder: uploadFolder,
          resizeImage: true,
        });
        activo.foto = fotoPath;
      }

      if (req.files?.documento) {
        const documentoPath = await uploadFile({
          fileData: req.files.documento,
          folder: uploadFolder,
          resizeImage: false,
        });
        activo.documento = documentoPath;
      }

      await activo.save();

      res.status(200).json({ message: 'Activo actualizado correctamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteactivo: async (req, res) => {
    try {
      const { id } = req.params;

      const activo = await find({
        modelName: "Activo",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Activo",
        id,
      });

      if (activo.foto) {
        await deleteFile(activo.foto);
      }
      if (activo.documento) {
        await deleteFile(activo.documento);
      }

      res.status(200).json({ message: 'Activo eliminado correctamente.' });
    } catch (error) {
      if (
        error.name === 'SequelizeForeignKeyConstraintError' ||
        error.message.includes('a foreign key constraint fails')
      ) {
        res.status(400).json({ message: 'Este registro tiene dependencias y no puede ser eliminado.' });
      } else {
        console.error(error);
        res.status(error.statusCode || 500).json({ message: error.message });
      }
    }
  },
};

module.exports = ActivoController;
