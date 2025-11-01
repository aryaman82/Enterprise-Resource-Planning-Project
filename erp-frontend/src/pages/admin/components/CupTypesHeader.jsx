import React from 'react';
import { Plus, Search } from 'lucide-react';
import { classNames } from '../../../constants/classNames';
import { colors } from '../../../constants/colors';

const CupTypesHeader = ({ searchTerm, onSearchChange, onAddClick }) => {
  return (
    <div className={classNames.cardHeader}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className={`text-xl font-semibold ${colors.text.primary}`}>
          Cup Types
        </h2>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          {/* Search */}
          <div className="relative flex-1 sm:flex-initial sm:w-64">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${colors.text.tertiary}`} />
            <input
              type="text"
              placeholder="Search cup types..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={`pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${colors.text.primary}`}
            />
          </div>

          {/* Add Button */}
          <button
            onClick={onAddClick}
            className={`${classNames.button.primary} inline-flex items-center`}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Cup Type
          </button>
        </div>
      </div>
    </div>
  );
};

export default CupTypesHeader;

