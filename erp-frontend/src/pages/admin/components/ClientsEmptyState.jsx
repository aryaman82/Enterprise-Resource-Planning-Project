import React from 'react';
import { classNames } from '../../../constants/classNames';
import { t } from '../../../utils/translations';

const ClientsEmptyState = ({ searchTerm }) => {
  return (
    <tr>
      <td colSpan="4" className={classNames.empty}>
        {searchTerm
          ? t('clients.emptySearch')
          : t('clients.empty')}
      </td>
    </tr>
  );
};

export default ClientsEmptyState;

