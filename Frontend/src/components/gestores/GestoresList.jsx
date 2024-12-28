import { useState, useEffect } from 'react';
import Axios from '../../api/axiosConfig';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../ui/Pagination';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import GestoresSkeleton from './GestoresSkeleton';
import ErrorComponent from '../ui/ErrorComponent';

const fetchGestor = async (page, limit) => {
	const response = await Axios.get(`/gestor`, {
		params: { page, limit },
	});
	return response.data;
};

const GestoresList = () => {
	const [gestoresData, setGestoresData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(8);
	const navigate = useNavigate();

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const data = await fetchGestor(currentPage, limit);
			setGestoresData(data);
		} catch (error) {
			console.error('Error fetching gestores:', error);
			setIsError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [currentPage]);

	const deleteGestor = async (gestor) => {
		const result = await Swal.fire({
			title: `Eliminar`,
			html: `¿Está seguro que desea eliminar el gestor <strong>${gestor.nombre}</strong>?`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Sí, eliminar',
			cancelButtonText: 'Cancelar',
		});

		if (result.isConfirmed) {
			try {
				await Axios.delete(`/gestor/${gestor.uid}`);
				fetchData();
				Swal.fire({
					title: 'Gestor eliminado!',
					html: `<i>El gestor <strong>${gestor.nombre}</strong> ha sido eliminado con éxito.</i>`,
					icon: 'success',
					timer: 3000,
				});
			} catch (error) {
				console.error('Error eliminando gestor:', error);
				Swal.fire('Error', 'No se pudo eliminar el gestor', 'error');
			}
		}
	};

	if (isLoading) return <GestoresSkeleton />;
	if (isError) return <ErrorComponent message='No se pudo cargar la lista de gestor' />;

	const gestoresList = gestoresData?.gestores || [];
	const totalPages = gestoresData?.totalPages || 1;

	return (
		<div className='container my-5'>
			<h2 className='text-center mb-4'>Lista de Gestores</h2>
			<div className='text-center mb-4'>
				<Link to='/gestorform' className='btn btn-success'>
					Agregar Nuevo Gestor
				</Link>
			</div>
			<div className='table-responsive'>
				<table className='table table-striped table-bordered rounded-3 overflow-hidden'>
					<thead className='thead-dark'>
						<tr>
							<th>Nombre</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{gestoresList.map((val) => (
							<tr key={val.uid}>
								<td>{val.nombre}</td>
								<td className='d-flex justify-content-between'>
									<button
										type='button'
										className='btn btn-secondary'
										onClick={() => navigate(`/editGestor/${val.uid}`)}
									>
										<FontAwesomeIcon icon={faEdit} /> Editar
									</button>
									<button type='button' className='btn btn-danger' onClick={() => deleteGestor(val)}>
										<FontAwesomeIcon icon={faTrashAlt} /> Eliminar
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
			<Pagination
				currentPage={currentPage}
				totalPages={totalPages}
				handlePreviousPage={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
				handleNextPage={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
			/>
		</div>
	);
};

export default GestoresList;
