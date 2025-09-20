import React from 'react';
import { XIcon, RefreshIcon, InfoIcon } from './Icons';

interface UpdateInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'success' | 'fail' | 'unchanged';
  buildInfo?: any;
}

const UpdateInfoModal: React.FC<UpdateInfoModalProps> = ({ 
  isOpen, 
  onClose, 
  status, 
  buildInfo 
}) => {
  if (!isOpen) return null;

  const getStatusInfo = () => {
    switch (status) {
      case 'success':
        return {
          title: 'Update erfolgreich',
          message: 'Auf neue Version installiert',
          icon: <RefreshIcon className="w-8 h-8 text-green-600" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'unchanged':
        return {
          title: 'Keine Updates verfügbar',
          message: 'Sie verwenden bereits die neueste Version',
          icon: <InfoIcon className="w-8 h-8 text-blue-600" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'fail':
      default:
        return {
          title: 'Update fehlgeschlagen',
          message: 'Server nicht erreichbar',
          icon: <InfoIcon className="w-8 h-8 text-red-600" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800">Update Status</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className={`${statusInfo.bgColor} ${statusInfo.borderColor} border rounded-lg p-4 flex items-center gap-4`}>
            {statusInfo.icon}
            <div>
              <h3 className="font-semibold text-slate-800 mb-1">{statusInfo.title}</h3>
              <p className="text-sm text-slate-600">{statusInfo.message}</p>
              {buildInfo?.message && (
                <p className="text-xs text-slate-500 mt-2">{buildInfo.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateInfoModal;