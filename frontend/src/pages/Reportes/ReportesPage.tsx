// src/pages/Reportes/ReportesPage.tsx

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";
import { useReportesStore } from "../../stores/reportesStore";
import FiltrosFecha from "../../components/reportes/FiltrosFecha";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

const ReportesPage: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState(startOfMonth(new Date()));
  const [fechaFin, setFechaFin] = useState(endOfMonth(new Date()));
  const [reporteActivo, setReporteActivo] = useState<string>("dashboard");

  const {
    dashboard,
    reporteVentas,
    reporteVentasPorEmpleado,
    reporteVentasPorServicio,
    reporteCitas,
    reporteFinanciero,
    reporteClientes,
    loading,
    error,
    fetchDashboard,
    fetchReporteVentas,
    fetchReporteVentasPorEmpleado,
    fetchReporteVentasPorServicio,
    fetchReporteCitas,
    fetchReporteFinanciero,
    fetchReporteClientes,
  } = useReportesStore();

  useEffect(() => {
    fetchDashboard(fechaInicio, fechaFin);
  }, []);

  const generarReporte = () => {
    switch (reporteActivo) {
      case "dashboard":
        fetchDashboard(fechaInicio, fechaFin);
        break;
      case "ventas":
        fetchReporteVentas(fechaInicio, fechaFin);
        break;
      case "ventas-empleado":
        fetchReporteVentasPorEmpleado(fechaInicio, fechaFin);
        break;
      case "ventas-servicio":
        fetchReporteVentasPorServicio(fechaInicio, fechaFin);
        break;
      case "citas":
        fetchReporteCitas(fechaInicio, fechaFin);
        break;
      case "financiero":
        fetchReporteFinanciero(fechaInicio, fechaFin);
        break;
      case "clientes":
        fetchReporteClientes(fechaInicio, fechaFin);
        break;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const reportes = [
    {
      id: "dashboard",
      nombre: "Dashboard General",
      icon: BarChart3,
      color: "blue",
    },
    {
      id: "ventas",
      nombre: "Reporte de Ventas",
      icon: DollarSign,
      color: "green",
    },
    {
      id: "ventas-empleado",
      nombre: "Ventas por Empleado",
      icon: Users,
      color: "purple",
    },
    {
      id: "ventas-servicio",
      nombre: "Ventas por Servicio",
      icon: ShoppingBag,
      color: "orange",
    },
    { id: "citas", nombre: "Reporte de Citas", icon: Calendar, color: "pink" },
    {
      id: "financiero",
      nombre: "Reporte Financiero",
      icon: TrendingUp,
      color: "indigo",
    },
    {
      id: "clientes",
      nombre: "Reporte de Clientes",
      icon: FileText,
      color: "teal",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reportes y Análisis
        </h1>
        <p className="text-gray-600">
          Analiza el rendimiento de tu barbería con reportes detallados
        </p>
      </div>

      {/* Selector de tipo de reporte */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {reportes.map((reporte) => {
          const Icon = reporte.icon;
          const isActive = reporteActivo === reporte.id;

          return (
            <button
              key={reporte.id}
              onClick={() => setReporteActivo(reporte.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? `border-${reporte.color}-500 bg-${reporte.color}-50`
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Icon
                className={`w-6 h-6 mx-auto mb-2 ${
                  isActive ? `text-${reporte.color}-600` : "text-gray-400"
                }`}
              />
              <p
                className={`text-xs font-medium text-center ${
                  isActive ? `text-${reporte.color}-900` : "text-gray-600"
                }`}
              >
                {reporte.nombre.split(" ")[0]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filtros de fecha */}
      <FiltrosFecha
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onFechaInicioChange={setFechaInicio}
        onFechaFinChange={setFechaFin}
        onAplicar={generarReporte}
      />

      {/* Contenido del reporte */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generando reporte...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* DASHBOARD GENERAL */}
          {reporteActivo === "dashboard" && dashboard && (
            <div className="space-y-6">
              {/* Tarjetas de métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    {dashboard.comparativa.porcentaje !== 0 && (
                      <Badge
                        variant={
                          dashboard.comparativa.porcentaje > 0
                            ? "success"
                            : "danger"
                        }
                      >
                        {dashboard.comparativa.porcentaje > 0 ? "+" : ""}
                        {dashboard.comparativa.porcentaje.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboard.ventas.total)}
                  </h3>
                  <p className="text-sm text-gray-600">Total en Ventas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboard.ventas.cantidad} transacciones
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {dashboard.citas.total}
                  </h3>
                  <p className="text-sm text-gray-600">Total de Citas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboard.citas.porEstado.COMPLETADA || 0} completadas
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {dashboard.clientes.cantidad}
                  </h3>
                  <p className="text-sm text-gray-600">Clientes Nuevos</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {dashboard.empleadoTop
                      ? dashboard.empleadoTop.nombre
                      : "N/A"}
                  </h3>
                  <p className="text-sm text-gray-600">Empleado Top</p>
                  {dashboard.empleadoTop && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(dashboard.empleadoTop.total)}
                    </p>
                  )}
                </Card>
              </div>

              {/* Servicios más vendidos */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Servicios Más Vendidos
                  </h3>
                  <div className="space-y-3">
                    {dashboard.serviciosMasVendidos.map((servicio, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {servicio.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                              {servicio.cantidad} ventas
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(servicio.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* REPORTE DE VENTAS */}
          {reporteActivo === "ventas" && reporteVentas && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Total Ingresos</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reporteVentas.resumen.totalIngresos)}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Cantidad de Ventas
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteVentas.resumen.cantidadVentas}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Promedio por Venta
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reporteVentas.resumen.promedioVenta)}
                  </p>
                </Card>
              </div>

              {/* Por método de pago */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ingresos por Método de Pago
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(reporteVentas.resumen.porMetodoPago).map(
                      ([metodo, data]) => (
                        <div
                          key={metodo}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {metodo}
                            </p>
                            <p className="text-sm text-gray-500">
                              {data.cantidad} transacciones
                            </p>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(data.total)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Card>

              {/* Tabla de transacciones */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detalle de Transacciones
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Fecha
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Cliente
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Empleado
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Servicios
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Método
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteVentas.transacciones.map((t) => (
                          <tr key={t.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {format(new Date(t.fecha), "dd/MM/yyyy HH:mm", {
                                locale: es,
                              })}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {t.cliente}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {t.empleado}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {t.servicios}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  t.metodoPago === "EFECTIVO"
                                    ? "success"
                                    : "info"
                                }
                              >
                                {t.metodoPago}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                              {formatCurrency(t.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* VENTAS POR EMPLEADO */}
          {reporteActivo === "ventas-empleado" && reporteVentasPorEmpleado && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Desempeño por Empleado
                </h3>
                <div className="space-y-4">
                  {reporteVentasPorEmpleado.empleados.map((empleado, index) => (
                    <div
                      key={empleado.empleadoId}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {empleado.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                              {empleado.cantidadVentas} ventas realizadas
                            </p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(empleado.totalVentas)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(empleado.servicios).map(
                          ([servicio, cantidad]) => (
                            <Badge key={servicio} variant="default">
                              {servicio}: {cantidad}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* VENTAS POR SERVICIO */}
          {reporteActivo === "ventas-servicio" && reporteVentasPorServicio && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Análisis por Servicio
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          #
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                          Servicio
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Cantidad
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Total
                        </th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                          Promedio
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reporteVentasPorServicio.servicios.map(
                        (servicio, index) => (
                          <tr
                            key={servicio.servicioId}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {index + 1}
                            </td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">
                              {servicio.nombre}
                            </td>
                            <td className="py-3 px-4 text-sm text-right text-gray-900">
                              {servicio.cantidadVendida}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                              {formatCurrency(servicio.totalGenerado)}
                            </td>
                            <td className="py-3 px-4 text-sm text-right text-gray-600">
                              {formatCurrency(
                                servicio.totalGenerado /
                                  servicio.cantidadVendida
                              )}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          )}

          {/* REPORTE DE CITAS */}
          {reporteActivo === "citas" && reporteCitas && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Total Citas</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteCitas.resumen.totalCitas}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Completadas</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {reporteCitas.resumen.porEstado.COMPLETADA || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reporteCitas.resumen.tasaCompletadas.toFixed(1)}%
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Canceladas</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {reporteCitas.resumen.porEstado.CANCELADA || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reporteCitas.resumen.tasaCancelacion.toFixed(1)}%
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Pendientes</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(reporteCitas.resumen.porEstado.PENDIENTE || 0) +
                      (reporteCitas.resumen.porEstado.CONFIRMADA || 0)}
                  </p>
                </Card>
              </div>

              {/* Ocupación por empleado */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ocupación por Empleado
                  </h3>
                  <div className="space-y-3">
                    {reporteCitas.ocupacionPorEmpleado.map((empleado) => (
                      <div
                        key={empleado.empleadoId}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">
                            {empleado.nombre}
                          </p>
                          <span className="text-lg font-bold text-gray-900">
                            {empleado.totalCitas} citas
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">
                            ✓ {empleado.completadas} completadas
                          </span>
                          <span className="text-red-600">
                            ✗ {empleado.canceladas} canceladas
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* REPORTE FINANCIERO */}
          {reporteActivo === "financiero" && reporteFinanciero && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Ingresos</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reporteFinanciero.resumen.totalIngresos)}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Egresos</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(reporteFinanciero.resumen.totalEgresos)}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Utilidad</h3>
                  <p
                    className={`text-2xl font-bold ${
                      reporteFinanciero.resumen.utilidad >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(reporteFinanciero.resumen.utilidad)}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Margen</h3>
                  <p
                    className={`text-2xl font-bold ${
                      reporteFinanciero.resumen.margenUtilidad >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {reporteFinanciero.resumen.margenUtilidad.toFixed(1)}%
                  </p>
                </Card>
              </div>

              {/* Ingresos por método */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Ingresos por Método de Pago
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(reporteFinanciero.ingresosPorMetodo).map(
                        ([metodo, total]) => (
                          <div
                            key={metodo}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-900">
                              {metodo}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(total)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Egresos por Categoría
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(
                        reporteFinanciero.egresosPorCategoria
                      ).map(([categoria, total]) => (
                        <div
                          key={categoria}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-900">
                            {categoria}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {/* REPORTE DE CLIENTES */}
          {reporteActivo === "clientes" && reporteClientes && (
            <div className="space-y-6">
              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Clientes Nuevos
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteClientes.resumen.clientesNuevos}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Clientes Activos
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteClientes.resumen.clientesActivos}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Ticket Promedio
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reporteClientes.resumen.ticketPromedio)}
                  </p>
                </Card>
              </div>

              {/* Top clientes y frecuentes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top 10 Clientes por Gasto
                    </h3>
                    <div className="space-y-3">
                      {reporteClientes.topClientes.map((cliente, index) => (
                        <div
                          key={cliente.clienteId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {cliente.nombre}
                              </p>
                              <p className="text-sm text-gray-500">
                                {cliente.cantidadCompras} compras
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(cliente.totalGastado)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Clientes Más Frecuentes
                    </h3>
                    <div className="space-y-3">
                      {reporteClientes.clientesFrecuentes.map(
                        (cliente, index) => (
                          <div
                            key={cliente.clienteId}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                {index + 1}
                              </span>
                              <p className="font-medium text-gray-900">
                                {cliente.nombre}
                              </p>
                            </div>
                            <Badge variant="info">
                              {cliente.visitas} visitas
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportesPage;
