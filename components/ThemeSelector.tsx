import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, SunIcon, MoonIcon } from './Icons';

interface ColorTheme {
  id: string;
  name: string;
}

interface CompleteTheme {
  id: string;
  name: string;
}

interface ThemeState {
  isDark: boolean;
  colorTheme: string;
  completeTheme: string | null;
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

const completeThemes: CompleteTheme[] = [
  {
    id: 'neon',
    name: 'Neon'
  },
  {
    id: 'sunset',
    name: 'Sunset'
  },
  {
    id: 'ocean',
    name: 'Ocean'
  },
  {
    id: 'forest',
    name: 'Forest'
  },
  {
    id: 'midnight',
    name: 'Midnight'
  }
];

const ThemeSelector: React.FC = () => {
  const [isColorThemeOpen, setIsColorThemeOpen] = useState(false);
  const [isCompleteThemeOpen, setIsCompleteThemeOpen] = useState(false);
  const [themeState, setThemeState] = useState<ThemeState>({
    isDark: false,
    colorTheme: 'blue',
    completeTheme: null
  });
  const colorThemeRef = useRef<HTMLDivElement>(null);
  const completeThemeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load theme from localStorage on component mount - ONLY ONCE
    const savedIsDark = localStorage.getItem('zeugnis-assistent-dark-mode');
    const savedColorTheme = localStorage.getItem('zeugnis-assistent-color-theme');
    const savedCompleteTheme = localStorage.getItem('zeugnis-assistent-complete-theme');
    
    const initialState: ThemeState = {
      isDark: savedIsDark === 'true',
      colorTheme: savedColorTheme || 'blue',
      completeTheme: savedCompleteTheme || null
    };
    
    setThemeState(initialState);
    applyThemeWithoutEvent(initialState); // Don't trigger event on initial load
  }, []); // Empty dependency array - only run once!

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorThemeRef.current && !colorThemeRef.current.contains(event.target as Node)) {
        setIsColorThemeOpen(false);
      }
      if (completeThemeRef.current && !completeThemeRef.current.contains(event.target as Node)) {
        setIsCompleteThemeOpen(false);
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
    html.classList.remove('dark', 'theme-emerald', 'theme-purple', 'theme-rose', 'theme-neon', 'theme-sunset', 'theme-ocean', 'theme-forest', 'theme-midnight');
    
    if (themeState.completeTheme) {
      // Complete theme overrides everything
      html.classList.add(`theme-${themeState.completeTheme}`);
      if (themeState.isDark) {
        html.classList.add('dark');
        body.className = 'bg-gray-900 text-white';
      } else {
        body.className = 'bg-slate-100 text-gray-900';
      }
      console.log(`Applied complete theme: ${themeState.completeTheme}`);
    } else {
      // Standard color theme logic
      if (themeState.isDark) {
        html.classList.add('dark');
        body.className = 'bg-gray-900 text-white';
        console.log('Applied dark mode');
      } else {
        html.classList.remove('dark');
        body.className = 'bg-slate-100 text-gray-900';
        console.log('Applied light mode');
      }
      
      // Add color theme class (except for default blue)
      if (themeState.colorTheme !== 'blue') {
        html.classList.add(`theme-${themeState.colorTheme}`);
        console.log(`Applied theme-${themeState.colorTheme} class`);
      }
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

  const handleDarkModeToggle = () => {
    const newThemeState = { ...themeState, isDark: !themeState.isDark };
    setThemeState(newThemeState);
    applyTheme(newThemeState);
    localStorage.setItem('zeugnis-assistent-dark-mode', newThemeState.isDark.toString());
  };

  const handleColorThemeChange = (colorTheme: string) => {
    const newThemeState = { ...themeState, colorTheme, completeTheme: null };
    setThemeState(newThemeState);
    applyTheme(newThemeState);
    localStorage.setItem('zeugnis-assistent-color-theme', colorTheme);
    localStorage.removeItem('zeugnis-assistent-complete-theme');
    setIsColorThemeOpen(false);
  };

  const handleCompleteThemeChange = (completeTheme: string) => {
    const newThemeState = { ...themeState, completeTheme: completeTheme || null };
    setThemeState(newThemeState);
    applyTheme(newThemeState);
    if (completeTheme) {
      localStorage.setItem('zeugnis-assistent-complete-theme', completeTheme);
    } else {
      localStorage.removeItem('zeugnis-assistent-complete-theme');
    }
    setIsCompleteThemeOpen(false);
  };

  return (
    <div className="flex gap-1">
      {/* Dark Mode Toggle - Kompakt */}
      <button
        onClick={handleDarkModeToggle}
        className="flex items-center justify-center w-10 h-10 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        title={themeState.isDark ? 'Zu Hell wechseln' : 'Zu Dunkel wechseln'}
      >
        {themeState.isDark ? (
          <MoonIcon className="w-5 h-5" />
        ) : (
          <SunIcon className="w-5 h-5" />
        )}
      </button>

      {/* Color Theme Selector - Klein */}
      <div className="relative" ref={colorThemeRef}>
        <button
          onClick={() => setIsColorThemeOpen(!isColorThemeOpen)}
          className="flex items-center gap-1 bg-slate-200 text-slate-700 text-sm py-2 px-3 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          title="Farbtheme auswählen"
        >
          <div className={`w-3 h-3 rounded-full ${getThemePreviewColor(themeState.colorTheme)}`}></div>
          <ChevronDownIcon className="w-3 h-3" />
        </button>

        {isColorThemeOpen && (
          <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 dark:bg-gray-800 dark:border-gray-600">
            {colorThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleColorThemeChange(theme.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-slate-50 transition-colors dark:hover:bg-gray-700 ${
                  themeState.colorTheme === theme.id 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-slate-700 dark:text-gray-200'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${getThemePreviewColor(theme.id)}`}></div>
                {theme.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Complete Theme Selector - Klein */}
      <div className="relative" ref={completeThemeRef}>
        <button
          onClick={() => setIsCompleteThemeOpen(!isCompleteThemeOpen)}
          className="flex items-center gap-1 bg-slate-200 text-slate-700 text-sm py-2 px-3 rounded-lg hover:bg-slate-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          title="Komplettes Theme auswählen"
        >
          <div className={`w-3 h-3 rounded-full ${getCompleteThemePreviewColor(themeState.completeTheme)}`}></div>
          <ChevronDownIcon className="w-3 h-3" />
        </button>

        {isCompleteThemeOpen && (
          <div className="absolute right-0 mt-2 w-28 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 dark:bg-gray-800 dark:border-gray-600">
            <button
              onClick={() => handleCompleteThemeChange('')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-slate-50 transition-colors dark:hover:bg-gray-700 ${
                !themeState.completeTheme 
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-slate-700 dark:text-gray-200'
              }`}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
              Standard
            </button>
            {completeThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleCompleteThemeChange(theme.id)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 text-sm text-left hover:bg-slate-50 transition-colors dark:hover:bg-gray-700 ${
                  themeState.completeTheme === theme.id 
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-slate-700 dark:text-gray-200'
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full ${getCompleteThemePreviewColor(theme.id)}`}></div>
                {theme.name}
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

const getCompleteThemePreviewColor = (themeId: string | null): string => {
  switch (themeId) {
    case 'neon':
      return 'bg-cyan-400';
    case 'sunset':
      return 'bg-orange-500';
    case 'ocean':
      return 'bg-teal-500';
    case 'forest':
      return 'bg-green-600';
    case 'midnight':
      return 'bg-indigo-800';
    default:
      return 'bg-gray-400';
  }
};

export default ThemeSelector;