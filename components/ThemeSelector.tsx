import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './Icons';

interface ColorTheme {
  id: string;
  name: string;
}

interface ThemeState {
  isDark: boolean;
  colorTheme: string;
}

const colorThemes: ColorTheme[] = [
  {
    id: 'blue',
    name: 'Blau'
  },
  {
    id: 'emerald',
    name: 'Smaragd'
  },
  {
    id: 'purple',
    name: 'Lila'
  },
  {
    id: 'rose',
    name: 'Rosa'
  }
];

const ThemeSelector: React.FC = () => {
  const [isDarkModeOpen, setIsDarkModeOpen] = useState(false);
  const [isColorThemeOpen, setIsColorThemeOpen] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({
    isDark: false,
    colorTheme: 'blue'
  });
  const darkModeRef = useRef<HTMLDivElement>(null);
  const colorThemeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load theme from localStorage on component mount - ONLY ONCE
    const savedIsDark = localStorage.getItem('zeugnis-assistent-dark-mode');
    const savedColorTheme = localStorage.getItem('zeugnis-assistent-color-theme');
    
    const initialState: ThemeState = {
      isDark: savedIsDark === 'true',
      colorTheme: savedColorTheme || 'blue'
    };
    
    setThemeState(initialState);
    applyThemeWithoutEvent(initialState); // Don't trigger event on initial load
  }, []); // Empty dependency array - only run once!

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (darkModeRef.current && !darkModeRef.current.contains(event.target as Node)) {
        setIsDarkModeOpen(false);
      }
      if (colorThemeRef.current && !colorThemeRef.current.contains(event.target as Node)) {
        setIsColorThemeOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const applyThemeWithoutEvent = (themeState: ThemeState) => {
    const html = document.documentElement;
    const body = document.body;
    
    console.log('Applying theme:', themeState);
    console.log('Before - HTML classes:', html.className);
    console.log('Before - Body classes:', body.className);
    
    // Remove all existing theme classes
    html.classList.remove('dark', 'theme-emerald', 'theme-purple', 'theme-rose');
    
    if (themeState.isDark) {
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
    
    // Add color theme class (except for default blue)
    if (themeState.colorTheme !== 'blue') {
      html.classList.add(`theme-${themeState.colorTheme}`);
      console.log(`Applied theme-${themeState.colorTheme} class`);
    }
    
    console.log('After - HTML classes:', html.className);
    console.log('After - Body classes:', body.className);
  };

  const applyTheme = (themeState: ThemeState) => {
    applyThemeWithoutEvent(themeState);
    // Force a re-render by triggering a custom event
    console.log('Dispatching themeChanged event with theme:', themeState);
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: themeState }));
  };

  const handleDarkModeChange = (isDark: boolean) => {
    const newThemeState = { ...themeState, isDark };
    setThemeState(newThemeState);
    applyTheme(newThemeState);
    localStorage.setItem('zeugnis-assistent-dark-mode', isDark.toString());
    setIsDarkModeOpen(false);
  };

  const handleColorThemeChange = (colorTheme: string) => {
    const newThemeState = { ...themeState, colorTheme };
    setThemeState(newThemeState);
    applyTheme(newThemeState);
    localStorage.setItem('zeugnis-assistent-color-theme', colorTheme);
    setIsColorThemeOpen(false);
  };

  return (
    <div className="flex gap-2">
      {/* Dark Mode Toggle */}
      <div className="relative" ref={darkModeRef}>
        <button
          onClick={() => setIsDarkModeOpen(!isDarkModeOpen)}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          title="Hell/Dunkel Modus"
        >
          <div className={`w-4 h-4 rounded-full ${themeState.isDark ? 'bg-gray-800' : 'bg-yellow-400'}`}></div>
          {themeState.isDark ? 'Dunkel' : 'Hell'}
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isDarkModeOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDarkModeOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 dark:bg-gray-800 dark:border-gray-600">
            <button
              onClick={() => handleDarkModeChange(false)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 transition-colors dark:hover:bg-gray-700 ${
                !themeState.isDark 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-slate-700 dark:text-gray-200'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              Hell
              {!themeState.isDark && (
                <span className="ml-auto text-blue-500 dark:text-blue-400">✓</span>
              )}
            </button>
            <button
              onClick={() => handleDarkModeChange(true)}
              className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 transition-colors dark:hover:bg-gray-700 ${
                themeState.isDark 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-slate-700 dark:text-gray-200'
              }`}
            >
              <div className="w-3 h-3 rounded-full bg-gray-800"></div>
              Dunkel
              {themeState.isDark && (
                <span className="ml-auto text-blue-500 dark:text-blue-400">✓</span>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Color Theme Selector */}
      <div className="relative" ref={colorThemeRef}>
        <button
          onClick={() => setIsColorThemeOpen(!isColorThemeOpen)}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          title="Farbtheme auswählen"
        >
          <div className={`w-4 h-4 rounded-full ${getThemePreviewColor(themeState.colorTheme)}`}></div>
          {colorThemes.find(theme => theme.id === themeState.colorTheme)?.name}
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isColorThemeOpen ? 'rotate-180' : ''}`} />
        </button>

        {isColorThemeOpen && (
          <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 dark:bg-gray-800 dark:border-gray-600">
            {colorThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleColorThemeChange(theme.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-slate-50 transition-colors dark:hover:bg-gray-700 ${
                  themeState.colorTheme === theme.id 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-slate-700 dark:text-gray-200'
                }`}
              >
                <div className={`w-3 h-3 rounded-full ${getThemePreviewColor(theme.id)}`}></div>
                {theme.name}
                {themeState.colorTheme === theme.id && (
                  <span className="ml-auto text-blue-500 dark:text-blue-400">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const getThemePreviewColor = (themeId: string): string => {
  switch (themeId) {
    case 'blue':
      return 'bg-blue-500';
    case 'emerald':
      return 'bg-emerald-500';
    case 'purple':
      return 'bg-purple-500';
    case 'rose':
      return 'bg-rose-500';
    default:
      return 'bg-blue-500';
  }
};

export default ThemeSelector;