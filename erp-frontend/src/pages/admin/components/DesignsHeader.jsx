import React from 'react';
import { Search, Plus } from 'lucide-react';
import { classNames } from '../../../constants/classNames';
import { t } from '../../../utils/translations';

const DesignsHeader = ({ searchTerm, onSearchChange, onAddClick }) => {
  return (
    <div className={`${classNames.card} ${classNames.cardPadding}`}>
      <div className={classNames.spacing.flexBetween}>
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className={classNames.search.container}>
            <div className={classNames.search.iconContainer}>
              <Search className={classNames.search.icon} />
            </div>
            <input
              type="text"
              placeholder={t('designs.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className={classNames.inputWithIcon}
            />
          </div>
        </div>

        {/* Add Button */}
        <button
          onClick={onAddClick}
          className={`${classNames.button.primary} inline-flex items-center`}
        >
          <Plus className="h-4 w-4 mr-2" />
          {t('designs.newDesign')}
        </button>
      </div>
    </div>
  );
};

export default DesignsHeader;

