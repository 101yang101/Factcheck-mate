import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import InputSection from './components/InputSection';
import ResultsTable from './components/ResultsTable';
import { AppConfig, Claim, ProcessStage, VerificationResult } from './types';
import { extractClaims, verifyClaim } from './services/geminiService';

const App: React.FC = () => {
  const [config, setConfig] = useState<AppConfig>({
    geminiApiKey: '',
    searchApiKey: '',
    scholarApiKey: ''
  });

  const [claims, setClaims] = useState<Claim[]>([]);
  const [results, setResults] = useState<Record<string, VerificationResult>>({});
  const [stage, setStage] = useState<ProcessStage>('IDLE');
  const [error, setError] = useState<string | null>(null);

  const startVerification = async (text: string) => {
    if (!config.geminiApiKey) {
      setError("Please enter your Gemini API Key in the sidebar.");
      return;
    }

    setError(null);
    setStage('EXTRACTING');
    setClaims([]);
    setResults({});

    try {
      // 1. Extraction
      const extractedClaims = await extractClaims(text, config.geminiApiKey);
      if (extractedClaims.length === 0) {
        setError("No verifiable claims found in the text.");
        setStage('IDLE');
        return;
      }
      setClaims(extractedClaims);

      // 2. Verification Routing
      setStage('VERIFYING');
      
      // We process sequentially or in small batches to respect rate limits if needed, 
      // but Promise.all is fine for a demo with small numbers of claims.
      const verificationPromises = extractedClaims.map(async (claim) => {
        try {
          const result = await verifyClaim(claim, config.geminiApiKey);
          setResults(prev => ({
            ...prev,
            [claim.id]: result
          }));
        } catch (err) {
            console.error(`Failed to verify claim ${claim.id}`, err);
             // Fail silently in UI for individual item, or mark as error
        }
      });

      await Promise.all(verificationPromises);
      setStage('COMPLETE');

    } catch (err) {
      console.error(err);
      setError("An error occurred during processing. Please check your API key and try again.");
      setStage('IDLE');
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar config={config} setConfig={setConfig} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">New Fact Check</h2>
            <p className="text-sm text-slate-500">Extract facts and verify sources automatically</p>
          </div>
          <div className="flex items-center gap-4">
             {stage !== 'IDLE' && stage !== 'COMPLETE' && (
                <div className="flex items-center gap-2 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full text-xs font-semibold animate-pulse">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  {stage === 'EXTRACTING' ? 'Extracting Claims via LLM...' : 'Searching & Verifying...'}
                </div>
             )}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
                 <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                 <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <InputSection 
              onStart={startVerification} 
              isProcessing={stage === 'EXTRACTING' || stage === 'VERIFYING'} 
            />

            {(claims.length > 0 || stage === 'COMPLETE') && (
               <ResultsTable claims={claims} results={results} />
            )}
            
            {stage === 'IDLE' && claims.length === 0 && !error && (
              <div className="text-center py-20 opacity-40">
                <div className="mx-auto w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                </div>
                <h3 className="text-lg font-medium text-slate-600">Ready to verify</h3>
                <p className="text-slate-500">Paste text above to begin the fact-checking process.</p>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;