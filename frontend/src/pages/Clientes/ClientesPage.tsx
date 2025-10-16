import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useClientesStore } from '@stores/clientesStore';
import { clientesService } from '@services/clientes.service';
import { Cliente, CreateClienteDTO } from '@/types/cliente.types';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { ClientesTable } from '@components/tables/ClientesTable';
import { ClienteForm } from '@components/forms/ClienteForm';

export const ClientesPage: React.FC = () => {
  const { clientes, loading, fetchClientes, searchTerm, setSearchTerm } = useClientesStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleCreate = () => {
    setEditingCliente(null);
    setIsModalOpen(true);
  };

  const handleEdit = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setIsModalOpen(true);
  };

  const handleView = (cliente: Cliente) => {
    // Navegación al detalle (implementaremos después)
    console.log('Ver detalle:', cliente);
    alert('Funcionalidad de detalle próximamente');
  };

  const handleDelete = async (cliente: Cliente) => {
    if (!confirm(`¿Estás seguro de desactivar a ${cliente.nombre}?`)) return;

    try {
      await clientesService.delete(cliente.id);
      fetchClientes(searchTerm);
      alert('Cliente desactivado exitosamente');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al desactivar cliente');
    }
  };

  const handleSubmit = async (data: CreateClienteDTO) => {
    setIsSubmitting(true);
    try {
      if (editingCliente) {
        await clientesService.update(editingCliente.id, data);
        alert('Cliente actualizado exitosamente');
      } else {
        await clientesService.create(data);
        alert('Cliente creado exitosamente');
      }
      setIsModalOpen(false);
      setEditingCliente(null);
      fetchClientes(searchTerm);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar cliente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <p className="text-gray-600 mt-1">
          Gestiona la información de tus clientes
        </p>
      </div>

      {/* Toolbar */}
      <Card className="mb-6">
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <Input
                type="text"
                placeholder="Buscar por nombre, teléfono o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={20} />
            Nuevo Cliente
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando clientes...</p>
          </div>
        ) : (
          <ClientesTable
            clientes={clientes}
            onView={handleView}
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
          setEditingCliente(null);
        }}
        title={editingCliente ? 'Editar Cliente' : 'Nuevo Cliente'}
      >
        <ClienteForm
          initialData={editingCliente ? {
            nombre: editingCliente.nombre,
            telefono: editingCliente.telefono,
            email: editingCliente.email || '',
            notas: editingCliente.notas || '',
          } : undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingCliente(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>
    </div>
  );
};