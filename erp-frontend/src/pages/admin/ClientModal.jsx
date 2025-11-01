import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { addClient, updateClient } from '../../api/client.api';
import { classNames } from '../../constants/classNames';
import { colors } from '../../constants/colors';
import { t } from '../../utils/translations';

const ClientModal = ({ open, onClose, onSuccess, mode = 'add', initialData = null }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && initialData) {
        setFormData({
          name: initialData.name || '',
          email: initialData.email || '',
          phone: initialData.phone || '',
        });
      } else {
        setFormData({
          name: '',
          email: '',
          phone: '',
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
      toast.error(t('clientModal.fields.name.required'));
      return;
    }

    try {
      setLoading(true);

      if (mode === 'edit') {
        await updateClient(initialData.client_id, formData);
        toast.success(t('clientModal.messages.updateSuccess', { name: formData.name }));
      } else {
        await addClient(formData);
        toast.success(t('clientModal.messages.addSuccess', { name: formData.name }));
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} client:`, error);
      const errorKey = mode === 'edit' ? 'clientModal.messages.updateError' : 'clientModal.messages.addError';
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
                {mode === 'edit' ? t('clientModal.title.edit') : t('clientModal.title.add')}
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
              {/* Client Name */}
              <div>
                <label className={classNames.label}>
                  {t('clientModal.fields.name.label')} <span className={colors.text.red.required}>{t('common.required')}</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={classNames.input}
                  required
                  disabled={loading}
                  placeholder={t('clientModal.fields.name.placeholder')}
                />
              </div>

              {/* Email */}
              <div>
                <label className={classNames.label}>
                  {t('clientModal.fields.email.label')}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={classNames.input}
                  disabled={loading}
                  placeholder={t('clientModal.fields.email.placeholder')}
                />
              </div>

              {/* Phone */}
              <div>
                <label className={classNames.label}>
                  {t('clientModal.fields.phone.label')}
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={classNames.input}
                  disabled={loading}
                  placeholder={t('clientModal.fields.phone.placeholder')}
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
                  {t('clientModal.buttons.cancel')}
                </button>
                <button
                  type="submit"
                  className={`${classNames.button.primary} flex items-center`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {mode === 'edit' ? t('clientModal.buttons.updating') : t('clientModal.buttons.adding')}
                    </>
                  ) : (
                    mode === 'edit' ? t('clientModal.buttons.update') : t('clientModal.buttons.add')
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

export default ClientModal;

