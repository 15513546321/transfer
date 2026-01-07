
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import HistoryItem from './components/HistoryItem';
import { translateText } from './services/geminiService';
import { formatString } from './utils/formatter';
import { FormatType, TranslationResult } from './types';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formatType, setFormatType] = useState<FormatType>(FormatType.PASCAL_CASE);
  const [history, setHistory] = useState<TranslationResult[]>([]);
  const [lastBatch, setLastBatch] = useState<TranslationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [batchCopied, setBatchCopied] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dev_translate_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history");
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('dev_translate_history', JSON.stringify(history.slice(0, 100)));
  }, [history]);

  const handleTranslate = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setBatchCopied(false);
    
    try {
      // Split input by newlines or commas
      const terms = input.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
      const response = await translateText(terms);
      
      const newResults: TranslationResult[] = response.translations.map(t => ({
        original: t.original,
        translated: t.translated,
        formatted: formatString(t.translated, formatType),
        timestamp: Date.now()
      }));

      setLastBatch(newResults);
      setHistory(prev => [...newResults, ...prev]);
      setInput('');
    } catch (err) {
      setError('Failed to translate. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyBatchToExcel = () => {
    if (lastBatch.length === 0) return;
    
    // Format as Tab Separated Values (TSV) for Excel
    const tsv = lastBatch
      .map(item => `${item.formatted}\t${item.original}`)
      .join('\n');
    
    navigator.clipboard.writeText(tsv);
    setBatchCopied(true);
    setTimeout(() => setBatchCopied(false), 2000);
  };

  const handleCopy = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
  }, []);

  const clearHistory = () => {
    setHistory([]);
    setLastBatch([]);
    localStorage.removeItem('dev_translate_history');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Input & Batch Results Section */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Input Box */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
                    Source Data
                  </label>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setFormatType(FormatType.PASCAL_CASE)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${formatType === FormatType.PASCAL_CASE ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      PascalCase
                    </button>
                    <button
                      onClick={() => setFormatType(FormatType.CAMEL_CASE)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${formatType === FormatType.CAMEL_CASE ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      camelCase
                    </button>
                  </div>
                </div>
                
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Paste your Chinese data here (one per line)... e.g. 总记录数, 返回记录数"
                  className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none text-slate-800 placeholder-slate-400 font-sans resize-none"
                />

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleTranslate}
                  disabled={isLoading || !input.trim()}
                  className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center space-x-2 ${
                    isLoading || !input.trim() 
                      ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Processing Batch...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Translate & Format Batch</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Batch Results View (Excel Pasteable) */}
            {lastBatch.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-indigo-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-5 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="bg-indigo-600 text-white p-1 rounded">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="font-bold text-indigo-900">Current Batch Results</h3>
                  </div>
                  <button
                    onClick={copyBatchToExcel}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                      batchCopied 
                      ? 'bg-green-500 text-white' 
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md active:translate-y-0.5'
                    }`}
                  >
                    {batchCopied ? (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied for Excel!</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                        </svg>
                        <span>Copy All (Excel Format)</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Formatted Identifier</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Original Text</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lastBatch.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-mono text-sm text-indigo-600 font-medium">{item.formatted}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{item.original}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty State / Tips */}
            {!isLoading && history.length === 0 && (
              <div className="p-12 text-center space-y-4 opacity-50">
                <div className="bg-slate-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-600">Enter your data above</h3>
                <p className="max-w-xs mx-auto text-sm text-slate-500">
                  Paste multiple lines of Chinese terms to get English variable names formatted for your code.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar / History Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Translation History
                </h2>
                {history.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-250px)] space-y-4 custom-scrollbar">
                {history.length > 0 ? (
                  history.map((item, idx) => (
                    <HistoryItem 
                      key={`${item.timestamp}-${item.formatted}-${idx}`} 
                      item={item} 
                      onCopy={handleCopy} 
                    />
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 text-sm italic">
                    Your history will appear here
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <footer className="mt-20 border-t border-slate-200 py-10">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} DevTranslate Pro. Built for modern development workflows.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
