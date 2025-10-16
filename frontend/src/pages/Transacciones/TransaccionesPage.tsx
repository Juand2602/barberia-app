import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Filter } from 'lucide-react';
import { useTransaccionesStore } from '@stores/transaccionesStore';
import { useEmpleadosStore } from '@stores/empleadosStore';
import { transaccionesService } from '@services/transacciones.service';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { TransaccionesTable } from '@components/tables/TransaccionesTable';
import { IngresoForm } from '@components/forms/IngresoForm';
import { EgresoForm } from '@components/forms/EgresoForm';
import { TransaccionDetalle } from '@components/transacciones/TransaccionDetalle';
import { Transaccion, CreateTransaccionDTO, TipoTransaccion } from '@/types/transaccion.types';

type ModalType = 'ingreso' | 'egreso' | null;

export const TransaccionesPage: React.FC = () => {
  const { transacciones, loading, estadisticas, fetchTransacciones, fetchEstadisticas } =
    useTransaccionesStore();
  const { empleados, fetchEmpleados } = useEmpleadosStore();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [isModalDetalleOpen, setIsModalDetalleOpen] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState<Transaccion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtros
  const [tipoFiltro, setTipoFiltro] = useState<TipoTransaccion | ''>('');
  const [empleadoFiltro, setEmpleadoFiltro] = useState<string>('');
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState<string>('');

  useEffect(() => {
    fetchEmpleados(true);
    loadTransacciones();
    fetchEstadisticas();
  }, []);

  useEffect(() => {
    loadTransacciones();
  }, [tipoFiltro, empleadoFiltro, metodoPagoFiltro]);

  const loadTransacciones = () => {
    const filtros: any = {};
    if (tipoFiltro) filtros.tipo = tipoFiltro;
    if (empleadoFiltro) filtros.empleadoId = empleadoFiltro;
    if (metodoPagoFiltro) filtros.metodoPago = metodoPagoFiltro;
    fetchTransacciones(filtros);
  };

  const handleOpenModal = (type: 'ingreso' | 'egreso') => {
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
  };

  const handleSubmit = async (data: CreateTransaccionDTO) => {
    setIsSubmitting(true);
    try {
      await transaccionesService.create(data);
      alert(
        `${data.tipo === 'INGRESO' ? 'Venta' : 'Egreso'} registrado exitosamente`
      );
      handleCloseModal();
      loadTransacciones();
      fetchEstadisticas();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (transaccion: Transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setIsModalDetalleOpen(true);
  };

  const handleDelete = async (transaccion: Transaccion) => {
    if (
      !confirm(
        `¿Estás seguro de eliminar esta transacción por ${transaccion.total.toLocaleString()}?`
      )
    )
      return;

    try {
      await transaccionesService.delete(transaccion.id);
      alert('Transacción eliminada exitosamente');
      loadTransacciones();
      fetchEstadisticas();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar transacción');
    }
  };

  const handleEliminarDetalle = async () => {
    if (!transaccionSeleccionada) return;
    setIsModalDetalleOpen(false);
    await handleDelete(transaccionSeleccionada);
    setTransaccionSeleccionada(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
        <p className="text-gray-600 mt-1">Registra ventas y gastos de tu barbería</p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="!p-0">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Ingresos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(estadisticas.totalIngresos)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.cantidadIngresos} transacciones
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="!p-0">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Egresos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(estadisticas.totalEgresos)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.cantidadEgresos} transacciones
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="!p-0">
            <div className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balance</p>
                <p
                  className={`text-2xl font-bold ${
                    estadisticas.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(estadisticas.balance)}
                </p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-gray-500">
                    💵 {formatCurrency(estadisticas.totalEfectivo)}
                  </span>
                  <span className="text-gray-500">
                    💳 {formatCurrency(estadisticas.totalTransferencias)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!p-0">
            <div className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Transacciones</p>
                <p className="text-2xl font-bold text-blue-600">
                  {estadisticas.totalTransacciones}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {estadisticas.cantidadIngresos} ingresos / {estadisticas.cantidadEgresos} egresos
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Toolbar */}
      <Card className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Filtros */}
          <div className="flex gap-3 items-center flex-wrap">
            <Filter size={18} className="text-gray-600" />

            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value as TipoTransaccion | '')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los tipos</option>
              <option value="INGRESO">Ingresos</option>
              <option value="EGRESO">Egresos</option>
            </select>

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
              value={metodoPagoFiltro}
              onChange={(e) => setMetodoPagoFiltro(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los métodos</option>
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-3">
            <Button
              onClick={() => handleOpenModal('ingreso')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus size={20} />
              Registrar Venta
            </Button>
            <Button
              onClick={() => handleOpenModal('egreso')}
              variant="danger"
              className="flex items-center gap-2"
            >
              <Plus size={20} />
              Registrar Gasto
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando transacciones...</p>
          </div>
        ) : (
          <TransaccionesTable
            transacciones={transacciones}
            onView={handleView}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {/* Modal Ingreso */}
      <Modal
        isOpen={modalType === 'ingreso'}
        onClose={handleCloseModal}
        title="Registrar Venta"
        size="xl"
      >
        <IngresoForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal Egreso */}
      <Modal
        isOpen={modalType === 'egreso'}
        onClose={handleCloseModal}
        title="Registrar Gasto"
        size="lg"
      >
        <EgresoForm
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal Detalle */}
      <Modal
        isOpen={isModalDetalleOpen}
        onClose={() => {
          setIsModalDetalleOpen(false);
          setTransaccionSeleccionada(null);
        }}
        title="Detalle de Transacción"
        size="lg"
      >
        {transaccionSeleccionada && (
          <TransaccionDetalle
            transaccion={transaccionSeleccionada}
            onEliminar={handleEliminarDetalle}
            onCerrar={() => {
              setIsModalDetalleOpen(false);
              setTransaccionSeleccionada(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};