import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchCupTypes, getCupType, deleteCupType } from '../../api/cupType.api';
import CupTypeModal from './CupTypeModal';
import { classNames } from '../../constants/classNames';
import { t } from '../../utils/translations';
import CupTypesHeader from './components/CupTypesHeader';
import CupTypesLoadingState from './components/CupTypesLoadingState';
import CupTypesTable from './components/CupTypesTable';

const CupTypes = () => {
  const [cupTypes, setCupTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCupType, setEditingCupType] = useState(null);

  useEffect(() => {
    loadCupTypes();
  }, []);

  const loadCupTypes = async () => {
    try {
      setLoading(true);
      const data = await fetchCupTypes();
      setCupTypes(data);
    } catch (error) {
      console.error('Error loading cup types:', error);
      toast.error('Failed to load cup types');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (cupTypeId) => {
    try {
      const cupType = await getCupType(cupTypeId);
      setEditingCupType(cupType);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching cup type for edit:', error);
      toast.error('Failed to load cup type');
    }
  };

  const handleDelete = async (cupTypeId) => {
    const cupType = cupTypes.find(ct => ct.label_id === cupTypeId);
    const cupTypeLabel = cupType?.label || 'this cup type';

    if (!window.confirm(`Are you sure you want to delete cup type "${cupTypeLabel}"?`)) {
      return;
    }

    try {
      await deleteCupType(cupTypeId);
      toast.success(`Cup type "${cupTypeLabel}" deleted successfully`);
      loadCupTypes();
    } catch (error) {
      console.error('Error deleting cup type:', error);
      const errorMessage = error.message || 'Failed to delete cup type';
      if (error.status === 409) {
        toast.error(errorMessage + '. Please remove all related records first.');
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const filteredCupTypes = cupTypes.filter((cupType) =>
    cupType &&
    (
      (cupType.label && cupType.label.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cupType.design_name && cupType.design_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cupType.type && cupType.type.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <div className={classNames.spacing.section}>
      <CupTypesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {loading ? (
        <CupTypesLoadingState />
      ) : (
        <CupTypesTable
          cupTypes={filteredCupTypes}
          searchTerm={searchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <CupTypeModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadCupTypes}
        mode="add"
      />

      <CupTypeModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCupType(null);
        }}
        onSuccess={loadCupTypes}
        mode="edit"
        initialData={editingCupType}
      />
    </div>
  );
};

export default CupTypes;

