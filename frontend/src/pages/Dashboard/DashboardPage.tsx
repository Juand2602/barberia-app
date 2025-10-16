import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { 
  Users, 
  Scissors, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock
} from 'lucide-react';
import { citasService } from '@services/citas.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Cita } from '@/types/cita.types';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [proximasCitas, setProximasCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProximasCitas();
  }, []);

  const loadProximasCitas = async () => {
    try {
      const citas = await citasService.getProximas(5);
      setProximasCitas(citas);
    } catch (error) {
      console.error('Error al cargar próximas citas:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      name: 'Citas Hoy',
      value: proximasCitas.filter(c => {
        const hoy = new Date();
        const citaFecha = new Date(c.fechaHora);
        return citaFecha.toDateString() === hoy.toDateString();
      }).length.toString(),
      icon: <Calendar className="text-blue-600" size={24} />,
      bg: 'bg-blue-50',
    },
    {
      name: 'Clientes Totales',
      value: '48',
      icon: <Users className="text-green-600" size={24} />,
      bg: 'bg-green-50',
    },
    {
      name: 'Ingresos Hoy',
      value: '$240,000',
      icon: <DollarSign className="text-purple-600" size={24} />,
      bg: 'bg-purple-50',
    },
    {
      name: 'Servicios Activos',
      value: '4',
      icon: <Scissors className="text-orange-600" size={24} />,
      bg: 'bg-orange-50',
    },
  ];

  const quickActions = [
    { label: 'Nueva Cita', path: '/citas', icon: <Calendar size={20} /> },
    { label: 'Nuevo Cliente', path: '/clientes', icon: <Users size={20} /> },
    { label: 'Registrar Venta', path: '/transacciones', icon: <DollarSign size={20} /> },
    { label: 'Ver Reportes', path: '/reportes', icon: <TrendingUp size={20} /> },
  ];

  const getEstadoColor = (estado: string) => {
    const colors: any = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      CONFIRMADA: 'bg-green-100 text-green-800',
      COMPLETADA: 'bg-gray-100 text-gray-800',
      CANCELADA: 'bg-red-100 text-red-800',
    };
    return colors[estado] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Bienvenido al sistema de gestión de tu barbería
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="!p-0">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card title="Acciones Rápidas" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="secondary"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate(action.path)}
            >
              {action.icon}
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximas Citas */}
        <Card title="Próximas Citas">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : proximasCitas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay citas próximas
            </div>
          ) : (
            <div className="space-y-4">
              {proximasCitas.map((cita) => (
                <div 
                  key={cita.id} 
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate('/citas')}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="text-blue-600" size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {cita.cliente.nombre}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {cita.servicioNombre} - {cita.empleado.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(cita.fechaHora), "EEE d MMM, HH:mm", { locale: es })}
                    </p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(cita.estado)}`}>
                    {cita.estado}
                  </span>
                </div>
              ))}
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/citas')}
              >
                Ver todas las citas
              </Button>
            </div>
          )}
        </Card>

        {/* Servicios Populares */}
        <Card title="Servicios Populares">
          <div className="space-y-4">
            {[
              { name: 'Corte Clásico', count: 45, color: 'bg-blue-500' },
              { name: 'Corte + Barba', count: 32, color: 'bg-green-500' },
              { name: 'Diseño', count: 18, color: 'bg-purple-500' },
            ].map((service, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scissors className="text-gray-600" size={20} />
                    <span className="font-medium text-gray-900">{service.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{service.count} veces</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${service.color} h-2 rounded-full transition-all`}
                    style={{ width: `${(service.count / 45) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => navigate('/servicios')}
            >
              Ver todos los servicios
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};