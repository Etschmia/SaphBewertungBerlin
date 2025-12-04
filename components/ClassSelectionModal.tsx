import React, { useState } from 'react';
import { Class } from '../../types';
import { XMarkIcon, PlusIcon, UserGroupIcon } from './Icons';

interface ClassSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    classes: Class[];
    currentClassId: string | null;
    onSwitchClass: (classId: string | null) => void;
    onCreateClass: (name: string, withCurrentStudents: boolean) => void;
}

const ClassSelectionModal: React.FC<ClassSelectionModalProps> = ({
    isOpen,
    onClose,
    classes,
    currentClassId,
    onSwitchClass,
    onCreateClass,
}) => {
    const [newClassName, setNewClassName] = useState('');
    const [mode, setMode] = useState<'list' | 'create_empty' | 'create_current'>('list');

    if (!isOpen) return null;

    const handleCreate = (withCurrentStudents: boolean) => {
        if (newClassName.trim()) {
            onCreateClass(newClassName.trim(), withCurrentStudents);
            setNewClassName('');
            setMode('list');
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Klassen verwalten</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200">
                        <XMarkIcon />
                    </button>
                </div>

                <div className="p-4">
                    {mode === 'list' && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-slate-700 dark:text-gray-200">Neue Klasse erstellen</h3>
                                <button
                                    onClick={() => setMode('create_current')}
                                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-left transition-colors"
                                >
                                    <UserGroupIcon />
                                    <div>
                                        <div className="font-medium dark:text-gray-200">Aktuelle Schülerliste als neue Klasse erfassen</div>
                                        <div className="text-sm text-slate-500 dark:text-gray-400">Erstellt eine Klasse mit den aktuell angezeigten Schülern</div>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setMode('create_empty')}
                                    className="w-full flex items-center gap-2 p-3 rounded-lg border border-slate-200 dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700 text-left transition-colors"
                                >
                                    <PlusIcon />
                                    <div>
                                        <div className="font-medium dark:text-gray-200">Neue Klasse anlegen mit leerer Schülerliste</div>
                                        <div className="text-sm text-slate-500 dark:text-gray-400">Startet eine leere Klasse</div>
                                    </div>
                                </button>
                            </div>

                            {classes.length > 0 && (
                                <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-gray-700">
                                    <h3 className="font-semibold text-slate-700 dark:text-gray-200">Zur Klasse wechseln</h3>
                                    <div className="max-h-60 overflow-y-auto space-y-1">
                                        <button
                                            onClick={() => { onSwitchClass(null); onClose(); }}
                                            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${currentClassId === null
                                                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'hover:bg-slate-100 dark:hover:bg-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            Ohne Zuordnung
                                        </button>
                                        {classes.map((cls) => (
                                            <button
                                                key={cls.id}
                                                onClick={() => { onSwitchClass(cls.id); onClose(); }}
                                                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${currentClassId === cls.id
                                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                                                        : 'hover:bg-slate-100 dark:hover:bg-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                {cls.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {(mode === 'create_current' || mode === 'create_empty') && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">
                                    Name der Klasse
                                </label>
                                <input
                                    type="text"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    placeholder="z.B. Klasse 1a"
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => { setMode('list'); setNewClassName(''); }}
                                    className="px-4 py-2 text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    Zurück
                                </button>
                                <button
                                    onClick={() => handleCreate(mode === 'create_current')}
                                    disabled={!newClassName.trim()}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Klasse erstellen
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClassSelectionModal;
