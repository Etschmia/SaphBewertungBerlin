import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

interface Theme {
  id: string;
  name: string;
  isDark: boolean;
}

const themes: Theme[] = [
  {
    id: 'light',
    name: 'Hell',
    isDark: false
  },
  {
    id: 'dark',
    name: 'Dunkel',
    isDark: true
  }
];

const ThemeSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themes[0]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load theme from localStorage on component mount - ONLY ONCE
    const savedThemeId = localStorage.getItem('zeugnis-assistent-theme');
    
    if (savedThemeId) {
      const savedTheme = themes.find(theme => theme.id === savedThemeId);
      if (savedTheme) {
        setCurrentTheme(savedTheme);
        applyThemeWithoutEvent(savedTheme); // Don't trigger event on initial load
      } else {
        // If saved theme not found, apply default
        applyThemeWithoutEvent(themes[0]);
      }
    } else {
      // No saved theme, apply default (light)
      applyThemeWithoutEvent(themes[0]);
    }
  }, []); // Empty dependency array - only run once!

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

  const applyThemeWithoutEvent = (theme: Theme) => {
    const html = document.documentElement;
    const body = document.body;
    
    console.log('Applying theme:', theme.name, 'isDark:', theme.isDark);
    console.log('Before - HTML classes:', html.className);
    console.log('Before - Body classes:', body.className);
    
    if (theme.isDark) {
      // Dark mode
      html.classList.add('dark');
      body.className = 'bg-gray-900 text-white';
      console.log('Applied dark mode');
    } else {
      // Light mode
      html.classList.remove('dark');
      body.className = 'bg-slate-100 text-gray-900';
      console.log('Applied light mode');
    }
    
    console.log('After - HTML classes:', html.className);
    console.log('After - Body classes:', body.className);
  };

  const applyTheme = (theme: Theme) => {
    applyThemeWithoutEvent(theme);
    // Force a re-render by triggering a custom event
    console.log('Dispatching themeChanged event with theme:', theme);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('zeugnis-assistent-theme', theme.id);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        title="Theme auswählen"
      >
        <div className={`w-4 h-4 rounded-full ${getThemePreviewColor(currentTheme.id)}`}></div>
        Theme
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 dark:bg-gray-800 dark:border-gray-600">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 transition-colors dark:hover:bg-gray-700 ${
                currentTheme.id === theme.id 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-slate-700 dark:text-gray-200'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${getThemePreviewColor(theme.id)}`}></div>
              {theme.name}
              {currentTheme.id === theme.id && (
                <span className="ml-auto text-blue-500 dark:text-blue-400">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const getThemePreviewColor = (themeId: string): string => {
  switch (themeId) {
    case 'light':
      return 'bg-blue-500';
    case 'dark':
      return 'bg-gray-800';
    default:
      return 'bg-blue-500';
  }
};

export default ThemeSelector;