import React, { useState, useEffect } from 'react';
import Axios from '../../api/axiosConfig';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc' }}>
        <p className="label">{`${label} : $${payload[0].value}`}</p>
        <p className="desc">Total recaudado por el gestor en el mes.</p>
      </div>
    );
  }

  return null;
};

const GraficoGestorRecaudacionMensual = () => {
  const [datosRecaudacion, setDatosRecaudacion] = useState([]);

  useEffect(() => {
    const fetchDatosGraficos = async () => {
      try {
        const { data: ventasMensuales } = await Axios.get('/venta/mes');

        // Agrupar ventas por gestor y sumar los totales
        const recaudacionPorGestor = ventasMensuales.reduce((acc, venta) => {
          const { gestor, total } = venta;
          if (!acc[gestor]) {
            acc[gestor] = 0;
          }
          acc[gestor] += total;
          return acc;
        }, {});

        // Convertir el objeto en un arreglo para el gráfico
        const datosProcesados = Object.entries(recaudacionPorGestor).map(([gestor, total]) => ({
          name: gestor,
          total,
        }));

        setDatosRecaudacion(datosProcesados);
      } catch (error) {
        console.error('Error al obtener los datos para los gráficos:', error);
      }
    };

    fetchDatosGraficos();
  }, []);

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4">Recaudación Mensual por Gestor</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={datosRecaudacion}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" label={{ value: 'Gestores', position: 'insideBottom', offset: -5 }} />
          <YAxis label={{ value: 'Total Recaudado ($)', angle: -90, position: 'insideLeft' }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar dataKey="total" barSize={20} fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4">
        <h4 className="text-center">Detalle de Recaudación</h4>
        <ul className="list-group">
          {datosRecaudacion.map(({ name, total }) => (
            <li key={name} className="list-group-item d-flex justify-content-between align-items-center">
              {name}
              <span className="badge bg-primary rounded-pill">${total}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default GraficoGestorRecaudacionMensual;
