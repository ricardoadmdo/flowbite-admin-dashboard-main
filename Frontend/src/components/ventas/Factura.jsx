import React from 'react';
import PropTypes from 'prop-types';

const Factura = React.forwardRef(({ productos, totalProductos, precioTotal, fecha, gestor }, ref) => {
	return (
		<div ref={ref} className='factura-container p-4 border bg-light'>
			<h3 className='text-center'>Factura de Venta</h3>
			<p>Fecha: {new Date(fecha).toLocaleString()}</p>
			<p>Gestor: {gestor || 'Ninguno'}</p>
			<table className='table'>
				<thead>
					<tr>
						<th>Producto</th>
						<th>Cantidad</th>
						<th>Precio Unitario</th>
						<th>Subtotal</th>
					</tr>
				</thead>
				<tbody>
					{productos.map((producto) => (
						<tr key={producto.uid}>
							<td>{producto.nombre}</td>
							<td>{producto.cantidad}</td>
							<td>${producto.venta.toFixed(2)}</td>
							<td>${(producto.venta * producto.cantidad).toFixed(2)}</td>
						</tr>
					))}
				</tbody>
			</table>
			<div className='text-end'>
				<p>Total de Productos: {totalProductos}</p>
				<h4>Total a Pagar: ${precioTotal.toFixed(2)}</h4>
			</div>
		</div>
	);
});

// Asigna el nombre del componente
Factura.displayName = 'Factura';

// Valida las propiedades con PropTypes
Factura.propTypes = {
	productos: PropTypes.arrayOf(
		PropTypes.shape({
			uid: PropTypes.string.isRequired,
			nombre: PropTypes.string.isRequired,
			cantidad: PropTypes.number.isRequired,
			venta: PropTypes.number.isRequired,
		})
	).isRequired,
	totalProductos: PropTypes.number.isRequired,
	precioTotal: PropTypes.number.isRequired,
	fecha: PropTypes.string.isRequired,
	gestor: PropTypes.string,
};

export default Factura;
