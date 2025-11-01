import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addDesign, updateDesign } from '../../api/design.api';
import { classNames } from '../../constants/classNames';
import { colors } from '../../constants/colors';
import { t } from '../../utils/translations';

const DesignModal = ({ open, onClose, onSuccess, mode = 'add', initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    file_url: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name || '',
          file_url: initialData.file_url || '',
          remarks: initialData.remarks || '',
        });
      } else {
        setFormData({
          name: '',
          file_url: '',
          remarks: '',
        });
      }
    }
  }, [open, mode, initialData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || formData.name.trim() === '') {
      toast.error(t('designModal.fields.name.required'));
      return;
    }

    try {
      setLoading(true);

      if (mode === 'edit') {
        await updateDesign(initialData.design_id, formData);
        toast.success(t('designModal.messages.updateSuccess', { name: formData.name }));
      } else {
        await addDesign(formData);
        toast.success(t('designModal.messages.addSuccess', { name: formData.name }));
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} design:`, error);
      const errorKey = mode === 'edit' ? 'designModal.messages.updateError' : 'designModal.messages.addError';
      toast.error(error.message || t(errorKey));
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className={classNames.modal.overlay}>
      <div className={classNames.modal.container}>
        {/* Backdrop */}
        <div
          className={classNames.modal.backdrop}
          onClick={onClose}
        />

        {/* Modal */}
        <div className={classNames.modal.dialog}>
          <div className={classNames.modal.content}>
            <div className={classNames.modal.header}>
              <h3 className={classNames.modal.title}>
                {mode === 'edit' ? t('designModal.title.edit') : t('designModal.title.add')}
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
              {/* Design Name */}
              <div>
                <label className={classNames.label}>
                  {t('designModal.fields.name.label')} <span className={colors.text.red.required}>{t('common.required')}</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={classNames.input}
                  required
                  disabled={loading}
                  placeholder={t('designModal.fields.name.placeholder')}
                />
              </div>

              {/* File URL */}
              <div>
                <label className={classNames.label}>
                  {t('designModal.fields.fileUrl.label')}
                </label>
                <input
                  type="url"
                  name="file_url"
                  value={formData.file_url}
                  onChange={handleInputChange}
                  className={classNames.input}
                  disabled={loading}
                  placeholder={t('designModal.fields.fileUrl.placeholder')}
                />
                <p className={`mt-1 text-xs ${colors.text.tertiary}`}>{t('designModal.fields.fileUrl.helper')}</p>
              </div>

              {/* Remarks */}
              <div>
                <label className={classNames.label}>
                  {t('designModal.fields.remarks.label')}
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={3}
                  className={`${classNames.input} resize-none`}
                  disabled={loading}
                  placeholder={t('designModal.fields.remarks.placeholder')}
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
                  {t('designModal.buttons.cancel')}
                </button>
                <button
                  type="submit"
                  className={`${classNames.button.primary} flex items-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {mode === 'edit' ? t('designModal.buttons.updating') : t('designModal.buttons.adding')}
                    </>
                  ) : (
                    mode === 'edit' ? t('designModal.buttons.update') : t('designModal.buttons.add')
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

export default DesignModal;

