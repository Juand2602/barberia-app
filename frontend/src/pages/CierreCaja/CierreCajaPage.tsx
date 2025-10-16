import React, { useEffect, useState } from 'react';
import { Plus, Calendar, AlertCircle, CheckCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useCierreCajaStore } from '@stores/cierrecajaStore';
import { cierreCajaService } from '@services/cierrecaja.service';
import { CierreCaja, DatosCierre } from '@/types/cierrecaja.types';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { CierreCajaForm } from '@components/forms/CierreCajaForm';
import { CierreDetalle } from '@components/cierrecaja/CierreDetalle';

export const CierreCajaPage: React.FC = () => {
  const { cierres, loading, estadisticas, fetchCierres, fetchEstadisticas } = useCierreCajaStore();

  const [isModalFormOpen, setIsModalFormOpen] = useState(false);
  const [isModalDetalleOpen, setIsModalDetalleOpen] = useState(false);
  const [cierreSeleccionado, setCierreSeleccionado] = useState<CierreCaja | null>(null);
  const [datosCierre, setDatosCierre] = useState<DatosCierre | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [puedeCerrar, setPuedeCerrar] = useState<boolean>(false);
  const [motivoNoPuedeCerrar, setMotivoNoPuedeCerrar] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    fetchCierres();
    fetchEstadisticas();
    await verificarPuedeCerrar();
  };

  const verificarPuedeCerrar = async () => {
    try {
      const resultado = await cierreCajaService.puedeCerrar();
      setPuedeCerrar(resultado.puede);
      if (!resultado.puede) {
        setMotivoNoPuedeCerrar(resultado.motivo || 'No se puede cerrar');
      } else if (resultado.datos) {
        setDatosCierre(resultado.datos);
      }
    } catch (error) {
      console.error('Error al verificar cierre:', error);
    }
  };

  const handleNuevoCierre = async () => {
    if (!puedeCerrar) {
      alert(motivoNoPuedeCerrar);
      return;
    }

    // Recalcular datos
    try {
      const datos = await cierreCajaService.calcularDatos();
      setDatosCierre(datos);
      setIsModalFormOpen(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al calcular datos');
    }
  };

  const handleSubmit = async (efectivoFinal: number, notas?: string) => {
    if (!datosCierre) return;

    setIsSubmitting(true);
    try {
      await cierreCajaService.create({
        efectivoInicial: datosCierre.efectivoInicial,
        efectivoFinal,
        notas,
      });
      alert('Cierre de caja registrado exitosamente');
      setIsModalFormOpen(false);
      setDatosCierre(null);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar cierre');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerDetalle = (cierre: CierreCaja) => {
    setCierreSeleccionado(cierre);
    setIsModalDetalleOpen(true);
  };

  const handleEliminar = async (cierre: CierreCaja) => {
    if (!confirm(`¿Estás seguro de eliminar el cierre del ${format(new Date(cierre.fecha), 'dd/MM/yyyy')}?`)) {
      return;
    }

    try {
      await cierreCajaService.delete(cierre.id);
      alert('Cierre eliminado exitosamente');
      setIsModalDetalleOpen(false);
      setCierreSeleccionado(null);
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar cierre');
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Cierre de Caja</h1>
        <p className="text-gray-600 mt-1">Cuadre diario de efectivo y control de diferencias</p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="!p-0">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cierres</p>
                  <p className="text-3xl font-bold text-gray-900">{estadisticas.totalCierres}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="text-blue-600" size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="!p-0">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Diferencia Total</p>
                  <p
                    className={`text-2xl font-bold ${
                      estadisticas.diferenciaTotal >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {estadisticas.diferenciaTotal >= 0 ? '+' : ''}
                    {formatCurrency(estadisticas.diferenciaTotal)}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    estadisticas.diferenciaTotal >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}
                >
                  {estadisticas.diferenciaTotal >= 0 ? (
                    <TrendingUp className="text-green-600" size={24} />
                  ) : (
                    <TrendingDown className="text-red-600" size={24} />
                  )}
                </div>
              </div>
            </div>
          </Card>

          <Card className="!p-0">
            <div className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Diferencia Promedio</p>
                <p
                  className={`text-2xl font-bold ${
                    estadisticas.diferenciaPromedio >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {estadisticas.diferenciaPromedio >= 0 ? '+' : ''}
                  {formatCurrency(estadisticas.diferenciaPromedio)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="!p-0">
            <div className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Con Diferencias</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {estadisticas.cierresConDiferenciasSignificativas}
                </p>
                <p className="text-xs text-gray-500 mt-1">Mayor a $20,000</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Botón Nuevo Cierre */}
      <Card className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Cierre del Día</h3>
            <p className="text-sm text-gray-600 mt-1">
              {format(new Date(), "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </p>
          </div>
          {puedeCerrar ? (
            <Button
              onClick={handleNuevoCierre}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <Plus size={20} />
              Realizar Cierre
            </Button>
          ) : (
            <div className="flex items-center gap-2 text-gray-500">
              <AlertCircle size={20} />
              <span className="text-sm">{motivoNoPuedeCerrar}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Historial de Cierres */}
      <Card title="Historial de Cierres">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando cierres...</p>
          </div>
        ) : cierres.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No hay cierres registrados</p>
            <p className="text-gray-400 text-sm mt-2">
              Realiza tu primer cierre de caja del día
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Efectivo Inicial
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ingresos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Egresos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Esperado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Diferencia
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
                {cierres.map((cierre) => {
                  const diferenciaSignificativa = Math.abs(cierre.diferencia) > 20000;

                  return (
                    <tr key={cierre.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {format(new Date(cierre.fecha), 'dd/MM/yyyy', { locale: es })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatCurrency(cierre.efectivoInicial)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        +{formatCurrency(cierre.ingresos)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        -{formatCurrency(cierre.egresos)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                        {formatCurrency(cierre.efectivoEsperado)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {formatCurrency(cierre.efectivoFinal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-sm font-bold ${
                            cierre.diferencia === 0
                              ? 'text-green-600'
                              : cierre.diferencia > 0
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {cierre.diferencia >= 0 ? '+' : ''}
                          {formatCurrency(cierre.diferencia)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {cierre.diferencia === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                            <CheckCircle size={12} />
                            Exacto
                          </span>
                        ) : diferenciaSignificativa ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                            <AlertCircle size={12} />
                            Con diferencia
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                            Menor
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleVerDetalle(cierre)}
                        >
                          Ver
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Formulario */}
      {datosCierre && (
        <Modal
          isOpen={isModalFormOpen}
          onClose={() => {
            setIsModalFormOpen(false);
            setDatosCierre(null);
          }}
          title="Realizar Cierre de Caja"
          size="lg"
        >
          <CierreCajaForm
            datos={datosCierre}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalFormOpen(false);
              setDatosCierre(null);
            }}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {/* Modal Detalle */}
      <Modal
        isOpen={isModalDetalleOpen}
        onClose={() => {
          setIsModalDetalleOpen(false);
          setCierreSeleccionado(null);
        }}
        title="Detalle del Cierre"
        size="lg"
      >
        {cierreSeleccionado && (
          <CierreDetalle
            cierre={cierreSeleccionado}
            onEliminar={() => handleEliminar(cierreSeleccionado)}
            onCerrar={() => {
              setIsModalDetalleOpen(false);
              setCierreSeleccionado(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};