import React from 'react';
import { classNames } from '../../../constants/classNames';
import { t } from '../../../utils/translations';

const DesignsEmptyState = ({ searchTerm }) => {
  return (
    <tr>
      <td colSpan="4" className={classNames.empty}>
        {searchTerm
          ? t('designs.emptySearch')
          : t('designs.empty')}
      </td>
    </tr>
  );
};

export default DesignsEmptyState;

