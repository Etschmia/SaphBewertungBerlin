import React, { useState, useRef, useEffect } from 'react';
import { DotsVerticalIcon, RefreshIcon, DownloadIcon, InfoIcon, ChevronDownIcon } from './Icons';

interface ExtrasDropdownProps {
  onUpdate: () => void;
  onInstallApp: () => void;
  onAbout: () => void;
}

const ExtrasDropdown: React.FC<ExtrasDropdownProps> = ({ onUpdate, onInstallApp, onAbout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
        title="Extras"
      >
        <DotsVerticalIcon />
        Extras
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          <button
            onClick={() => handleMenuClick(onUpdate)}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshIcon className="w-4 h-4" />
            Update
          </button>
          <button
            onClick={() => handleMenuClick(onInstallApp)}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <DownloadIcon className="w-4 h-4" />
            Install App
          </button>
          <hr className="my-1 border-slate-200" />
          <button
            onClick={() => handleMenuClick(onAbout)}
            className="w-full flex items-center gap-3 px-4 py-2 text-left text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <InfoIcon className="w-4 h-4" />
            Über diese App
          </button>
        </div>
      )}
    </div>
  );
};

export default ExtrasDropdown;