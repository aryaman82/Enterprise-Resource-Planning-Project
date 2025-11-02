import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { classNames } from '../../../constants/classNames';
import { colors } from '../../../constants/colors';
import { t } from '../../../utils/translations';

const ClientTableRow = ({ client, onEdit, onDelete }) => {
  return (
    <tr className={classNames.table.row}>
      <td className={classNames.table.cell}>
        <div className={`text-sm font-medium ${colors.text.primary}`}>{client.name}</div>
        <div className={`text-sm ${colors.text.tertiary}`}>{t('clients.columns.id')}: {client.client_id}</div>
      </td>
      <td className={`${classNames.table.cell} ${colors.text.primary}`}>
        {client.email || t('common.notAvailable')}
      </td>
      <td className={`${classNames.table.cell} ${colors.text.primary}`}>
        {client.phone || t('common.notAvailable')}
      </td>
      <td className={`${classNames.table.cell} text-sm font-medium`}>
        <div className={classNames.spacing.buttonGroup}>
          <button
            onClick={() => onEdit(client.client_id)}
            className={classNames.button.iconEdit}
            title={t('clients.actions.edit')}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(client.client_id)}
            className={classNames.button.iconDelete}
            title={t('clients.actions.delete')}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ClientTableRow;

