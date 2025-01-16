import { useState, useEffect } from "react";
import Axios from "../../api/axiosConfig";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const GraficoProductosDia = () => {
	const [productosVendidos, setProductosVendidos] = useState([]);

	useEffect(() => {
		const fetchProductosVendidos = async () => {
			try {
				const { data } = await Axios.get("/venta/productos-hoy");

				// Asignar colores específicos a cada producto basado en un hash de su nombre
				const coloresUnicos = {};
				data.forEach(({ _id }) => {
					if (!coloresUnicos[_id]) {
						coloresUnicos[_id] = `hsl(${Math.random() * 360}, 70%, 50%)`;
					}
				});

				// Procesar los datos para el gráfico
				const productosProcesados = data.map(({ _id, total }) => ({
					nombre: _id, // Nombre del producto
					total, // Cantidad vendida
					color: coloresUnicos[_id], // Color único para el producto
				}));

				setProductosVendidos(productosProcesados);
			} catch (error) {
				console.error("Error al obtener productos vendidos hoy:", error);
			}
		};

		fetchProductosVendidos();
	}, []);

	return (
		<div
			className="container my-5"
			style={{
				minHeight: "calc(100vh - 410px)", // Ajusta según el tamaño de tu header y footer
			}}
		>
			<h2 className="text-center mb-4">Productos Vendidos Hoy</h2>
			<ResponsiveContainer
				width="100%"
				height={window.innerWidth < 768 ? 300 : 400} // Ajusta la altura en función del tamaño de la pantalla
			>
				<BarChart
					data={productosVendidos}
					margin={{
						top: 10,
						right: window.innerWidth < 768 ? 10 : 30,
						left: window.innerWidth < 768 ? 20 : 70,
						bottom: window.innerWidth < 768 ? 20 : 50, // Reduce el margen inferior
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="nombre" tick={false} /> {/* Ocultamos las etiquetas */}
					<YAxis />
					<Tooltip
						formatter={(value) => [`${value} unidades`]} // Solo mostrar las unidades
					/>
					<Bar dataKey="total" name="Cantidad Vendida" isAnimationActive={true}>
						{productosVendidos.map((producto) => (
							<Cell key={producto.nombre} fill={producto.color} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	);
};

export default GraficoProductosDia;
