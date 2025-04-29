const User = require('../models/Usuario');
const jwt = require('jsonwebtoken');

const ValidateTokenAdmin = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }
        const decodedToken = jwt.verify(token, 'sudo_control1');
        const user = await User.findByPk(decodedToken.id, {
        });

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (!user.activo) {
            return res.status(401).json({ message: 'Usuario bloqueado' });
        }
        if (!user.admin) {
            return res.status(401).json({ message: 'No eres administrador' });
        }


        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expirado' });
        }
        return res.status(500).json({ error: error.message });
    }
};

module.exports = ValidateTokenAdmin;
