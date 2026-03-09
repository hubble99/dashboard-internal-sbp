export interface ThemeTokens {
    // Background colors
    bgMain: string;
    bgCard: string;
    bgSidebar: string;
    bgHeader: string;

    // Text colors
    textPrimary: string;
    textSecondary: string;
    textMuted: string;

    // Border and divider
    border: string;
    divider: string;

    // Chart colors
    chartGrid: string;
    chartAxisLabel: string;
    chartTooltipBg: string;
    chartTooltipText: string;

    // Shadows
    shadowSm: string;
    shadowMd: string;
    shadowLg: string;

    // Semantic colors (4 colors for professional appearance)
    colorPrimary: string;
    colorSuccess: string;
    colorWarning: string;
    colorDanger: string;
}

export const lightTheme: ThemeTokens = {
    bgMain: '#F8FAFC',
    bgCard: '#FFFFFF',
    bgSidebar: '#1e293b',
    bgHeader: '#FFFFFF',

    textPrimary: '#1F2937',
    textSecondary: '#4B5563',
    textMuted: '#9CA3AF',

    border: '#E5E7EB',
    divider: '#E5E7EB',

    chartGrid: '#F0F0F0',
    chartAxisLabel: '#6B7280',
    chartTooltipBg: '#1F2937',
    chartTooltipText: '#FFFFFF',

    shadowSm: '0 1px 4px rgba(0, 0, 0, 0.06)',
    shadowMd: '0 4px 12px rgba(0, 0, 0, 0.08)',
    shadowLg: '0 8px 24px rgba(0, 0, 0, 0.12)',

    colorPrimary: '#2563eb',
    colorSuccess: '#059669',
    colorWarning: '#d97706',
    colorDanger: '#dc2626',
};

export const darkTheme: ThemeTokens = {
    bgMain: '#0F172A',
    bgCard: '#1E293B',
    bgSidebar: '#0f172a',
    bgHeader: '#1E293B',

    textPrimary: '#E5E7EB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',

    border: '#334155',
    divider: '#334155',

    chartGrid: '#334155',
    chartAxisLabel: '#9CA3AF',
    chartTooltipBg: '#374151',
    chartTooltipText: '#F9FAFB',

    shadowSm: '0 1px 4px rgba(0, 0, 0, 0.3)',
    shadowMd: '0 4px 12px rgba(0, 0, 0, 0.4)',
    shadowLg: '0 8px 24px rgba(0, 0, 0, 0.5)',

    colorPrimary: '#3b82f6',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorDanger: '#ef4444',
};
