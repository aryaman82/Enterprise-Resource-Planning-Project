import React from 'react';
import { classNames } from '../../../constants/classNames';
import { colors } from '../../../constants/colors';
import { t } from '../../../utils/translations';
import ClientTableRow from './ClientTableRow';
import ClientsEmptyState from './ClientsEmptyState';

const ClientsTable = ({ clients, searchTerm, onEdit, onDelete }) => {
  return (
    <div className={classNames.table.container}>
      <div className={classNames.cardHeader}>
        <h3 className={`text-lg font-medium ${colors.text.primary}`}>
          {t('clients.count', { count: clients.length })}
        </h3>
      </div>
      <div className={classNames.table.wrapper}>
        <table className={classNames.table.base}>
          <thead className={classNames.table.header}>
            <tr>
              <th className={classNames.table.headerCell}>
                {t('clients.columns.name')}
              </th>
              <th className={classNames.table.headerCell}>
                {t('clients.columns.email')}
              </th>
              <th className={classNames.table.headerCell}>
                {t('clients.columns.phone')}
              </th>
              <th className={classNames.table.headerCell}>
                {t('clients.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className={classNames.table.body}>
            {clients.length > 0 ? (
              clients.map((client) => (
                <ClientTableRow
                  key={client.client_id}
                  client={client}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <ClientsEmptyState searchTerm={searchTerm} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsTable;

