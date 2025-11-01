import React from 'react';
import { Loader2 } from 'lucide-react';
import { classNames } from '../../../constants/classNames';
import { t } from '../../../utils/translations';

const ClientsLoadingState = () => {
  return (
    <div className={classNames.loading.container}>
      <Loader2 className={classNames.loading.spinner} />
      <p className={classNames.loading.text}>{t('clients.loading')}</p>
    </div>
  );
};

export default ClientsLoadingState;

