import React from 'react';
import { Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const createDeleteShiftToast = (shiftName, onConfirm) => {
  return toast((t) => (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center space-x-2">
        <Trash2 className="h-5 w-5 text-red-600" />
        <span className="font-medium text-gray-900">Delete Shift</span>
      </div>
      <p className="text-sm text-gray-600">
        Are you sure you want to delete "{shiftName}"? This action cannot be undone.
      </p>
      <div className="flex space-x-2">
        <button
          className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          onClick={() => toast.dismiss(t.id)}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          onClick={async () => {
            toast.dismiss(t.id);
            await onConfirm();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  ), {
    duration: Infinity,
    style: {
      background: '#fff',
      color: '#000',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '16px',
      minWidth: '300px',
    },
  });
};
