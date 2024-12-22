import PropTypes from 'prop-types';

const GananciaGestores = ({ ventas, porcentajeGanancia }) => {
	// Calcular las ganancias de los gestores
	const gananciasPorGestor = ventas.reduce((acc, venta) => {
		const { gestor, productos } = venta;

		// Ignorar ventas con gestor "Ninguno" o sin gestor
		if (!gestor || gestor.toLowerCase() === 'ninguno') return acc;

		// Calcular la ganancia total de la venta
		let gananciaVenta = 0;
		productos.forEach((producto) => {
			gananciaVenta += (producto.venta - producto.costo) * producto.cantidad;
		});

		// Calcular el porcentaje de ganancia del gestor
		const gananciaGestor = gananciaVenta * porcentajeGanancia;

		// Acumular la ganancia del gestor
		acc[gestor] = (acc[gestor] || 0) + gananciaGestor;
		return acc;
	}, {});

	return (
		<div className='ganancia-gestores'>
			<h4>Ganancia por Gestor</h4>
			{Object.keys(gananciasPorGestor).length > 0 ? (
				<ul>
					{Object.entries(gananciasPorGestor).map(([gestor, ganancia]) => (
						<li key={gestor}>
							<strong>{gestor}:</strong> ${ganancia.toFixed(2)} CUP
						</li>
					))}
				</ul>
			) : (
				<p>No hay ganancias registradas para gestores.</p>
			)}
		</div>
	);
};

export default GananciaGestores;

GananciaGestores.propTypes = {
	ventas: PropTypes.arrayOf(
		PropTypes.shape({
			gestor: PropTypes.string.isRequired,
			productos: PropTypes.arrayOf(
				PropTypes.shape({
					venta: PropTypes.number.isRequired,
					costo: PropTypes.number.isRequired,
					cantidad: PropTypes.number.isRequired,
				})
			).isRequired,
		})
	).isRequired,
	porcentajeGanancia: PropTypes.number.isRequired,
};
