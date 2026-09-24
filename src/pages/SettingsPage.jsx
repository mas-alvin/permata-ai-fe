import { useState } from 'react';
import ApiKeyManager from '../components/Settings/ApiKeyManager';
import KnowledgeBasePanel from '../components/Rag/KnowledgeBasePanel';

const TABS = [
  { id: 'api-keys', label: 'API Keys' },
  { id: 'knowledge-base', label: 'Knowledge Base' },
];

/**
 * Settings page with tabbed sections. Currently exposes the API Keys
 * management tab.
 */
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('api-keys');

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
        {/* Page header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-on-surface tracking-tight">Settings</h1>
          <p className="text-sm text-on-surface-variant/80 mt-1">
            Kelola preferensi akun dan integrasi Anda.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 mb-8 rounded-md bg-surface-container-low/70 border border-on-surface/8 overflow-x-auto hide-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-surface text-on-surface shadow-sm font-semibold'
                  : 'text-on-surface-variant/70 hover:text-on-surface'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'api-keys' && <ApiKeyManager />}
        {activeTab === 'knowledge-base' && <KnowledgeBasePanel />}
      </div>
    </div>
  );
}
