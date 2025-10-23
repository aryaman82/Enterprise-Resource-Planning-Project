import React from 'react';

const ShiftForm = ({ formData, onInputChange, onSubmit, loading }) => (
  <div className="space-y-6">
    {/* Shift Code */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Shift Code <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={formData.shiftCode}
        onChange={e => onInputChange('shiftCode', e.target.value.toUpperCase())}
        placeholder="e.g., M, A, N, E, OFF"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        maxLength={6}
      />
    </div>
    {/* Shift Name */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Shift Name <span className="text-red-500">*</span>
      </label>
      <input
        type="text"
        value={formData.shiftName}
        onChange={e => onInputChange('shiftName', e.target.value)}
        placeholder="e.g., Morning Shift, Evening Shift, Off/Leave"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
    {/* Start Time */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Start Time <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 right-0 top-0 flex items-center pr-3.5 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd"/>
          </svg>
        </div>
        <input
          type="time"
          value={formData.startTime}
          onChange={e => onInputChange('startTime', e.target.value)}
          className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          required={formData.shiftCode !== 'OFF'}
          disabled={formData.shiftCode === 'OFF'}
        />
      </div>
    </div>
    {/* End Time */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        End Time <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 right-0 top-0 flex items-center pr-3.5 pointer-events-none">
          <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
            <path fillRule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm11-4a1 1 0 1 0-2 0v4a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V8Z" clipRule="evenodd"/>
          </svg>
        </div>
        <input
          type="time"
          value={formData.endTime}
          onChange={e => onInputChange('endTime', e.target.value)}
          className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          required={formData.shiftCode !== 'OFF'}
          disabled={formData.shiftCode === 'OFF'}
        />
      </div>
    </div>
  </div>
);

export default ShiftForm;
