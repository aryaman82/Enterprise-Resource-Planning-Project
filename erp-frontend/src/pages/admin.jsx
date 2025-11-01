import React, { useState } from 'react';
import { User } from 'lucide-react';
import Clients from './admin/Clients';
import Designs from './admin/Designs';
import { classNames } from '../constants/classNames';
import { colors } from '../constants/colors';
import { t } from '../utils/translations';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('clients');

  const tabs = [
    { id: 'clients', name: t('admin.tabs.clients'), component: Clients },
    { id: 'designs', name: t('admin.tabs.designs'), component: Designs },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || Clients;

  return (
    <div className={classNames.pageContainer}>
      {/* Page Header */}
      <div className={classNames.pageHeader}>
        <div className={classNames.pageContent}>
          <div className={classNames.spacing.flexRow}>
            {/* Admin Icon */}
            <div className="flex-shrink-0">
              <div className={`${colors.background.tertiary} p-3 rounded-lg`}>
                <User className={`h-8 w-8 ${colors.text.secondary}`} />
              </div>
            </div>
            
            {/* Page Title and Description */}
            <div>
              <h1 className={`text-3xl font-bold ${colors.text.primary}`}>{t('admin.title')}</h1>
              <p className={`${colors.text.secondary} mt-1`}>{t('admin.description')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={classNames.pageContent}>
        {/* Tabs */}
        <div className={classNames.tab.container}>
          <div className="px-4 sm:px-6 lg:px-8">
            <nav className={classNames.tab.nav} aria-label="Tabs">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={isActive ? classNames.tab.button.active : classNames.tab.button.inactive}
                  >
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className={classNames.tab.content}>
          <ActiveComponent />
        </div>
      </div>
    </div>
  );
};

export default Admin;
