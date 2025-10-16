import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useServiciosStore } from '@stores/serviciosStore';
import { serviciosService } from '@services/servicios.service';
import { Servicio, CreateServicioDTO } from '@/types/servicio.types';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { ServiciosTable } from '@components/tables/ServiciosTable';
import { ServicioForm } from '@components/forms/ServicioForm';

export const ServiciosPage: React.FC = () => {
  const { servicios, loading, fetchServicios } = useServiciosStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingServicio, setEditingServicio] = useState<Servicio | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchServicios();
  }, []);

  const handleCreate = () => {
    setEditingServicio(null);
    setIsModalOpen(true);
  };

  const handleEdit = (servicio: Servicio) => {
    setEditingServicio(servicio);
    setIsModalOpen(true);
  };

  const handleDelete = async (servicio: Servicio) => {
    if (!confirm(`¿Estás seguro de eliminar "${servicio.nombre}"?`)) return;

    try {
      await serviciosService.delete(servicio.id);
      fetchServicios();
      alert('Servicio eliminado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar servicio');
    }
  };

  const handleSubmit = async (data: CreateServicioDTO) => {
    setIsSubmitting(true);
    try {
      if (editingServicio) {
        await serviciosService.update(editingServicio.id, data);
        alert('Servicio actualizado exitosamente');
      } else {
        await serviciosService.create(data);
        alert('Servicio creado exitosamente');
      }
      setIsModalOpen(false);
      setEditingServicio(null);
      fetchServicios();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar servicio');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
        <p className="text-gray-600 mt-1">
          Gestiona los servicios que ofrece tu barbería
        </p>
        </div>

      {/* Toolbar */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total de servicios: <span className="font-semibold">{servicios.length}</span>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={20} />
            Nuevo Servicio
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando servicios...</p>
          </div>
        ) : (
          <ServiciosTable
            servicios={servicios}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingServicio(null);
        }}
        title={editingServicio ? 'Editar Servicio' : 'Nuevo Servicio'}
      >
        <ServicioForm
          initialData={editingServicio ? {
            nombre: editingServicio.nombre,
            descripcion: editingServicio.descripcion || '',
            precio: editingServicio.precio,
            duracionMinutos: editingServicio.duracionMinutos,
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingServicio(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};