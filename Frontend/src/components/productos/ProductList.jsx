import { useState, useEffect } from "react";
import Axios from "../../api/axiosConfig";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../ui/Pagination";
import Swal from "sweetalert2";
import ProductSkeleton from "./ProductSkeleton";
import ErrorComponent from "../ui/ErrorComponent";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "../productos/ProductList.css";
import { Edit, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const useProductos = (page, limit, searchTerm) => {
	return useQuery({
		queryKey: ["productos", page, limit, searchTerm],
		queryFn: () => fetchProductosName(page, limit, searchTerm),
		keepPreviousData: true,
		staleTime: 5000,
		select: (data) => ({
			productos: data?.productos || [],
			totalPages: data?.totalPages || 1,
		}),
	});
};

// Modifica fetchProductos para aceptar el parámetro de búsqueda
const fetchProductosName = async (page, limit, searchTerm = "") => {
	const response = await Axios.get(`/productos`, {
		params: { page, limit, search: searchTerm },
	});
	return response.data;
};

const ProductList = () => {
	const queryClient = useQueryClient();
	const [isLoadingSpinner, setIsLoadingSpinner] = useState(false); // Estado para el loading
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(8);
	const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
	const [searchInput, setSearchInput] = useState(""); // Estado para el término ingresado en el input
	const navigate = useNavigate();

	const { data, isLoading, isError, refetch } = useProductos(currentPage, limit, searchTerm);

	useEffect(() => {
		queryClient.prefetchQuery({
			queryKey: ["productos", currentPage + 1, limit, searchTerm],
			queryFn: () => fetchProductosName(currentPage + 1, limit, searchTerm),
		});
	}, [currentPage, limit, searchTerm, queryClient]);

	const handleSearchInput = (e) => {
		setSearchInput(e.target.value); // Actualiza el término ingresado en el input
	};

	const handleSearch = async () => {
		setIsLoadingSpinner(true); // Activar spinner antes de realizar la búsqueda
		try {
			setSearchTerm(searchInput); // Actualizar el término de búsqueda
			setCurrentPage(1); // Reiniciar a la primera página
		} catch (error) {
			console.error("Error realizando la búsqueda:", error);
		} finally {
			setIsLoadingSpinner(false); // Desactivar spinner al terminar
		}
	};

	const handleDelete = async (producto) => {
		const result = await Swal.fire({
			title: `Eliminar`,
			html: `¿Está seguro de eliminar el producto <strong>${producto.nombre}</strong>?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: "Sí, eliminar",
			cancelButtonText: "Cancelar",
		});

		if (result.isConfirmed) {
			try {
				await Axios.delete(`/productos/${producto.uid}`);
				Swal.fire("Eliminado", `El producto ${producto.nombre} ha sido eliminado`, "success");
				queryClient.invalidateQueries({ queryKey: ["productos"], exact: true });
			} catch (error) {
				console.error("Error eliminando producto:", error);
				Swal.fire("Error", "No se pudo eliminar el producto", "error");
			}
		}
	};

	const handleViewMore = (producto) => {
		const gananciaPorUnidad = producto.venta - producto.costo;
		const gananciaTotal = gananciaPorUnidad * producto.existencia;

		Swal.fire({
			title: `Detalles de ${producto.nombre}`,
			html: `
                <p><strong>Descripción:</strong> ${producto.descripcion}</p>
                <p><strong>Código:</strong> ${producto.codigo}</p>
                <p><strong>Precio Costo:</strong> $${producto.costo}</p>
                <p><strong>Precio Venta:</strong> $${producto.venta}</p>
                <p><strong>Ganancia del Gestor:</strong> $${producto.precioGestor}</p>
                <p><strong>Existencia:</strong> ${producto.existencia} unidades</p>
                <p><strong>Ganancia por Unidad:</strong> $${gananciaPorUnidad}</p>
                <p><strong>Costo Total de todos los ${producto.nombre}:</strong> $${
				producto.costo * producto.existencia
			}</p>
                <p><strong>Ganancia Total de todos los ${producto.nombre}:</strong> $${gananciaTotal}</p>
            `,
			icon: "info",
			confirmButtonText: "Cerrar",
		});
	};

	if (isLoading) return <ProductSkeleton />;
	if (isError) {
		return (
			<ErrorComponent message="No se pudo cargar la lista de productos">
				<button onClick={() => refetch()} disabled={isLoading} className="btn btn-primary">
					Reintentar
				</button>
			</ErrorComponent>
		);
	}

	const productosList = data?.productos || [];
	const totalPages = data?.totalPages || 1;

	const handlePreviousPage = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};

	return (
		<div className="container py-5 ">
			<div className="d-flex justify-content-between align-items-center mb-5">
				<h2 className="display-6 fw-bold m-0">Lista de Productos</h2>
				<Link to="/productform" className="btn btn-success px-4 py-2 d-flex align-items-center gap-2">
					<span className="fs-5">+</span> Agregar Producto
				</Link>
			</div>

			{/* Barra de búsqueda con botón */}
			<div className="mb-4 d-flex gap-2">
				<input
					type="text"
					className="form-control"
					placeholder="Buscar productos por nombre..."
					value={searchInput}
					onChange={handleSearchInput}
				/>
				<button className="btn btn-primary" onClick={handleSearch}>
					{isLoadingSpinner && (
						<div className="spinner-border spinner-border-sm me-2" role="status">
							<span className="visually-hidden">Cargando...</span>
						</div>
					)}
					Buscar
				</button>
			</div>

			<div className="row g-4">
				{productosList.length > 0 ? (
					productosList.map((producto) => (
						<div key={producto.uid} className="col-sm-6 col-md-4 col-lg-3">
							<div className="card h-100 shadow-sm border-0 position-relative product-card">
								<div className="card-img-wrapper position-relative">
									<LazyLoadImage
										height="200px"
										className="card-img-top position-absolute"
										src={producto.url}
										alt={`Imagen del producto: ${producto.nombre}`}
										effect="blur"
										style={{ objectFit: "contain" }}
									/>
									<div className="img-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center">
										<button
											className="btn btn-light btn-sm me-2"
											onClick={() => handleViewMore(producto)}
										>
											<span className="text-primary">Ver más detalles</span>
										</button>
									</div>
								</div>

								<div className="card-body">
									<h5 className="card-title fw-bold text-truncate mb-3">{producto.nombre}</h5>
									<div className="product-details">
										<div className="mb-2 d-flex justify-content-between">
											<span className="text-muted">Código:</span>
											<span className="fw-medium">{producto.codigo}</span>
										</div>
										<div className="mb-2 d-flex justify-content-between">
											<span className="text-muted">Precio Costo:</span>
											<span className="fw-medium text-danger">${producto.costo}</span>
										</div>
										<div className="mb-2 d-flex justify-content-between">
											<span className="text-muted">Precio Venta:</span>
											<span className="fw-bold text-success">${producto.venta}</span>
										</div>
										<div className="mb-2 d-flex justify-content-between">
											<span className="text-muted">Ganancia del Gestor:</span>
											<span className="fw-bold text-primary">${producto.precioGestor}</span>
										</div>

										<div className="d-flex justify-content-between">
											<span className="text-muted">Existencia:</span>
											<span className="fw-medium">
												<span className="badge bg-success">{producto.existencia} unidades</span>
											</span>
										</div>
									</div>
								</div>

								<div className="card-footer bg-transparent border-top-0 d-flex gap-2 p-3">
									<button
										className="btn btn-secondary flex-grow-1 d-flex align-items-center justify-content-center gap-2"
										onClick={() => navigate(`/edit/${producto.uid}`)}
									>
										<Edit size={16} /> Editar
									</button>
									<button
										className="btn btn-danger flex-grow-1 d-flex align-items-center justify-content-center gap-2"
										onClick={() => handleDelete(producto)}
									>
										<Trash2 size={16} /> Eliminar
									</button>
								</div>
							</div>
						</div>
					))
				) : (
					<div className="col-12 text-center py-5">
						<p className="text-muted fs-5">No hay productos disponibles.</p>
					</div>
				)}
			</div>

			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				handlePreviousPage={handlePreviousPage}
				handleNextPage={handleNextPage}
			/>
		</div>
	);
};
export default ProductList;
