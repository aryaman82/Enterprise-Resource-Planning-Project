import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { fetchDesigns, getDesign, deleteDesign } from '../../api/design.api';
import DesignModal from './DesignModal';
import { classNames } from '../../constants/classNames';
import { t } from '../../utils/translations';
import DesignsHeader from './components/DesignsHeader';
import DesignsLoadingState from './components/DesignsLoadingState';
import DesignsTable from './components/DesignsTable';

const Designs = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDesign, setEditingDesign] = useState(null);

  useEffect(() => {
    loadDesigns();
  }, []);

  const loadDesigns = async () => {
    try {
      setLoading(true);
      const data = await fetchDesigns();
      setDesigns(data);
    } catch (error) {
      console.error('Error loading designs:', error);
      toast.error(t('designs.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (designId) => {
    try {
      const design = await getDesign(designId);
      setEditingDesign(design);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching design for edit:', error);
      toast.error(t('designs.editError'));
    }
  };

  const handleDelete = async (designId) => {
    const design = designs.find(d => d.design_id === designId);
    const designName = design?.name || 'this design';

    if (!window.confirm(t('designs.delete.confirm', { name: designName }))) {
      return;
    }

    try {
      await deleteDesign(designId);
      toast.success(t('designs.delete.success', { name: designName }));
      loadDesigns();
    } catch (error) {
      console.error('Error deleting design:', error);
      const errorMessage = error.message || t('designs.delete.error');
      if (error.status === 409) {
        toast.error(errorMessage + ' ' + t('designs.delete.errorRelated'));
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const filteredDesigns = designs.filter((design) =>
    design &&
    (
      (design.name && design.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (design.remarks && design.remarks.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  );

  return (
    <div className={classNames.spacing.section}>
      <DesignsHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => setIsAddModalOpen(true)}
      />

      {loading ? (
        <DesignsLoadingState />
      ) : (
        <DesignsTable
          designs={filteredDesigns}
          searchTerm={searchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <DesignModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={loadDesigns}
        mode="add"
      />

      <DesignModal
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingDesign(null);
        }}
        onSuccess={loadDesigns}
        mode="edit"
        initialData={editingDesign}
      />
    </div>
  );
};

export default Designs;

