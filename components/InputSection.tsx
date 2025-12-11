import React, { useRef, useState } from 'react';
import { parseFile } from '../services/docParser';

interface InputSectionProps {
  onStart: (text: string) => void;
  isProcessing: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ onStart, isProcessing }) => {
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setFileName(file.name);
      setText("Parsing document...");
      const parsedText = await parseFile(file);
      setText(parsedText);
    } catch (error) {
      console.error(error);
      setText("Error parsing file. Please try extracting text manually.");
      setFileName(null);
    }
  };

  const handleStart = () => {
    if (text.trim()) {
      onStart(text);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Source Material</h2>
        <div className="flex gap-2">
           <button 
            onClick={() => fileInputRef.current?.click()}
            className="text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors flex items-center gap-2"
            disabled={isProcessing}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
            {fileName ? 'Change File' : 'Upload .docx'}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".docx,.txt" 
            className="hidden" 
          />
        </div>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste article text here or upload a document..."
          className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-slate-700 font-mono text-sm leading-relaxed"
          disabled={isProcessing}
        />
        {fileName && (
          <div className="absolute top-2 right-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            {fileName}
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleStart}
          disabled={!text.trim() || isProcessing}
          className={`px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg shadow-blue-500/30 transition-all
            ${!text.trim() || isProcessing 
              ? 'bg-slate-400 cursor-not-allowed shadow-none' 
              : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02]'}`}
        >
          {isProcessing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            <>
              Start Verification
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default InputSection;