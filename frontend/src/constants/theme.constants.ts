export interface ThemeConfig {
    id: string;
    name: string;
    description: string;
    mode: 'light' | 'dark';
    colors: {
        // Backgrounds
        background: {
            primary: string;
            secondary: string;
            elevated: string;
            card: string;
        };
        // Brand Colors
        brand: {
            primary: string;
            primaryHover: string;
            accent: string;
            accentHover: string;
        };
        // Text
        text: {
            primary: string;
            secondary: string;
            muted: string;
            inverse: string;
        };
        // Borders
        border: {
            subtle: string;
            default: string;
            strong: string;
        };
        // Semantic
        semantic: {
            success: string;
            warning: string;
            danger: string;
            info: string;
        };
        // Charts
        chart: {
            primary: string;
            secondary: string;
            grid: string;
            tooltip: {
                background: string;
                text: string;
            };
        };
    };
    // Typography
    typography: {
        fontFamily: {
            primary: string;
            secondary: string;
        };
        fontSize: {
            xs: string;
            sm: string;
            base: string;
            lg: string;
            xl: string;
            '2xl': string;
            '3xl': string;
            kpi: string;
        };
        fontWeight: {
            normal: number;
            medium: number;
            semibold: number;
            bold: number;
        };
    };
    // Spacing & Layout
    spacing: {
        borderRadius: {
            sm: string;
            md: string;
            lg: string;
            xl: string;
            card: string;
        };
        shadow: {
            sm: string;
            md: string;
            lg: string;
            card: string;
        };
        padding: {
            card: string;
            section: string;
        };
    };
    // Transitions
    transitions: {
        default: string;
        fast: string;
        slow: string;
    };
}

