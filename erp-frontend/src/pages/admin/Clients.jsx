import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchClients, getClient, deleteClient } from '../../api/client.api';
import ClientModal from './ClientModal';
import { classNames } from '../../constants/classNames';
import { t } from '../../utils/translations';
import ClientsHeader from './components/ClientsHeader';
import ClientsLoadingState from './components/ClientsLoadingState';
import ClientsTable from './components/ClientsTable';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await fetchClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error(t('clients.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (clientId) => {
    try {
      const client = await getClient(clientId);
      setEditingClient(client);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching client for edit:', error);
      toast.error(t('clients.editError'));
    }
  };

  const handleDelete = async (clientId) => {
    const client = clients.find(c => c.client_id === clientId);
    const clientName = client?.name || 'this client';

    if (!window.confirm(t('clients.delete.confirm', { name: clientName }))) {
      return;
    }

    try {
      await deleteClient(clientId);
      toast.success(t('clients.delete.success', { name: clientName }));
      loadClients();
    } catch (error) {
      console.error('Error deleting client:', error);
      const errorMessage = error.message || t('clients.delete.error');
      if (error.status === 409) {
        toast.error(errorMessage + ' ' + t('clients.delete.errorRelated'));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const filteredClients = clients.filter((client) =>
    client &&
    (
      (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <div className={classNames.spacing.section}>
      <ClientsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {loading ? (
        <ClientsLoadingState />
      ) : (
        <ClientsTable
          clients={filteredClients}
          searchTerm={searchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ClientModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadClients}
        mode="add"
      />

      <ClientModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingClient(null);
        }}
        onSuccess={loadClients}
        mode="edit"
        initialData={editingClient}
      />
    </div>
  );
};

export default Clients;

