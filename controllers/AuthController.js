const { find } = require("../services");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const models = require('../models/Relaciones');

const AuthController = {
  login: async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await find({
        modelName: "Usuario",
        where: { username },
        include: {
          model: models.Empresa,
          include: [{ model: models.Sucursal }],
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'Usuario no encontrado.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Contraseña incorrecta.' });
      }

      if (!user.activo) {
        return res.status(401).json({ message: 'Usuario bloqueado.' });
      }

      let empresa_id = null;
      let sucursal_id = null;

      if (user.Empresa) {
        empresa_id = user.Empresa.id;
        if (user.Empresa.Sucursals && user.Empresa.Sucursals.length > 0) {
          sucursal_id = user.Empresa.Sucursals[0].id;
        }
      }

      const payload = { id: user.id };

      const token = jwt.sign(payload, 'sudo_control1', { expiresIn: '1d' }); // Token válido por 1 día

      res.status(200).json({
        message: 'Login exitoso.',
        token,
        empresa_id,
        sucursal_id,
      });
    } catch (error) {
      console.error(error);
      res.status(error.statusCode || 500).json({ message: error.message });
    }
  },
};

module.exports = AuthController;
