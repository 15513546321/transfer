
import React, { useState } from 'react';
import { TranslationResult } from '../types';

interface HistoryItemProps {
  item: TranslationResult;
  onCopy: (text: string) => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onCopy }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(item.formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-indigo-300 transition-colors group">
      <div className="flex justify-between items-start mb-2">
        <span className="text-xs text-slate-400 font-mono">
          {new Date(item.timestamp).toLocaleTimeString()}
        </span>
        <button 
          onClick={handleCopy}
          className={`text-xs px-2 py-1 rounded transition-all ${copied ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-600'}`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <div className="space-y-1">
        <div className="text-sm text-slate-600 truncate" title={item.original}>
          {item.original}
        </div>
        <div className="text-lg font-bold text-slate-900 font-mono break-all group-hover:text-indigo-600 transition-colors">
          {item.formatted}
        </div>
      </div>
    </div>
  );
};

export default HistoryItem;
