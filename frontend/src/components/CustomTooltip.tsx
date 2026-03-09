import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface CustomTooltipProps {
    active?: boolean;
    payload?: any[];
    label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    const { currentTheme, mode } = useTheme();

    if (!active || !payload || payload.length === 0) return null;

    // For charts with Line + Area (both have same dataKey="value"), just take the first entry
    // This completely eliminates duplicate display
    const uniquePayload = payload.length > 0 ? [payload[0]] : [];

    return (
        <div
            style={{
                backgroundColor: currentTheme.colors.chart.tooltip.background,
                border: `1px solid ${currentTheme.colors.border.default}`,
                borderRadius: 8,
                padding: '10px 14px',
                boxShadow: mode === 'dark'
                    ? '0 4px 12px rgba(0,0,0,0.4)'
                    : '0 4px 12px rgba(0,0,0,0.15)',
                maxWidth: 280,
            }}
        >
            {/* Label with wrapping */}
            {label && (
                <div
                    style={{
                        fontWeight: 600,
                        color: currentTheme.colors.chart.tooltip.text,
                        marginBottom: 6,
                        fontSize: 13,
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        whiteSpace: 'normal',
                    }}
                >
                    {label}
                </div>
            )}

            {/* Values */}
            {uniquePayload.map((entry: any, index: number) => {
                const value = entry.value?.toLocaleString('id-ID') || '0';

                return (
                    <div
                        key={index}
                        style={{
                            fontSize: 12,
                            color: currentTheme.colors.chart.tooltip.text,
                            fontWeight: 600,
                        }}
                    >
                        {value}
                    </div>
                );
            })}
        </div>
    );
};

export default CustomTooltip;
