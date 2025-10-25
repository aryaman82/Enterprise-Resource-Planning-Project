
import React, { useState, useEffect } from 'react';
import { addShift, getAllShifts, deleteShift } from '../../../api/shift.api';
import { X, Plus, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import ShiftList from './ShiftList';
import ShiftForm from './ShiftForm';
import { formatTime, getShiftColors } from './shiftUtils';
import { createDeleteShiftToast } from './DeleteShiftToast';


const EditShiftMasterModal = ({ isOpen, onClose }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const [formData, setFormData] = useState({
    shiftCode: '',
    shiftName: '',
    startTime: '',
    endTime: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shifts, setShifts] = useState([]);
  const [fetchingShifts, setFetchingShifts] = useState(false);

  // Fetch shifts when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchShifts();
    }
  }, [isOpen]);

  const fetchShifts = async () => {
    setFetchingShifts(true);
    try {
      const response = await getAllShifts();
      setShifts(response.shifts || []);
    } catch (err) {
      console.error('Error fetching shifts:', err);
      toast.error('Failed to load shifts');
    } finally {
      setFetchingShifts(false);
    }
  };

  if (!isOpen) return null;

  const handleEditShift = (shiftId) => {
    console.log(`Edit shift: ${shiftId}`);
    // This will be implemented later
  };

  const handleDeleteShift = (shift) => {
    const shiftCode = shift.shift_code;
    const shiftName = shift.shift_name;
    
    createDeleteShiftToast(shiftName, () => confirmDeleteShift(shiftCode, shiftName));
  };

  const confirmDeleteShift = async (shiftCode, shiftName) => {
    try {
      // Show loading toast
      const loadingToast = toast.loading('Deleting shift...');
      
      await deleteShift(shiftCode);
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`"${shiftName}" has been deleted successfully`, {
        icon: '🗑️',
        duration: 3000,
      });
      
      // Refresh the shifts list
      await fetchShifts();
    } catch (err) {
      console.error('Error deleting shift:', err);
      toast.error('Failed to delete shift. Please try again.');
    }
  };

  const handleAddNewShift = () => {
    setShowAddForm(true);
  };

  const handleBackToList = () => {
    setShowAddForm(false);
    setFormData({
      shiftCode: '',
      shiftName: '',
      startTime: '',
      endTime: ''
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };



  const handleSaveShift = async () => {
    setLoading(true);
    setError('');
    try {
      await addShift(formData);
      toast.success(`Shift "${formData.shiftName}" has been added successfully`, {
        icon: '🕒',
      });
      handleBackToList();
      // Refresh the shifts list
      await fetchShifts();
    } catch (err) {
      console.error('Error adding shift:', err);
      
      // Handle specific error types
      if (err.message.includes('already exists') || err.message.includes('DUPLICATE')) {
        toast.error(`Shift code '${formData.shiftCode}' is already taken. Please use a different code.`);
      } else if (err.message.includes('MISSING_REQUIRED_FIELDS')) {
        toast.error('Please fill in all required fields.');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        toast.error('Network error. Please check your internet connection and try again.');
      } else {
        toast.error(err.message || 'Failed to add shift. Please try again.');
      }
      
      setError(err.message || 'Failed to add shift');
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
      // Reset form when closing
      setShowAddForm(false);
      setFormData({
        shiftCode: '',
        shiftName: '',
        startTime: '',
        endTime: ''
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleBackdropClick}
      ></div>
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              {showAddForm && (
                <button
                  onClick={handleBackToList}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-gray-400" />
                </button>
              )}
              <h3 className="text-lg font-semibold text-gray-900">
                {showAddForm ? 'Add New Shift' : 'Shift Master'}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex-1 overflow-y-auto">
            {error && (
              <div className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</div>
            )}
            {!showAddForm ? (
                <>
                  <ShiftList
                    shifts={shifts}
                    fetchingShifts={fetchingShifts}
                    getShiftColors={getShiftColors}
                    formatTime={formatTime}
                    onEdit={handleEditShift}
                    onDelete={handleDeleteShift}
                  />
                  <div className="mt-6">
                    <button
                      onClick={handleAddNewShift}
                      className="w-full flex items-center justify-center space-x-2 p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors group"
                    >
                      <Plus className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                      <span className="text-gray-600 group-hover:text-blue-600 font-medium">
                        Add New Shift
                      </span>
                    </button>
                  </div>
                </>
            ) : (
              <ShiftForm
                formData={formData}
                onInputChange={handleInputChange}
                onSubmit={handleSaveShift}
                loading={loading}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 flex-shrink-0">
            {!showAddForm ? (
              // Shift List Footer
              <>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </>
            ) : (
              // Add Form Footer
              <>
                <button
                  onClick={handleBackToList}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveShift}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={loading || !formData.shiftCode || !formData.shiftName || !formData.startTime || !formData.endTime}
                >
                  {loading ? 'Adding...' : 'Add Shift'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditShiftMasterModal;
