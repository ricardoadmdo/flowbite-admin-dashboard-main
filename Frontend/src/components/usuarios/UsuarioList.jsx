import { useState, useEffect } from 'react';
import Axios from '../../api/axiosConfig';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UsuarioList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getUsuarios();
  }, []);

  const getUsuarios = () => {
    Axios.get('/usuarios').then((response) => {
      setUsuarios(response.data.usuarios);
    });
  };

  const deleteUsuario = (usuario) => {
    Swal.fire({
      title: `¿Está seguro que desea eliminar el usuario <strong>${usuario.nombre}</strong>?`,
      text: 'El usuario será eliminado!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        Axios.delete(`/usuarios/${usuario.uid}`).then(() => {
          getUsuarios();
          Swal.fire({
            title: 'Usuario eliminado!',
            html: `<i>El usuario <strong>${usuario.nombre}</strong> ha sido eliminado con éxito.</i>`,
            icon: 'success',
            timer: 3000,
          });
        });
      }
    });
  };

  return (
    <div className='container animate__animated animate__fadeIn my-5'>
      <h2 className='text-center mb-4'>Lista de Usuarios</h2>
      <div className='text-center mb-4'>
        <Link to='/usuarioform' className='btn btn-success'>
          Agregar Nuevo Usuario
        </Link>
      </div>
      <div className='row'>
        {usuarios.map((val) => (
          <div key={val.uid} className='col-md-4 mb-4'>
            <div className='card'>
              <div className='card-body'>
                <h5 className='card-title'><strong>Nombre: </strong>{val.nombre}</h5>
                <p className='card-text'><strong>Usuario: </strong>{val.usuario}</p>
                <p className='card-text'> <strong>Rol: </strong> {val.rol}</p>
                <div className='d-flex justify-content-between'>
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
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsuarioList;
