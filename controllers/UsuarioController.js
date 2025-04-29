const { find, list, create, update, destroy, registroLog, uploadFile, deleteFile } = require("../services");
const { AbilityBuilder, createMongoAbility } = require('@casl/ability');
const { Op } = require('sequelize');
const path = require('path');
const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const models = require('../models/Relaciones');

const uploadPath = path.resolve(__dirname, '../public/logos');

function defineAbility(rol) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);
  rol.Permissions.forEach(permiso => can(permiso.action, permiso.subject));
  return build();
}

const UsuarioController = {
  getusername: async (req, res) => {
    try {
      const rol = await find({
        modelName: "Role",
        id: req.user.role_id,
        include: { model: models.Permission, attributes: ["action", "subject"], through: { attributes: [] } },
        failOnEmpty: true,
      });

      const ability = defineAbility(rol);

      res.status(200).json({ user: { permissions: ability.rules } });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  adduser: async (req, res) => {
    try {
      const { username, nombre, password, role_id, empresas_id } = req.body;

      const existingUser = await find({
        modelName: "Usuario",
        where: { username },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya está registrado.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await create({
        modelName: "Usuario",
        data: {
          username,
          nombre,
          password: hashedPassword,
          role_id,
        },
      });

      if (empresas_id && empresas_id.length > 0) {
        await user.setEmpresas(empresas_id);
      }

      res.status(201).json({ message: 'Usuario creado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  edituser: async (req, res) => {
    try {
      const { id, username, nombre, password, role_id, empresas_id } = req.body;

      const user = await find({
        modelName: "Usuario",
        id,
        failOnEmpty: true,
      });

      const existingUser = await find({
        modelName: "Usuario",
        where: { username, id: { [Op.ne]: id } },
      });

      if (existingUser) {
        return res.status(400).json({ message: 'El nombre de usuario ya está registrado por otro usuario.' });
      }

      await update({
        modelName: "Usuario",
        id,
        data: { username, nombre, role_id },
      });

      if (password && password !== '') {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
      }

      if (empresas_id) {
        if (empresas_id.length > 0) {
          await user.setEmpresas(empresas_id);
        } else {
          await user.setEmpresas([]);
        }
      }

      res.json({ message: 'Usuario actualizado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteuser: async (req, res) => {
    try {
      const { id } = req.body;

      const user = await find({
        modelName: "Usuario",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Usuario",
        id: user.id,
      });

      res.status(200).json({ message: 'Usuario eliminado correctamente.' });
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

  editdatosinfo: async (req, res) => {
    try {
      const { empresa_id, usuario_id, titular, ci, razon_social, nit } = req.body;

      const usuario = await find({
        modelName: "Usuario",
        id: usuario_id,
        failOnEmpty: true,
      });

      await update({
        modelName: "Usuario",
        id: usuario.id,
        data: { titular, ci },
      });

      const empresa = await find({
        modelName: "Empresa",
        id: empresa_id,
        failOnEmpty: true,
      });

      if (empresa.logo) {
        await deleteFile({ targetPath: uploadPath, fileName: path.basename(empresa.logo) });
      }

      let logoPath = null;
      if (req.files?.logo) {
        const imageName = empresa.id + nanoid() + "_logo.webp";
        await uploadFile({
          fileData: req.files.logo.data,
          targetPath: uploadPath,
          fileName: imageName,
          resizeOptions: { width: 1500, height: 1500, fit: 'inside' },
        });
        logoPath = 'logos/' + imageName;
      }

      await update({
        modelName: "Empresa",
        id: empresa.id,
        data: { razon_social, nit, logo: logoPath },
      });

      res.status(200).json({ message: 'Datos actualizados exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  changepassword: async (req, res) => {
    try {
      const { password, oldpassword } = req.body;
      const user = req.user;

      const isPasswordValid = await bcrypt.compare(oldpassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ message: 'La contraseña actual es incorrecta.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: 'Contraseña cambiada exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getusers: async (req, res) => {
    try {
      const users = await list({
        modelName: "Usuario",
        attributes: { exclude: ['password'] },
        include: [
          { model: models.Empresa, through: { attributes: [] } },
          { model: models.Role, as: "rol" },
        ],
      });

      res.status(200).json({ users });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getdata: async (req, res) => {
    try {
      const user = req.user;
      res.json({ empresas: user.Empresas || [] });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  changeState: async (req, res) => {
    try {
      const { id } = req.params;

      const user = await find({
        modelName: "Usuario",
        id,
        failOnEmpty: true,
      });

      user.activo = !user.activo;
      await user.save();

      res.status(200).json({ message: 'Estado de usuario modificado exitosamente.' });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  getregistros: async (req, res) => {
    try {
      const { empresa_id, gestion, mes } = req.query;

      const registros = await list({
        modelName: "Registro",
        where: {
          empresa_id,
          createdAt: {
            [Op.and]: [
              { [Op.gte]: new Date(gestion, mes - 1, 1, 0, 0, 0) },
              { [Op.lte]: new Date(gestion, mes, 0, 23, 59, 59) },
            ],
          },
        },
        order: [["id", "DESC"]],
      });

      res.status(200).json({ registros });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = UsuarioController;
