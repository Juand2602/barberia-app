import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Scissors, 
  Calendar, 
  DollarSign, 
  FileText, 
  Settings,
  BarChart3,
  UserCircle2,
  Calculator  // ← NUEVO
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: <BarChart3 size={20} /> },
  { name: 'Citas', path: '/citas', icon: <Calendar size={20} /> },
  { name: 'Clientes', path: '/clientes', icon: <Users size={20} /> },
  { name: 'Servicios', path: '/servicios', icon: <Scissors size={20} /> },
  { name: 'Empleados', path: '/empleados', icon: <UserCircle2 size={20} /> },
  { name: 'Transacciones', path: '/transacciones', icon: <DollarSign size={20} /> },
  { name: 'Cierre de Caja', path: '/cierre-caja', icon: <Calculator size={20} /> }, // ← NUEVO
  { name: 'Reportes', path: '/reportes', icon: <FileText size={20} /> },
  { name: 'Configuración', path: '/configuracion', icon: <Settings size={20} /> },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Scissors className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Barbería App</h1>
            <p className="text-gray-400 text-xs">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="text-gray-400 text-xs">
          <p>Versión 1.0.0</p>
          <p className="mt-1">© 2025 Barbería App</p>
        </div>
      </div>
    </div>
  );
};