import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_THEME, getThemeById, type ThemeConfig } from '../constants/theme.constants';
import { getThemePreference, saveThemePreference } from '../api/settingsApi';

interface ThemeContextType {
    currentTheme: ThemeConfig;
    setTheme: (themeId: string) => void;
    applyTheme: (theme: ThemeConfig) => void;
    mode: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

// Apply theme to CSS custom properties
const applyThemeToCss = (theme: ThemeConfig) => {
    const root = document.documentElement;

    // Colors - Backgrounds
    root.style.setProperty('--bg-primary', theme.colors.background.primary);
    root.style.setProperty('--bg-secondary', theme.colors.background.secondary);
    root.style.setProperty('--bg-elevated', theme.colors.background.elevated);
    root.style.setProperty('--bg-card', theme.colors.background.card);
    root.style.setProperty('--bg-sidebar', theme.mode === 'dark' ? '#0f172a' : '#1e293b');
    root.style.setProperty('--bg-header', theme.mode === 'light' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)');

    // Colors - Brand
    root.style.setProperty('--brand-primary', theme.colors.brand.primary);
    root.style.setProperty('--brand-primary-hover', theme.colors.brand.primaryHover);
    root.style.setProperty('--brand-accent', theme.colors.brand.accent);
    root.style.setProperty('--brand-accent-hover', theme.colors.brand.accentHover);

    // Colors - Text
    root.style.setProperty('--text-primary', theme.colors.text.primary);
    root.style.setProperty('--text-secondary', theme.colors.text.secondary);
    root.style.setProperty('--text-muted', theme.colors.text.muted);
    root.style.setProperty('--text-inverse', theme.colors.text.inverse);

    // Colors - Borders
    root.style.setProperty('--border-subtle', theme.colors.border.subtle);
    root.style.setProperty('--border-default', theme.colors.border.default);
    root.style.setProperty('--border-strong', theme.colors.border.strong);

    // Colors - Semantic
    root.style.setProperty('--color-success', theme.colors.semantic.success);
    root.style.setProperty('--color-warning', theme.colors.semantic.warning);
    root.style.setProperty('--color-danger', theme.colors.semantic.danger);
    root.style.setProperty('--color-info', theme.colors.semantic.info);

    // Colors - Charts
    root.style.setProperty('--chart-primary', theme.colors.chart.primary);
    root.style.setProperty('--chart-secondary', theme.colors.chart.secondary);
    root.style.setProperty('--chart-grid', theme.colors.chart.grid);
    root.style.setProperty('--chart-tooltip-bg', theme.colors.chart.tooltip.background);
    root.style.setProperty('--chart-tooltip-text', theme.colors.chart.tooltip.text);

    // Typography
    root.style.setProperty('--font-primary', theme.typography.fontFamily.primary);
    root.style.setProperty('--font-secondary', theme.typography.fontFamily.secondary);
    root.style.setProperty('--font-size-kpi', theme.typography.fontSize.kpi);

    // Spacing - Border Radius
    root.style.setProperty('--radius-sm', theme.spacing.borderRadius.sm);
    root.style.setProperty('--radius-md', theme.spacing.borderRadius.md);
    root.style.setProperty('--radius-lg', theme.spacing.borderRadius.lg);
    root.style.setProperty('--radius-xl', theme.spacing.borderRadius.xl);
    root.style.setProperty('--radius-card', theme.spacing.borderRadius.card);

    // Spacing - Shadows
    root.style.setProperty('--shadow-sm', theme.spacing.shadow.sm);
    root.style.setProperty('--shadow-md', theme.spacing.shadow.md);
    root.style.setProperty('--shadow-lg', theme.spacing.shadow.lg);
    root.style.setProperty('--shadow-card', theme.spacing.shadow.card);

    // Spacing - Padding
    root.style.setProperty('--padding-card', theme.spacing.padding.card);
    root.style.setProperty('--padding-section', theme.spacing.padding.section);

    // Transitions
    root.style.setProperty('--transition-default', theme.transitions.default);
    root.style.setProperty('--transition-fast', theme.transitions.fast);
    root.style.setProperty('--transition-slow', theme.transitions.slow);

    // Set body class for mode
    document.body.className = `${theme.mode}-theme theme-${theme.id}`;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<ThemeConfig>(DEFAULT_THEME);

    // Load theme from backend on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const savedTheme = await getThemePreference();
                    if (savedTheme && savedTheme.themeId) {
                        const theme = getThemeById(savedTheme.themeId);
                        if (theme) {
                            setCurrentTheme(theme);
                            applyThemeToCss(theme);
                            return;
                        }
                    }
                }
            } catch (error) {
                console.error('Failed to load theme preference:', error);
            }

            // Fallback to localStorage or default
            const savedThemeId = localStorage.getItem('theme-id');
            if (savedThemeId) {
                const theme = getThemeById(savedThemeId);
                if (theme) {
                    setCurrentTheme(theme);
                    applyThemeToCss(theme);
                    return;
                }
            }

            // Apply default theme
            applyThemeToCss(DEFAULT_THEME);
        };

        loadTheme();
    }, []);

    const setTheme = async (themeId: string) => {
        const theme = getThemeById(themeId);
        if (theme) {
            setCurrentTheme(theme);
            applyThemeToCss(theme);
            localStorage.setItem('theme-id', themeId);

            // Save to backend
            try {
                await saveThemePreference({ themeId, themeName: theme.name });
            } catch (error) {
                console.error('Failed to save theme preference:', error);
            }
        }
    };

    const applyTheme = (theme: ThemeConfig) => {
        setCurrentTheme(theme);
        applyThemeToCss(theme);
    };

    const toggleTheme = () => {
        // Toggle between light and dark variants of current theme family
        if (currentTheme.id === 'green-primary-light') {
            setTheme('green-primary-dark');
        } else if (currentTheme.id === 'green-primary-dark') {
            setTheme('green-primary-light');
        } else if (currentTheme.id === 'deep-forest') {
            setTheme('green-primary-light');
        }
    };

    return (
        <ThemeContext.Provider value={{
            currentTheme,
            setTheme,
            applyTheme,
            mode: currentTheme.mode,
            toggleTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
