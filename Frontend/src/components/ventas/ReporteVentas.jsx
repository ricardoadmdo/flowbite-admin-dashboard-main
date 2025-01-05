import { useState, useContext, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../ui/Pagination";
import Swal from "sweetalert2";
import Axios from "../../api/axiosConfig";
import "../ventas/ReporteVentas.css";
import { AuthContext } from "../../auth/authContext";
import ReporteVentasSkeleton from "./ReportedeVentaSkeleton";
import Estadisticas from "./Estadisticas";
import TablaVentas from "./TablaVentas";
import { calcularEstadisticas, useVentasGlobales, useVentasPaginadas } from "../../hooks/ventasHooks";
import GananciaGestores from "./GananciaGestores";

const ReporteVentas = () => {
	const [ventasLocales, setVentasLocales] = useState([]);
	const [reload, setReload] = useState(false);
	const [startDate, setStartDate] = useState(new Date());
	const [currentPage, setCurrentPage] = useState(1);
	const { user } = useContext(AuthContext);

	const { ventas, totalPages, isLoading, isError, eliminarVenta } = useVentasPaginadas(
		startDate,
		currentPage,
		reload
	);
	const ventasGlobales = useVentasGlobales(startDate);

	const { totalGanancia, totalRecaudado, gananciaNeta, productoMasVendido } = calcularEstadisticas(ventasGlobales);

	useEffect(() => {
		if (!isLoading && !isError) {
			setVentasLocales(ventas); // Sincroniza con los datos del hook
		}
	}, [ventas, isLoading, isError]);

	const handleDeleteVenta = async (id) => {
		try {
			await Axios.delete(`/venta/${id}`);
			setReload(!reload); // Forzar recarga del hook
			eliminarVenta(id);
			Swal.fire("¡Eliminada!", "La venta ha sido eliminada.", "success");
		} catch (error) {
			console.error("Error al eliminar la venta:", error);
			Swal.fire("Error", "No se pudo eliminar la venta.", "error");
		}
	};

	const handlePreviousPage = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};

	return (
		<div className="container my-5">
			<h2 className="text-center mb-4">Reporte de Ventas</h2>
			<div className="d-flex justify-content-center mb-4">
				<DatePicker
					selected={startDate}
					onChange={setStartDate}
					dateFormat="dd/MM/yyyy"
					className="form-control"
				/>
			</div>
			{isError ? (
				<p className="text-danger">Ocurrió un error al cargar las ventas.</p>
			) : isLoading ? (
				<ReporteVentasSkeleton />
			) : (
				<>
					<Estadisticas {...{ totalGanancia, totalRecaudado, gananciaNeta, productoMasVendido, user }} />
					<GananciaGestores ventas={ventasGlobales} />
					<TablaVentas ventas={ventasLocales} user={user} handleDeleteVenta={handleDeleteVenta} />
				</>
			)}
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				handlePreviousPage={handlePreviousPage}
				handleNextPage={handleNextPage}
			/>
		</div>
	);
};

export default ReporteVentas;
