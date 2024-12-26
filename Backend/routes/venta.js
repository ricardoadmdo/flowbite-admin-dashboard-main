const { Router } = require('express');
const {
	createVenta,
	getVentas,
	deleteVenta,
	getVentasPorMes,
	getVentasPorAno,
	getVentasPorMesGestor,
	getAllVentasByDay,
	getUltimoCodigoFactura,
} = require('../controllers/venta');
const router = Router();

router.get('/', getVentas); // Ventas paginadas
router.post('/', createVenta); // Crear venta
router.delete('/:id', deleteVenta); // Eliminar venta
router.get('/mes', getVentasPorMes); // Ventas diarias del mes actual
router.get('/gestor', getVentasPorMesGestor); // Ventas diarias del mes actual
router.get('/ano', getVentasPorAno); // Ventas mensuales del año actual
router.get('/ano', getVentasPorAno); // Ventas mensuales del año actual
router.get('/all', getAllVentasByDay); // Ventas mensuales del año actual
router.get('/ultimo-codigo-factura', getUltimoCodigoFactura); // Ventas mensuales del año actual

module.exports = router;
