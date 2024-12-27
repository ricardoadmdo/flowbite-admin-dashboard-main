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
    <h2 className='text-center mb-4 text-primary fw-bold'>Lista de Gestores</h2>
    <div className='text-center mb-4'>
        <Link to='/gestorform' className='btn btn-success btn-lg px-4 shadow'>
            <i className='fas fa-plus-circle'></i> Agregar Nuevo Gestor
        </Link>
    </div>
    <div className='table-responsive rounded shadow-sm'>
        <table className='table table-bordered table-striped'>
            <thead className='bg-gradient text-white' style={{ backgroundColor: '#007BFF' }}>
                <tr>
                    <th scope='col'>Nombre</th>
                    <th scope='col' className='text-end'>Acciones</th>
                </tr>
            </thead>
            <tbody className='align-middle'>
                {gestoresList.map((val) => (
                    <tr key={val.uid}>
                        <td className=''>{val.nombre}</td>
                        <td className='text-end'>
                            <button
                                type='button'
                                className='btn btn-primary btn-sm shadow-sm me-2'
                                onClick={() => navigate(`/editGestor/${val.uid}`)}
                            >
                                <FontAwesomeIcon icon={faEdit} /> Editar
                            </button>
                            <button
                                type='button'
                                className='btn btn-danger btn-sm shadow-sm'
                                onClick={() => deleteGestor(val)}
                            >
                                <FontAwesomeIcon icon={faTrashAlt} /> Eliminar
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
    <div className='d-flex justify-content-center mt-4'>
        <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            handlePreviousPage={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
            handleNextPage={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
        />
    </div>
</div>

	);
};

export default GestoresList;
