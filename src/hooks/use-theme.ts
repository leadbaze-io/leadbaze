import { useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

export const useTheme = () => {

  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {

    // Verificar se há tema salvo no localStorage

    const savedTheme = localStorage.getItem('theme') as Theme;

    if (savedTheme) {

      setTheme(savedTheme);

    } else {

      // Verificar preferência do sistema

      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

      setTheme(prefersDark ? 'dark' : 'light');

    }

  }, []);

  useEffect(() => {

    // Aplicar tema ao documento

    document.documentElement.classList.remove('light', 'dark');

    document.documentElement.classList.add(theme);

    localStorage.setItem('theme', theme);

  }, [theme]);

  const toggleTheme = () => {

    setTheme(prev => prev === 'light' ? 'dark' : 'light');

  };

  return {

    theme,

    setTheme,

    toggleTheme

  };

};
