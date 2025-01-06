import PropTypes from "prop-types";

const Estadisticas = ({ totalGanancia, totalRecaudado, gananciaNeta, productoMasVendido, user }) => (
	<div className="mb-4">
		<p>
			<strong>Total Recaudado del Día:</strong> ${totalRecaudado.toFixed(2)} CUP
		</p>
		{user.rol === "Administrador" && (
			<>
				<p>
					<strong>Ganancia Total del Día:</strong> ${totalGanancia.toFixed(2)} CUP
				</p>
				<p>
					<strong>Ganancia Neta para Alejandro:</strong> ${gananciaNeta.toFixed(2)} CUP
				</p>
			</>
		)}
		<p>
			<strong>Producto Más Vendido:</strong> {productoMasVendido || "No hay ventas."}
		</p>
	</div>
);

Estadisticas.propTypes = {
	totalGanancia: PropTypes.number.isRequired, // Debería ser un número (obligatorio)
	totalRecaudado: PropTypes.number.isRequired, // Debería ser un número (obligatorio)
	gananciaNeta: PropTypes.number.isRequired, // Debería ser un número (obligatorio)
	productoMasVendido: PropTypes.string.isRequired, // Debería ser una cadena de texto (obligatorio)
	user: PropTypes.shape({
		rol: PropTypes.string.isRequired, // Se espera un objeto con una propiedad `rol` de tipo string (obligatorio)
	}).isRequired,
};
export default Estadisticas;
