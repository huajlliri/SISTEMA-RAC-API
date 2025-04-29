const path = require('path');
const { Op } = require('sequelize');
const { create, update, destroy, find, list, deleteFile, uploadImage } = require('../services');

const uploadPath = path.resolve(__dirname, '../public/fotos_dependientes');

const DependienteController = {

  getdependientes: async (req, res) => {
    try {
      const { empresa_id } = req.query;
      const dependientes = await list({ modelName: 'Dependiente', where: { empresa_id } });

      const empresa = await find({ modelName: 'Empresa', id: empresa_id, failIfNotFound: true });

      const dataCustomer = {
        nit: empresa.nit,
        razon_social: empresa.razon_social,
        titular: empresa.titular,
        ci: empresa.ci,
      };

      res.json({ dependientes, dataCustomer });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getdependientesOnly: async (req, res) => {
    try {
      const { empresa_id } = req.query;
      const dependientes = await list({ modelName: 'Dependiente', where: { empresa_id } });
      res.json({ dependientes });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  adddependiente: async (req, res) => {
    try {
      const data = req.body;
      const { codigo, tipo, empresa_id } = data;

      await find({
        modelName: 'Dependiente',
        where: { codigo },
        failIfFound: true,
        failMessage: 'Código en uso.'
      });

      data.aporta = tipo === 'DEPENDIENTE' ? data.aporta : false;

      const dependiente = await create({ modelName: 'Dependiente', data });

      if (req.files && req.files.foto) {
        const fotoPath = await uploadImage({
          file: req.files.foto,
          uploadDir: uploadPath,
          prefix: 'foto'
        });
        await update({ modelName: 'Dependiente', id: dependiente.id, data: { foto: fotoPath } });
      }

      res.status(201).json({ message: 'Valor creado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editdependiente: async (req, res) => {
    try {
      const {
        id,
        estado,
        nombres,
        novedades,
        apellido_paterno,
        apellido_materno,
        domicilio,
        aporta,
        cuenta_bancaria,
        celular,
        numero_asegurado,
        division,
        ci,
        tipo,
        nacionalidad,
        fecha_nacimiento,
        genero,
        codigo,
        cargo,
        fecha_ingreso,
        haber_basico
      } = req.body;

      const dependiente = await find({
        modelName: 'Dependiente',
        id,
        failIfNotFound: true,
        failMessage: 'Valor no encontrado'
      });

      await find({
        modelName: 'Dependiente',
        where: { codigo, empresa_id: dependiente.empresa_id, id: { [Op.ne]: id } },
        failIfFound: true,
        failMessage: 'Código en uso.'
      });

      await update({
        modelName: 'Dependiente',
        id,
        data: {
          nombres,
          apellido_paterno,
          apellido_materno,
          domicilio,
          novedades,
          numero_asegurado,
          division,
          ci,
          cuenta_bancaria,
          celular,
          nacionalidad,
          fecha_nacimiento,
          genero,
          tipo,
          aporta: tipo === 'DEPENDIENTE' ? aporta : false,
          codigo,
          cargo,
          estado,
          fecha_ingreso,
          haber_basico
        }
      });

      if (req.files && req.files.foto) {
        if (dependiente.foto) {
          await deleteFile({ filePath: path.join(uploadPath, path.basename(dependiente.foto)) });
        }
        const fotoPath = await uploadImage({
          file: req.files.foto,
          uploadDir: uploadPath,
          prefix: 'foto'
        });
        await update({ modelName: 'Dependiente', id: dependiente.id, data: { foto: fotoPath } });
      } else {
        if (dependiente.foto) {
          await deleteFile({ filePath: path.join(uploadPath, path.basename(dependiente.foto)) });
          await update({ modelName: 'Dependiente', id: dependiente.id, data: { foto: null } });
        }
      }

      res.status(200).json({ message: 'Valor actualizado correctamente' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deletedependiente: async (req, res) => {
    try {
      const { id } = req.params;
      const dependiente = await find({
        modelName: 'Dependiente',
        id,
        failIfNotFound: true,
        failMessage: 'Valor no encontrado'
      });

      if (dependiente.foto) {
        await deleteFile({ filePath: path.join(uploadPath, path.basename(dependiente.foto)) });
      }

      await destroy({ modelName: 'Dependiente', id });

      res.status(200).json({ message: 'Valor eliminado correctamente' });
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

module.exports = DependienteController;
