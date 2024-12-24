const { Router } = require('express');
const { createVenta, getVentas, deleteVenta, getVentasPorMes, getVentasPorAno, } = require('../controllers/venta');
const router = Router();

router.get('/', getVentas); // Ventas paginadas
router.post('/', createVenta); // Crear venta
router.delete('/:id', deleteVenta); // Eliminar venta
router.get('/mes', getVentasPorMes); // Ventas diarias del mes actual
router.get('/ano', getVentasPorAno); // Ventas mensuales del año actual


module.exports = router;