// Deep Forest Theme - Premium Dark Theme
export const DEEP_FOREST_THEME: ThemeConfig = {
    id: 'deep-forest',
    name: 'Deep Forest',
    description: 'Premium dark theme with deep green-black backgrounds',
    mode: 'dark',
    colors: {
        background: {
            primary: '#0F1E17',
            secondary: '#162922',
            elevated: '#1C332A',
            card: '#162922',
        },
        brand: {
            primary: '#2ECC71',
            primaryHover: '#27AE60',
            accent: '#F39C12',
            accentHover: '#E67E22',
        },
        text: {
            primary: '#E8F5E9',
            secondary: '#B2C9BE',
            muted: '#7C9B8C',
            inverse: '#FFFFFF',
        },
        border: {
            subtle: 'rgba(255, 255, 255, 0.06)',
            default: 'rgba(255, 255, 255, 0.1)',
            strong: 'rgba(255, 255, 255, 0.2)',
        },
        semantic: {
            success: '#2ECC71',
            warning: '#F5B041',
            danger: '#E74C3C',
            info: '#3498DB',
        },
        chart: {
            primary: '#2ECC71',
            secondary: '#F39C12',
            grid: 'rgba(255, 255, 255, 0.06)',
            tooltip: {
                background: '#1C332A',
                text: '#E8F5E9',
            },
        },
    },
    typography: {
        fontFamily: {
            primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            secondary: "'Plus Jakarta Sans', 'Inter', sans-serif",
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            kpi: '2rem',
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
    spacing: {
        borderRadius: {
            sm: '0.375rem',
            md: '0.5rem',
            lg: '0.75rem',
            xl: '1rem',
            card: '0.75rem',
        },
        shadow: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            card: '0 4px 12px rgba(0, 0, 0, 0.4)',
        },
        padding: {
            card: '1.5rem',
            section: '2rem',
        },
    },
    transitions: {
        default: '200ms ease-in-out',
        fast: '100ms ease-in-out',
        slow: '300ms ease-in-out',
    },
};

// Green Primary Theme - Professional Light/Dark
export const GREEN_PRIMARY_LIGHT: ThemeConfig = {
    id: 'green-primary-light',
    name: 'Green Primary (Light)',
    description: 'Professional light theme with green primary and orange accent',
    mode: 'light',
    colors: {
        background: {
            primary: '#F8FAF9',
            secondary: '#F1F5F3',
            elevated: '#FFFFFF',
            card: '#FFFFFF',
        },
        brand: {
            primary: '#166534',
            primaryHover: '#14532D',
            accent: '#F97316',
            accentHover: '#EA580C',
        },
        text: {
            primary: '#0F172A',
            secondary: '#334155',
            muted: '#64748B',
            inverse: '#FFFFFF',
        },
        border: {
            subtle: 'rgba(0, 0, 0, 0.05)',
            default: 'rgba(0, 0, 0, 0.1)',
            strong: 'rgba(0, 0, 0, 0.2)',
        },
        semantic: {
            success: '#166534',
            warning: '#F97316',
            danger: '#DC2626',
            info: '#0284C7',
        },
        chart: {
            primary: '#166534',
            secondary: '#F97316',
            grid: 'rgba(0, 0, 0, 0.08)',
            tooltip: {
                background: '#FFFFFF',
                text: '#0F172A',
            },
        },
    },
    typography: {
        fontFamily: {
            primary: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            secondary: "'Inter', sans-serif",
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            kpi: '1.875rem',
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
    spacing: {
        borderRadius: {
            sm: '0.25rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
            card: '0.5rem',
        },
        shadow: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        },
        padding: {
            card: '1.5rem',
            section: '2rem',
        },
    },
    transitions: {
        default: '200ms ease-in-out',
        fast: '100ms ease-in-out',
        slow: '300ms ease-in-out',
    },
};

export const GREEN_PRIMARY_DARK: ThemeConfig = {
    id: 'green-primary-dark',
    name: 'Green Primary (Dark)',
    description: 'Professional dark theme with green primary and orange accent',
    mode: 'dark',
    colors: {
        background: {
            primary: '#0F172A',
            secondary: '#1E293B',
            elevated: '#334155',
            card: '#1E293B',
        },
        brand: {
            primary: '#22C55E',
            primaryHover: '#16A34A',
            accent: '#F97316',
            accentHover: '#EA580C',
        },
        text: {
            primary: '#F8FAFC',
            secondary: '#CBD5E1',
            muted: '#94A3B8',
            inverse: '#FFFFFF',
        },
        border: {
            subtle: 'rgba(255, 255, 255, 0.05)',
            default: 'rgba(255, 255, 255, 0.1)',
            strong: 'rgba(255, 255, 255, 0.2)',
        },
        semantic: {
            success: '#22C55E',
            warning: '#F97316',
            danger: '#EF4444',
            info: '#0EA5E9',
        },
        chart: {
            primary: '#22C55E',
            secondary: '#F97316',
            grid: 'rgba(255, 255, 255, 0.06)',
            tooltip: {
                background: '#334155',
                text: '#F8FAFC',
            },
        },
    },
    typography: {
        fontFamily: {
            primary: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
            secondary: "'Inter', sans-serif",
        },
        fontSize: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            kpi: '1.875rem',
        },
        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },
    spacing: {
        borderRadius: {
            sm: '0.25rem',
            md: '0.375rem',
            lg: '0.5rem',
            xl: '0.75rem',
            card: '0.5rem',
        },
        shadow: {
            sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
            md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
            lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
            card: '0 4px 12px rgba(0, 0, 0, 0.3)',
        },
        padding: {
            card: '1.5rem',
            section: '2rem',
        },
    },
    transitions: {
        default: '200ms ease-in-out',
        fast: '100ms ease-in-out',
        slow: '300ms ease-in-out',
    },
};

// Available themes
export const THEMES: ThemeConfig[] = [
    GREEN_PRIMARY_LIGHT,
    GREEN_PRIMARY_DARK,
    DEEP_FOREST_THEME,
];

// Helper to get theme by ID
export const getThemeById = (id: string): ThemeConfig | undefined => {
    return THEMES.find(theme => theme.id === id);
};

// Default theme
export const DEFAULT_THEME = GREEN_PRIMARY_LIGHT;
