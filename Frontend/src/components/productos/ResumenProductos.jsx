import { useEffect, useState, useRef, useContext } from "react";
import Axios from "../../api/axiosConfig";
import ProductSkeleton from "./ProductSkeleton";
import ErrorComponent from "../ui/ErrorComponent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import html2pdf from "html2pdf.js";
import { AuthContext } from "../../auth/authContext";

const fetchProductos = async () => {
	const response = await Axios.get(`/productos/all`);
	return response.data;
};

const ResumenProductos = () => {
	const { user } = useContext(AuthContext);
	const [productosData, setProductosData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const componentRef = useRef();

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const data = await fetchProductos();
			setProductosData(data);
		} catch (error) {
			console.error("Error fetching productos:", error);
			setIsError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Obtener fecha actual y formatearla
	const obtenerFechaFormateada = () => {
		const fecha = new Date();
		return fecha
			.toLocaleDateString("es-ES", {
				day: "2-digit",
				month: "2-digit",
				year: "numeric",
			})
			.replace(/\//g, "-"); // Cambiar barras por guiones
	};

	const handlePrint = async () => {
		try {
			const data = await fetchProductos();
			setProductosData(data);

			setTimeout(() => {
				const element = componentRef.current;
				const fechaFormateada = obtenerFechaFormateada();
				const opt = {
					margin: 0.5,
					filename: `Reporte_de_Inventario_${fechaFormateada}.pdf`, // Incluye la fecha en el nombre del archivo
					image: { type: "jpeg", quality: 0.98 },
					html2canvas: { scale: 2 },
					jsPDF: { unit: "in", format: "letter", orientation: "landscape" },
				};
				html2pdf().from(element).set(opt).save();
			}, 500);
		} catch (error) {
			console.error("Error fetching all productos for printing:", error);
		}
	};

	if (isLoading) return <ProductSkeleton />;
	if (isError) return <ErrorComponent message="No se pudo cargar el resumen de productos" />;

	const productosList = productosData?.productos || [];
	const totalProductos = productosList.length;
	const totalGanancia = productosList.reduce(
		(acc, producto) => acc + (producto.venta - producto.costo) * producto.existencia,
		0
	);
	const totalGananciaNeta = productosList.reduce(
		(acc, producto) => acc + (producto.venta - producto.costo - producto.precioGestor) * producto.existencia,
		0
	);
	const totalCostoInventario = productosList.reduce((acc, producto) => acc + producto.costo * producto.existencia, 0);
	const totalVentaInventario = productosList.reduce((acc, producto) => acc + producto.venta * producto.existencia, 0);
	const totalVentaInventarioSinGestor = productosList.reduce(
		(acc, producto) => acc + producto.venta * producto.existencia - producto.precioGestor * producto.existencia,
		0
	);
	const totalGestor = productosList.reduce((acc, producto) => acc + producto.precioGestor * producto.existencia, 0);

	return (
		<div className="container my-5">
			<div className="text-end">
				<button onClick={handlePrint} className="btn btn-primary">
					<FontAwesomeIcon icon={faPrint} /> Imprimir
				</button>
			</div>

			<div ref={componentRef}>
				<h4 className="text-center">Existencia de Productos</h4>
				<div className="d-flex justify-content-between mb-4">
					<span>Área: Almacén</span>
					<span>{obtenerFechaFormateada()}</span>
				</div>
				<ul className="list-group mb-4">
					<li className="list-group-item">
						<strong>Total de Productos:</strong> {totalProductos}
					</li>
					{user.rol === "Administrador" && (
						<>
							<li className="list-group-item">
								<strong>Total Costo de Inventario:</strong> ${totalCostoInventario.toFixed(2)}
							</li>

							<li className="list-group-item">
								<strong>Total Ganancia Esperada (sin quitar el precio del gestor):</strong> $
								{totalGanancia.toFixed(2)}
							</li>

							<li className="list-group-item">
								<strong>Total Ganancia Neta para Alejandro (quitando el precio del gestor):</strong> $
								{totalGananciaNeta.toFixed(2)}
							</li>
						</>
					)}
					<li className="list-group-item">
						<strong>Total de Venta (sin quitar gestor):</strong> ${totalVentaInventario.toFixed(2)}
					</li>
					<li className="list-group-item">
						<strong>Total de Venta (con gestor quitado):</strong> $
						{totalVentaInventarioSinGestor.toFixed(2)}
					</li>
					<li className="list-group-item">
						<strong>Total de Gestor:</strong> ${totalGestor.toFixed(2)}
					</li>
				</ul>
				<h5 className="text-center mb-4">Servicios Bravo</h5>
				<div className="table-responsive">
					<table className="table table-striped table-bordered rounded-3 overflow-hidden">
						<thead className="thead-dark">
							<tr>
								<th>Código</th>
								<th>Descripción</th>
								<th>Existencia</th>
								{user.rol === "Administrador" && <th>Costo</th>}
								<th>Venta</th>
								<th>Venta sin Gestor</th>
								{user.rol === "Administrador" && <th>Imp-Costo</th>}
								<th>Imp-Venta</th>
								<th>Imp-Venta sin Gestor</th>
								{user.rol === "Administrador" && <th>Ganancia Total</th>}
								{user.rol === "Administrador" && <th>Ganancia Neta</th>}
								<th>Ganancia Gestor</th>
							</tr>
						</thead>
						<tbody>
							{productosList.map((producto) => {
								const gananciaProducto = (producto.venta - producto.costo) * producto.existencia;
								const costoTotalProducto = producto.costo * producto.existencia;
								const ventaTotalProducto = producto.venta * producto.existencia;
								const ventaTotalProductoSinGestor =
									producto.venta * producto.existencia - producto.precioGestor * producto.existencia;
								const gananciaSinGestor =
									(producto.venta - producto.precioGestor - producto.costo) * producto.existencia;
								const gananciaGestor = producto.precioGestor * producto.existencia;

								return (
									<tr key={producto.uid}>
										<td>{producto.codigo}</td>
										<td>{producto.descripcion}</td>
										<td>{producto.existencia}</td>
										{user.rol === "Administrador" && <td>${producto.costo.toFixed(2)}</td>}
										<td>${producto.venta.toFixed(2)}</td>
										<td>${producto.precioGestor.toFixed(2)}</td>
										{user.rol === "Administrador" && <td>${costoTotalProducto.toFixed(2)}</td>}
										<td>${ventaTotalProducto.toFixed(2)}</td>
										<td>${ventaTotalProductoSinGestor.toFixed(2)}</td>
										{user.rol === "Administrador" && <td>${gananciaProducto.toFixed(2)}</td>}
										{user.rol === "Administrador" && <td>${gananciaSinGestor.toFixed(2)}</td>}
										<td>{gananciaGestor.toFixed(2)}</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};

export default ResumenProductos;
