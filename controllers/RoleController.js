const { create, update, destroy, find, list } = require("../services");

const RoleController = {
  getRoles: async (req, res) => {
    try {
      const roles = await list({
        modelName: "Role",
        include: {
          model: require("../models/Permission"),
          through: { attributes: [] },
        },
      });

      const permissions = await list({
        modelName: "Permission",
      });

      const groupedPermissions = permissions.reduce((acc, permission) => {
        const { subject, action, id } = permission;
        if (!acc[subject]) {
          acc[subject] = [];
        }
        acc[subject].push({ id, action });
        return acc;
      }, {});

      const actionOrder = ["Vet", "Crear", "Editar", "Eliminar"];

      const formattedPermissions = Object.keys(groupedPermissions).map((subject) => {
        const sortedPermissions = groupedPermissions[subject].sort(
          (a, b) => actionOrder.indexOf(a.action) - actionOrder.indexOf(b.action)
        );
        return {
          subject,
          permissions: sortedPermissions,
        };
      });

      res.status(200).json({
        success: true,
        data: { roles, permissions: formattedPermissions },
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  addRol: async (req, res) => {
    try {
      const { nombre } = req.body;

      await create({
        modelName: "Role",
        data: { nombre },
        validate: [
          {
            field: "nombre",
            unique: true,
          },
        ],
      });

      res.status(201).json({
        success: true,
        message: "Rol creado correctamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  editRol: async (req, res) => {
    try {
      const { id, nombre, permissionsSelected } = req.body;

      await find({
        modelName: "Role",
        id,
        failOnEmpty: true,
      });

      await update({
        modelName: "Role",
        id,
        data: { nombre },
        validate: [
          {
            field: "nombre",
            unique: true,
            excludeId: id,
          },
        ],
        relate: [
          { method: "setPermissions", field: "permissionsSelected" },
        ],
        options: {
          individualHooks: true,
        },
      });

      res.status(200).json({
        success: true,
        message: "Rol actualizado correctamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },

  deleteRol: async (req, res) => {
    try {
      const { id } = req.params;

      await find({
        modelName: "Role",
        id,
        failOnEmpty: true,
      });

      await destroy({
        modelName: "Role",
        id,
      });

      res.status(200).json({
        success: true,
        message: "Rol eliminado correctamente.",
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = RoleController;
