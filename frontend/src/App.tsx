import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@components/layout/Layout';
import { ClientesPage } from '@pages/Clientes/ClientesPage';
import { ServiciosPage } from '@pages/Servicios/ServiciosPage';
import { DashboardPage } from '@pages/Dashboard/DashboardPage';
import { EmpleadosPage } from '@pages/Empleados/EmpleadosPage';
import { CitasPage } from '@pages/Citas/CitasPage';
import { TransaccionesPage } from '@pages/Transacciones/TransaccionesPage';
import { CierreCajaPage } from '@pages/CierreCaja/CierreCajaPage';
import ReportesPage  from '@pages/Reportes/ReportesPage';

// Página temporal para rutas no implementadas
const ComingSoon: React.FC<{ title: string }> = ({ title }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
      <p className="text-gray-600">Módulo próximamente disponible</p>
    </div>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/citas" element={<CitasPage />} />
          <Route path="/clientes" element={<ClientesPage />} />
          <Route path="/servicios" element={<ServiciosPage />} />
          <Route path="/empleados" element={<EmpleadosPage />} />
          <Route path="/transacciones" element={<TransaccionesPage />} />
          <Route path="/cierre-caja" element={<CierreCajaPage />} />
          <Route path="/reportes" element={<ReportesPage />} />
          <Route path="/configuracion" element={<ComingSoon title="Configuración" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;