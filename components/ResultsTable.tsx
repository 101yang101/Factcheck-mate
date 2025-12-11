import React from 'react';
import { Claim, VerificationResult, ClaimType, VerificationStatus } from '../types';

interface ResultsTableProps {
  claims: Claim[];
  results: Record<string, VerificationResult>;
}

const ResultsTable: React.FC<ResultsTableProps> = ({ claims, results }) => {
  if (claims.length === 0) return null;

  const getTypeStyle = (type: ClaimType) => {
    switch (type) {
      case ClaimType.PAPER: return "bg-purple-100 text-purple-700 border-purple-200";
      case ClaimType.DATA: return "bg-cyan-100 text-cyan-700 border-cyan-200";
      case ClaimType.GENERAL: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusStyle = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED_TRUE: return "bg-green-100 text-green-700 border-green-200";
      case VerificationStatus.VERIFIED_FALSE: return "bg-red-100 text-red-700 border-red-200";
      case VerificationStatus.UNCERTAIN: return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-gray-50 text-gray-400 border-gray-100";
    }
  };

  const getStatusIcon = (status: VerificationStatus) => {
    switch (status) {
      case VerificationStatus.VERIFIED_TRUE: return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
      );
      case VerificationStatus.VERIFIED_FALSE: return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
      );
      case VerificationStatus.UNCERTAIN: return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
      );
      default: return (
        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800">Verification Report</h3>
        <span className="text-sm text-slate-500">{claims.length} claims found</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4 w-1/4">Original Claim</th>
              <th className="p-4 w-1/12">Type</th>
              <th className="p-4 w-1/12">Result</th>
              <th className="p-4 w-1/3">Analysis & Reasoning</th>
              <th className="p-4 w-1/6">Sources</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {claims.map((claim) => {
              const result = results[claim.id];
              const status = result?.status || VerificationStatus.PENDING;
              
              return (
                <tr key={claim.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 align-top">
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">"{claim.text}"</p>
                  </td>
                  <td className="p-4 align-top">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeStyle(claim.type)}`}>
                      {claim.type === ClaimType.PAPER ? 'Reference' : claim.type === ClaimType.DATA ? 'Statistic' : 'General'}
                    </span>
                  </td>
                  <td className="p-4 align-top">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(status)}`}>
                      {getStatusIcon(status)}
                      {status}
                    </span>
                  </td>
                  <td className="p-4 align-top">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {result?.reasoning || "Verifying..."}
                    </p>
                  </td>
                  <td className="p-4 align-top">
                    <div className="space-y-2">
                    {result?.sources && result.sources.length > 0 ? (
                      result.sources.map((source, i) => (
                        <a 
                          key={i} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="block text-xs text-blue-600 hover:text-blue-800 hover:underline truncate max-w-[150px]"
                          title={source.title}
                        >
                           🔗 {source.title}
                        </a>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">
                         {status === VerificationStatus.PENDING ? '...' : 'No links found'}
                      </span>
                    )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;