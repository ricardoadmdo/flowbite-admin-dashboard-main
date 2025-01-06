import { useState, useContext } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Pagination from "../ui/Pagination";
import Swal from "sweetalert2";
import "../ventas/ReporteVentas.css";
import { AuthContext } from "../../auth/authContext";
import ReporteVentasSkeleton from "./ReportedeVentaSkeleton";
import Estadisticas from "./Estadisticas";
import TablaVentas from "./TablaVentas";
import { calcularEstadisticas, useVentasGlobales, useVentasPaginadas } from "../../hooks/ventasHooks";
import GananciaGestores from "./GananciaGestores";

const ReporteVentas = () => {
	const [startDate, setStartDate] = useState(new Date());
	const [currentPage, setCurrentPage] = useState(1);
	const { user } = useContext(AuthContext);

	const { ventas, totalPages, isLoading, isError, eliminarVenta } = useVentasPaginadas(startDate, currentPage);
	const ventasGlobales = useVentasGlobales(startDate);

	const { totalGanancia, totalRecaudado, gananciaNeta, productoMasVendido } = calcularEstadisticas(ventasGlobales);

	const handleDeleteVenta = (id) => {
		eliminarVenta.mutate(id, {
			onError: () => {
				Swal.fire("Error", "No se pudo eliminar la venta.", "error");
			},
			onSuccess: () => {
				Swal.fire({
					title: "Venta eliminada!",
					html: `<i>La venta ha sido eliminada con éxito.</i>`,
					icon: "success",
					timer: 3000,
				});
			},
		});
	};

	return (
		<div className="container my-5">
			<h2 className="text-center mb-4">Reporte de Ventas</h2>
			<div className="d-flex flex-column align-items-center mb-4">
				<label htmlFor="datepicker">Seleccione una fecha:</label>{" "}
				<DatePicker
					id="datepicker"
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
					<TablaVentas ventas={ventas} user={user} handleDeleteVenta={handleDeleteVenta} />
				</>
			)}
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				handlePreviousPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
				handleNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
			/>
		</div>
	);
};

export default ReporteVentas;
