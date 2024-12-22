import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../auth/authContext';

const useAuth = () => {
  const { user } = useContext(AuthContext);
  return { user };
};

export const AdminRoute = ({ element }) => {
  const { user } = useAuth();

  return user && user.rol === 'Administrador' ? (
    element
  ) : (
    <Navigate to="/" /> // Redirige al login si el usuario no es admin
  );
};
