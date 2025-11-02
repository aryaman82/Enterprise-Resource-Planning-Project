import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addCupType, updateCupType } from '../../api/cupType.api';
import { fetchDesigns } from '../../api/design.api';
import { classNames } from '../../constants/classNames';
import { colors } from '../../constants/colors';
import CustomDropdown from '../orders/components/CustomDropdown';

const CupTypeModal = ({ open, onClose, onSuccess, mode = 'add', initialData = null }) => {
  const [formData, setFormData] = useState({
    label_id: '',
    label: '',
    diameter: '',
    volume: '',
    type: '',
    design_id: '',
  });
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDesigns, setLoadingDesigns] = useState(false);

  useEffect(() => {
    if (open) {
      loadDesigns();
      if (mode === 'edit' && initialData) {
        setFormData({
          label_id: initialData.label_id || '',
          label: initialData.label || '',
          diameter: initialData.diameter || '',
          volume: initialData.volume || '',
          type: initialData.type || '',
          design_id: initialData.design_id || '',
        });
      } else {
        setFormData({
          label_id: '',
          label: '',
          diameter: '',
          volume: '',
          type: '',
          design_id: '',
        });
      }
    }
  }, [open, mode, initialData]);

  const loadDesigns = async () => {
    setLoadingDesigns(true);
    try {
      const data = await fetchDesigns();
      setDesigns(data);
    } catch (error) {
      console.error('Error loading designs:', error);
      toast.error('Failed to load designs');
    } finally {
      setLoadingDesigns(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.label_id || formData.label_id.trim() === '') {
      toast.error('Label ID is required');
      return;
    }

    if (!formData.label || formData.label.trim() === '') {
      toast.error('Label is required');
      return;
    }

    if (!formData.diameter || parseFloat(formData.diameter) <= 0) {
      toast.error('Diameter must be a positive number');
      return;
    }

    if (!formData.volume || parseFloat(formData.volume) <= 0) {
      toast.error('Volume must be a positive number');
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        ...formData,
        diameter: parseFloat(formData.diameter),
        volume: parseFloat(formData.volume),
        design_id: formData.design_id || null,
      };

      if (mode === 'edit') {
        // For edit, don't include label_id in the update (it's the identifier)
        // eslint-disable-next-line no-unused-vars
        const { label_id, ...updateData } = submitData;
        await updateCupType(initialData.label_id, updateData);
        toast.success(`Cup type "${formData.label}" updated successfully`);
      } else {
        await addCupType(submitData);
        toast.success(`Cup type "${formData.label}" added successfully`);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} cup type:`, error);
      toast.error(error.message || `Failed to ${mode === 'edit' ? 'update' : 'create'} cup type`);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={classNames.modal.overlay}>
      <div className={classNames.modal.container}>
        <div
          className={classNames.modal.backdrop}
          onClick={onClose}
        />

        <div className={classNames.modal.dialog}>
          <div className={classNames.modal.content}>
            <div className={classNames.modal.header}>
              <h3 className={classNames.modal.title}>
                {mode === 'edit' ? 'Edit Cup Type' : 'Add New Cup Type'}
              </h3>
              <button
                onClick={onClose}
                className={classNames.button.iconClose}
                disabled={loading}
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label ID - Only for add mode */}
              {mode === 'add' && (
                <div>
                  <label className={classNames.label}>
                    Label ID <span className={colors.text.red.required}>*</span>
                  </label>
                  <input
                    type="text"
                    name="label_id"
                    value={formData.label_id}
                    onChange={handleInputChange}
                    className={classNames.input}
                    required
                    disabled={loading || mode === 'edit'}
                    placeholder="e.g., CUP-001"
                  />
                  <p className={`mt-1 text-xs ${colors.text.tertiary}`}>
                    Unique identifier for this cup type
                  </p>
                </div>
              )}

              {/* Label */}
              <div>
                <label className={classNames.label}>
                  Label <span className={colors.text.red.required}>*</span>
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  className={classNames.input}
                  required
                  disabled={loading}
                  placeholder="e.g., Standard 16oz Cup"
                />
              </div>

              {/* Design Selection */}
              <div>
                <label className={classNames.label}>
                  Design
                </label>
                {loadingDesigns ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Loading designs...</span>
                  </div>
                ) : (
                  <CustomDropdown
                    name="design_id"
                    value={formData.design_id}
                    onChange={handleInputChange}
                    options={[
                      { value: '', label: 'Select a design (optional)' },
                      ...designs.map(design => ({
                        value: design.design_id.toString(),
                        label: design.name
                      }))
                    ]}
                    placeholder="Select a design (optional)"
                    disabled={loading}
                  />
                )}
              </div>

              {/* Diameter and Volume */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={classNames.label}>
                    Diameter (cm) <span className={colors.text.red.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="diameter"
                    value={formData.diameter}
                    onChange={handleInputChange}
                    className={classNames.input}
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className={classNames.label}>
                    Volume (ml) <span className={colors.text.red.required}>*</span>
                  </label>
                  <input
                    type="number"
                    name="volume"
                    value={formData.volume}
                    onChange={handleInputChange}
                    className={classNames.input}
                    required
                    min="0"
                    step="0.01"
                    disabled={loading}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <p className={`text-xs ${colors.text.tertiary} -mt-2`}>
                Weight will be automatically calculated from diameter and volume
              </p>

              {/* Type */}
              <div>
                <label className={classNames.label}>
                  Cup Type
                </label>
                <input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className={classNames.input}
                  disabled={loading}
                  placeholder="e.g., Disposable, Reusable"
                />
              </div>

              {/* Buttons */}
              <div className={classNames.spacing.formActions}>
                <button
                  type="button"
                  onClick={onClose}
                  className={classNames.button.secondary}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`${classNames.button.primary} flex items-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {mode === 'edit' ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    mode === 'edit' ? 'Update Cup Type' : 'Add Cup Type'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CupTypeModal;

