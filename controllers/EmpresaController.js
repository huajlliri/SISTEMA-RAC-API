const { Op } = require('sequelize');
const path = require('path');
const { nanoid } = require('nanoid');
const models = require('../models/Relaciones');
const { create, update, destroy, list, find, bulkCreate, uploadImage, deleteFile } = require('../services');

const uploadPath = path.resolve(__dirname, '../public/logos');

const EmpresaController = {

    addempresa: async (req, res) => {
        try {
            const { razon_social, nit, titular, ci, numero_patronal, ciudad } = req.body;

            await find({ modelName: 'Empresa', where: { nit }, failIfFound: true, failMessage: 'El valor ya está registrado.' });

            const empresa = await create({
                modelName: 'Empresa',
                data: { razon_social, nit, titular, ci, ciudad, numero_patronal }
            });

            if (req.files?.logo) {
                const imageName = empresa.id + nanoid() + '_logo.webp';
                const imagePath = await uploadImage(req.files.logo.data, uploadPath, imageName);
                await update({ modelName: 'Empresa', id: empresa.id, data: { logo: 'logos/' + path.basename(imagePath) } });
            }

            res.status(201).json({ message: 'Empresa creada exitosamente' });

        } catch (error) {
            console.error(error);
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    },

    editempresa: async (req, res) => {
        try {
            const { id, razon_social, nit, titular, ci, numero_patronal, ciudad } = req.body;

            const empresa = await find({ modelName: 'Empresa', id, failOnEmpty: true });

            await find({ modelName: 'Empresa', where: { nit, id: { [Op.ne]: id } }, failIfFound: true, failMessage: 'Nit ya registrado.' });

            await update({ modelName: 'Empresa', id, data: { razon_social, nit, titular, ci, ciudad, numero_patronal } });

            if (empresa.logo) {
                await deleteFile(path.join(uploadPath, path.basename(empresa.logo)));
                await update({ modelName: 'Empresa', id, data: { logo: null } });
            }

            if (req.files?.logo) {
                const imageName = empresa.id + nanoid() + '_logo.webp';
                const imagePath = await uploadImage(req.files.logo.data, uploadPath, imageName);
                await update({ modelName: 'Empresa', id, data: { logo: 'logos/' + path.basename(imagePath) } });
            }

            res.status(201).json({ message: 'Empresa actualizada exitosamente' });

        } catch (error) {
            console.error(error);
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    },

    getestadisticas: async (req, res) => {
        try {
            const { empresa_id } = req.query;
            const Empresa = models.Empresa;
            const Sucursal = models.Sucursal;
            const Venta = models.Venta;
            const Compra = models.Compra;
            const Efectivo = models.Efectivo;

            const empresa = await Empresa.findByPk(empresa_id, {
                include: [{
                    model: Sucursal,
                    include: [
                        { model: Venta, include: [{ model: Efectivo, as: 'efectivoVenta' }] },
                        { model: Compra, include: [{ model: Efectivo, as: 'efectivoCompra' }] }
                    ]
                }]
            });

            if (!empresa) return res.status(404).json({ message: 'Empresa no encontrada' });

            const ventasPorSucursalYMes = {};
            const comprasPorSucursalYMes = {};
            const CPCPorSucursalYMes = {};
            const CPPPorSucursalYMes = {};

            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth();
            const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const twoMonthsAgo = currentMonth === 0 ? 10 : currentMonth - 2;

            empresa.Sucursales.forEach((sucursal) => {
                const ventasMes = [0, 0, 0];
                const comprasMes = [0, 0, 0];
                const CPCMes = [0, 0, 0];
                const CPPMes = [0, 0, 0];

                sucursal.Ventas?.forEach((venta) => {
                    const [year, month] = venta.fecha_factura.split('-').map(Number);
                    if (year === currentYear) {
                        const idx = month - 1 === currentMonth ? 0 : month - 1 === previousMonth ? 1 : 2;
                        const importe = parseFloat(venta.importe_total);
                        if (venta.estado !== 'A') {
                            if (venta.efectivoVenta) ventasMes[idx] += importe;
                            else CPCMes[idx] += importe;
                        }
                    }
                });

                sucursal.Compras?.forEach((compra) => {
                    const [year, month] = compra.fecha_factura_dui_dim.split('-').map(Number);
                    if (year === currentYear) {
                        const idx = month - 1 === currentMonth ? 0 : month - 1 === previousMonth ? 1 : 2;
                        const importe = parseFloat(compra.importe_total_compra);
                        if (compra.efectivoCompra) comprasMes[idx] += importe;
                        else CPPMes[idx] += importe;
                    }
                });

                ventasPorSucursalYMes[sucursal.zona_lugar] = ventasMes;
                comprasPorSucursalYMes[sucursal.zona_lugar] = comprasMes;
                CPCPorSucursalYMes[sucursal.zona_lugar] = CPCMes;
                CPPPorSucursalYMes[sucursal.zona_lugar] = CPPMes;
            });

            const mapToSeries = (data) => Object.entries(data).map(([name, values]) => ({ name, data: values }));

            res.json({
                series: mapToSeries(ventasPorSucursalYMes),
                series2: mapToSeries(comprasPorSucursalYMes),
                series3: mapToSeries(CPCPorSucursalYMes),
                series4: mapToSeries(CPPPorSucursalYMes),
            });

        } catch (error) {
            console.error(error);
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    },

    getempresas: async (req, res) => {
        try {
            const empresas = await list({ modelName: 'Empresa' });
            res.json({ empresas });
        } catch (error) {
            console.error(error);
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    },

    getEmpresasRoles: async (req, res) => {
        try {
            const empresas = await list({ modelName: 'Empresa' });
            const roles = await list({ modelName: 'Role' });
            res.json({ empresas, roles });
        } catch (error) {
            console.error(error);
            res.status(error.statusCode || 500).json({ message: error.message });
        }
    },

    deleteempresa: async (req, res) => {
        try {
            const { id } = req.body;

            const empresa = await find({ modelName: 'Empresa', id, failOnEmpty: true });

            await create({
                modelName: 'Registro',
                data: {
                    usuario: req.user.nombre,
                    detalle: `Eliminó la empresa: ${empresa.razon_social}`,
                    accion: 'Eliminación',
                    empresa_id: empresa.id
                }
            });

            await destroy({ modelName: 'Empresa', id });

            res.status(200).json({ message: 'Empresa eliminada correctamente' });

        } catch (error) {
            if (error.name === 'SequelizeForeignKeyConstraintError' || error.message.includes('a foreign key constraint fails')) {
                res.status(400).json({ message: 'Este registro tiene dependencias y no puede ser eliminado.' });
            } else {
                console.error(error);
                res.status(error.statusCode || 500).json({ message: error.message });
            }
        }
    },

};

module.exports = EmpresaController;
