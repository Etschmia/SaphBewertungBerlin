import React from 'react';
import { XIcon } from './Icons';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  version: string;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, version }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Über diese App</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-slate-800 mb-2">
              Bewertungs-Assistent Saph Berlin
            </h3>
            <p className="text-sm text-slate-600 mb-4">Version {version}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Datenschutz:</strong> Alle Ihre Daten verbleiben lokal in Ihrem Browser. 
              Es erfolgt keinerlei Upload oder Übertragung von Daten an externe Server.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-slate-700 mb-1">Homepage:</h4>
              <a 
                href="https://github.com/Etschmia/SaphBewertungBerlin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                github.com/Etschmia/SaphBewertungBerlin
              </a>
            </div>

            <div>
              <h4 className="font-semibold text-slate-700 mb-2">Unterstützung:</h4>
              <p className="text-sm text-slate-600 mb-2">
                Wenn Ihnen diese App hilft, können Sie mich gerne unterstützen:
              </p>
              <a 
                href="https://paypal.me/Etschmia" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                💙 PayPal Unterstützung
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 text-center">
              Copyright © 2025, Tobias Brendler<br />
              All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;