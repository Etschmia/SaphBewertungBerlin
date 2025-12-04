import React from 'react';
import { Class } from '../types';
import { XMarkIcon, ArrowDownTrayIcon, ArrowUpTrayIcon } from './Icons';

interface SaveOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    classes: Class[];
    onSave: (target: 'all' | 'none' | string) => void;
}

export const SaveOptionsModal: React.FC<SaveOptionsModalProps> = ({
    isOpen,
    onClose,
    classes,
    onSave,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Speichern</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <XMarkIcon />
                    </button>
                </div>
                <div className="p-4 space-y-2">
                    <p className="text-slate-600 dark:text-gray-300 mb-4">Was möchten Sie speichern?</p>

                    <button
                        onClick={() => onSave('all')}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-left transition-colors"
                    >
                        <ArrowDownTrayIcon />
                        <div>
                            <div className="font-medium dark:text-gray-200">Alle Klassen</div>
                            <div className="text-sm text-slate-500 dark:text-gray-400">Speichert alle Schüler und Klassen in einer Datei (Neues Format)</div>
                        </div>
                    </button>

                    <div className="border-t border-slate-100 dark:border-gray-700 my-2"></div>

                    <button
                        onClick={() => onSave('none')}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                    >
                        Ohne Klasse (Schüler ohne Zuordnung)
                    </button>

                    {classes.map(cls => (
                        <button
                            key={cls.id}
                            onClick={() => onSave(cls.id)}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                        >
                            {cls.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

interface LoadOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    classes: Class[];
    onLoad: (target: 'all' | 'none' | string) => void;
}

export const LoadOptionsModal: React.FC<LoadOptionsModalProps> = ({
    isOpen,
    onClose,
    classes,
    onLoad,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Laden</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <XMarkIcon />
                    </button>
                </div>
                <div className="p-4 space-y-2">
                    <p className="text-slate-600 dark:text-gray-300 mb-4">Wohin möchten Sie die Daten laden?</p>

                    <button
                        onClick={() => onLoad('all')}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-left transition-colors"
                    >
                        <ArrowUpTrayIcon />
                        <div>
                            <div className="font-medium dark:text-gray-200">Alle Klassen (Backup wiederherstellen)</div>
                            <div className="text-sm text-slate-500 dark:text-gray-400">Überschreibt alle aktuellen Daten mit der Datei</div>
                        </div>
                    </button>

                    <div className="border-t border-slate-100 dark:border-gray-700 my-2"></div>

                    <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider px-3">In eine Klasse laden</p>

                    <button
                        onClick={() => onLoad('none')}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                    >
                        Ohne Klasse (Zu "Ohne Zuordnung" hinzufügen)
                    </button>

                    {classes.map(cls => (
                        <button
                            key={cls.id}
                            onClick={() => onLoad(cls.id)}
                            className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                        >
                            {cls.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
