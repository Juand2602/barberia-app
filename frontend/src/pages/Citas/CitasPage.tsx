import React, { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon, List, Filter } from 'lucide-react';
import { View } from 'react-big-calendar';
import { useCitasStore } from '@stores/citasStore';
import { useEmpleadosStore } from '@stores/empleadosStore';
import { citasService } from '@services/citas.service';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { CitasCalendar } from '@components/calendar/CitasCalendar';
import { CitaForm } from '@components/forms/CitaForm';
import { CitaDetalle } from '@components/citas/CitaDetalle';
import { CambiarEstadoModal } from '@components/citas/CambiarEstadoModal';
import { Cita, CreateCitaDTO, EstadoCita } from '@/types/cita.types';

export const CitasPage: React.FC = () => {
  const { citas, loading, estadisticas, fetchCitas, fetchEstadisticas } = useCitasStore();
  const { empleados, fetchEmpleados } = useEmpleadosStore();

  const [vistaActual, setVistaActual] = useState<'calendario' | 'lista'>('calendario');
  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [isModalDetalleOpen, setIsModalDetalleOpen] = useState(false);
  const [isModalEstadoOpen, setIsModalEstadoOpen] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [editingCita, setEditingCita] = useState<Cita | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtros
  const [empleadoFiltro, setEmpleadoFiltro] = useState<string>('');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoCita | ''>('');

  // Para el calendario
  const [calendarView, setCalendarView] = useState<View>('week');
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    fetchEmpleados(true);
    loadCitas();
    fetchEstadisticas();
  }, []);

  useEffect(() => {
    loadCitas();
  }, [empleadoFiltro, estadoFiltro]);

  const loadCitas = () => {
    const filtros: any = {};
    if (empleadoFiltro) filtros.empleadoId = empleadoFiltro;
    if (estadoFiltro) filtros.estado = estadoFiltro;
    fetchCitas(filtros);
  };

  const handleCreate = () => {
    setEditingCita(null);
    setIsModalFormOpen(true);
  };

  const handleSelectEvento = (cita: Cita) => {
    setCitaSeleccionada(cita);
    setIsModalDetalleOpen(true);
  };

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    // Pre-llenar el formulario con la fecha/hora seleccionada
    const fechaHora = slotInfo.start.toISOString();
    setEditingCita({ fechaHora, duracionMinutos: 30 } as any);
    setIsModalFormOpen(true);
  };

  const handleSubmit = async (data: CreateCitaDTO) => {
    setIsSubmitting(true);
    try {
      if (editingCita?.id) {
        await citasService.update(editingCita.id, data);
        alert('Cita actualizada exitosamente');
      } else {
        await citasService.create(data);
        alert('Cita agendada exitosamente');
      }
      setIsModalFormOpen(false);
      setEditingCita(null);
      loadCitas();
      fetchEstadisticas();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar cita');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditar = () => {
    if (citaSeleccionada) {
      setEditingCita(citaSeleccionada);
      setIsModalDetalleOpen(false);
      setIsModalFormOpen(true);
    }
  };

  const handleCambiarEstado = () => {
    setIsModalDetalleOpen(false);
    setIsModalEstadoOpen(true);
  };

  const handleConfirmarCambioEstado = async (
    nuevoEstado: EstadoCita,
    motivoCancelacion?: string
  ) => {
    if (!citaSeleccionada) return;

    setIsSubmitting(true);
    try {
      await citasService.cambiarEstado(citaSeleccionada.id, {
        estado: nuevoEstado,
        motivoCancelacion,
      });
      alert('Estado actualizado exitosamente');
      setIsModalEstadoOpen(false);
      setCitaSeleccionada(null);
      loadCitas();
      fetchEstadisticas();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cambiar estado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelar = async () => {
    if (!citaSeleccionada) return;

    const motivo = prompt('Motivo de cancelación:');
    if (!motivo) return;

    try {
      await citasService.cambiarEstado(citaSeleccionada.id, {
        estado: 'CANCELADA',
        motivoCancelacion: motivo,
      });
      alert('Cita cancelada exitosamente');
      setIsModalDetalleOpen(false);
      setCitaSeleccionada(null);
      loadCitas();
      fetchEstadisticas();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al cancelar cita');
    }
  };

  const handleEliminar = async () => {
    if (!citaSeleccionada) return;

    if (!confirm('¿Estás seguro de eliminar esta cita?')) return;

    try {
      await citasService.delete(citaSeleccionada.id);
      alert('Cita eliminada exitosamente');
      setIsModalDetalleOpen(false);
      setCitaSeleccionada(null);
      loadCitas();
      fetchEstadisticas();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar cita');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Citas</h1>
        <p className="text-gray-600 mt-1">
          Gestiona las citas y horarios de tu barbería
        </p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="!p-4">
            <p className="text-2xl font-bold text-gray-900">{estadisticas.total}</p>
            <p className="text-sm text-gray-600">Total</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-bold text-yellow-600">{estadisticas.pendientes}</p>
            <p className="text-sm text-gray-600">Pendientes</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-bold text-green-600">{estadisticas.confirmadas}</p>
            <p className="text-sm text-gray-600">Confirmadas</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-bold text-gray-600">{estadisticas.completadas}</p>
            <p className="text-sm text-gray-600">Completadas</p>
          </Card>
          <Card className="!p-4">
            <p className="text-2xl font-bold text-red-600">{estadisticas.canceladas}</p>
            <p className="text-sm text-gray-600">Canceladas</p>
          </Card>
        </div>
      )}

      {/* Toolbar */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Vista */}
          <div className="flex gap-2">
            <Button
              variant={vistaActual === 'calendario' ? 'primary' : 'secondary'}
              onClick={() => setVistaActual('calendario')}
              className="flex items-center gap-2"
            >
              <CalendarIcon size={18} />
              Calendario
            </Button>
            <Button
              variant={vistaActual === 'lista' ? 'primary' : 'secondary'}
              onClick={() => setVistaActual('lista')}
              className="flex items-center gap-2"
            >
              <List size={18} />
              Lista
            </Button>
          </div>
          

          {/* Filtros */}
          <div className="flex gap-3 items-center">
            <Filter size={18} className="text-gray-600" />
            
            <select
              value={empleadoFiltro}
              onChange={(e) => setEmpleadoFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los barberos</option>
              {empleados.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre}
                </option>
              ))}
            </select>

            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value as EstadoCita | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="COMPLETADA">Completadas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>

          {/* Botón nueva cita */}
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={20} />
            Nueva Cita
          </Button>
        </div>
      </Card>

      {/* Leyenda de colores */}
      {vistaActual === 'calendario' && (
        <div className="mb-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-600 rounded"></div>
            <span>Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-600 rounded"></div>
            <span>Confirmada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-600 rounded"></div>
            <span>Completada</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded"></div>
            <span>Cancelada</span>
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando citas...</p>
          </div>
        ) : vistaActual === 'calendario' ? (
          <CitasCalendar
            citas={citas}
            onSelectEvento={handleSelectEvento}
            onSelectSlot={handleSelectSlot}
            view={calendarView}
            onViewChange={setCalendarView}
            date={calendarDate}
            onNavigate={setCalendarDate}
          />
        ) : (
          <div className="overflow-x-auto">
            {/* Vista de lista - implementación simple */}
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha/Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Servicio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Barbero
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {citas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(cita.fechaHora).toLocaleString('es-CO', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cita.cliente.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cita.servicioNombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cita.empleado.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          cita.estado === 'PENDIENTE'
                            ? 'bg-yellow-100 text-yellow-800'
                            : cita.estado === 'CONFIRMADA'
                            ? 'bg-green-100 text-green-800'
                            : cita.estado === 'COMPLETADA'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cita.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSelectEvento(cita)}
                      >
                        Ver
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Formulario */}
      <Modal
        isOpen={isModalFormOpen}
        onClose={() => {
          setIsModalFormOpen(false);
          setEditingCita(null);
        }}
        title={editingCita?.id ? 'Editar Cita' : 'Nueva Cita'}
        size="lg"
      >
        <CitaForm
          initialData={editingCita as any}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalFormOpen(false);
            setEditingCita(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal Detalle */}
      <Modal
        isOpen={isModalDetalleOpen}
        onClose={() => {
          setIsModalDetalleOpen(false);
          setCitaSeleccionada(null);
        }}
        title="Detalle de Cita"
        size="lg"
      >
        {citaSeleccionada && (
          <CitaDetalle
            cita={citaSeleccionada}
            onEditar={handleEditar}
            onCambiarEstado={handleCambiarEstado}
            onCancelar={handleCancelar}
            onEliminar={handleEliminar}
            onCerrar={() => {
              setIsModalDetalleOpen(false);
              setCitaSeleccionada(null);
            }}
          />
        )}
      </Modal>

      {/* Modal Cambiar Estado */}
      {citaSeleccionada && (
        <CambiarEstadoModal
          isOpen={isModalEstadoOpen}
          onClose={() => setIsModalEstadoOpen(false)}
          estadoActual={citaSeleccionada.estado}
          onConfirmar={handleConfirmarCambioEstado}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};