import { useState, useEffect } from 'react';
import Axios from '../../api/axiosConfig';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import Pagination from '../ui/Pagination';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UsuariosSkeleton from './UsuariosSkeleton';
import ErrorComponent from '../ui/ErrorComponent';

const fetchUsuarios = async (page, limit) => {
	const response = await Axios.get(`/usuarios`, {
		params: { page, limit },
	});
	return response.data;
};

const UsuarioList = () => {
	const [usuariosData, setUsuariosData] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isError, setIsError] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [limit] = useState(8);
	const navigate = useNavigate();

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const data = await fetchUsuarios(currentPage, limit);
			setUsuariosData(data);
		} catch (error) {
			console.error('Error fetching usuarios:', error);
			setIsError(true);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, [currentPage]);

	const deleteUsuario = async (usuario) => {
		const result = await Swal.fire({
			title: `¿Está seguro que desea eliminar el usuario <strong>${usuario.nombre}</strong>?`,
			text: 'El usuario será eliminado!',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#3085d6',
			cancelButtonColor: '#d33',
			confirmButtonText: 'Sí, eliminar!',
			cancelButtonText: 'Cancelar',
		});

		if (result.isConfirmed) {
			try {
				await Axios.delete(`/usuarios/${usuario.uid}`);
				fetchData();
				Swal.fire({
					title: 'Usuario eliminado!',
					html: `<i>El usuario <strong>${usuario.nombre}</strong> ha sido eliminado con éxito.</i>`,
					icon: 'success',
					timer: 3000,
				});
			} catch (error) {
				console.error('Error eliminando usuario:', error);
				Swal.fire('Error', 'No se pudo eliminar el usuario', 'error');
			}
		}
	};

	if (isLoading) return <UsuariosSkeleton />;
	if (isError) return <ErrorComponent message='No se pudo cargar la lista de usuarios' />;

	const usuariosList = usuariosData?.usuarios || [];
	const totalPages = usuariosData?.totalPages || 1;

	return (
		<div className='container my-5'>
			<h2 className='text-center mb-4'>Lista de Usuarios</h2>
			<div className='text-center mb-4'>
				<Link to='/usuarioform' className='btn btn-success'>
					Agregar Nuevo Usuario
				</Link>
			</div>
			<div className='table-responsive'>
				<table className='table table-striped table-bordered'>
					<thead className='thead-dark'>
						<tr>
							<th>Nombre</th>
							<th>Usuario</th>
							<th>Rol</th>
							<th>Acciones</th>
						</tr>
					</thead>
					<tbody>
						{usuariosList.map((val) => (
							<tr key={val.uid}>
								<td>{val.nombre}</td>
								<td>{val.usuario}</td>
								<td>{val.rol}</td>
								<td className='d-flex justify-content-between'>
									<button
										type='button'
										className='btn btn-outline-secondary'
										onClick={() => navigate(`/editUser/${val.uid}`)}
									>
										<FontAwesomeIcon icon={faEdit} /> Editar
									</button>
									<button
										type='button'
										className='btn btn-outline-danger'
										onClick={() => deleteUsuario(val)}
									>
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

export default UsuarioList;
