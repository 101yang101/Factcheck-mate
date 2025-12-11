import React from 'react';
import { AppConfig } from '../types';

interface SidebarProps {
  config: AppConfig;
  setConfig: React.Dispatch<React.SetStateAction<AppConfig>>;
}

const Sidebar: React.FC<SidebarProps> = ({ config, setConfig }) => {
  const handleChange = (key: keyof AppConfig, value: string) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="w-80 bg-slate-900 text-slate-100 flex-shrink-0 flex flex-col h-screen overflow-y-auto border-r border-slate-800 shadow-xl z-20">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h1 className="text-xl font-bold tracking-tight">FactCheck Mate</h1>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              LLM Provider (Required)
            </h2>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Gemini API Key</label>
              <input
                type="password"
                value={config.geminiApiKey}
                onChange={(e) => handleChange('geminiApiKey', e.target.value)}
                placeholder="Enter AI Studio Key"
                className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-500"
              />
              <p className="text-xs text-slate-500">
                Used for Extraction & Verification via Google Search Grounding.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Optional Tools
            </h2>
            
            <div className="space-y-4">
              <div className="space-y-2 opacity-75">
                <label className="block text-sm font-medium text-slate-300">Serper / Search API</label>
                <input
                  type="password"
                  value={config.searchApiKey || ''}
                  onChange={(e) => handleChange('searchApiKey', e.target.value)}
                  placeholder="Optional (Simulated)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="space-y-2 opacity-75">
                <label className="block text-sm font-medium text-slate-300">Semantic Scholar API</label>
                <input
                  type="password"
                  value={config.scholarApiKey || ''}
                  onChange={(e) => handleChange('scholarApiKey', e.target.value)}
                  placeholder="Optional (Simulated)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <p className="text-xs text-yellow-500/80 mt-2">
                * Note: This demo primarily uses Gemini's native Search Grounding for all verification types to simplify setup.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-slate-800">
        <div className="text-xs text-slate-500 text-center">
          &copy; 2024 FactCheck Mate. <br/> Powered by Google Gemini.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;