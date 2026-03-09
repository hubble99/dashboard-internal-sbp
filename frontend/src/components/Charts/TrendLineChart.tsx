import React from 'react';
import CustomTooltip from '../CustomTooltip';
import { Card, Empty } from 'antd';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Area, ReferenceLine, Label, LabelList,
} from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface TrendDataPoint {
    label: string;
    value: number;
}

interface TrendLineChartProps {
    data: TrendDataPoint[];
    title: string;
    color?: string;
    yAxisLabel?: string;
}

const formatNumber = (value: number, precision?: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}rb`;
    return precision !== undefined ? value.toFixed(precision) : String(value);
};

const TrendLineChart: React.FC<TrendLineChartProps> = ({
    data,
    title,
    color = '#1677ff',
    yAxisLabel = 'Jumlah (Kg)',
}) => {
    const { currentTheme, mode } = useTheme();

    if (!data || data.length === 0) {
        return (
            <Card
                title={<span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>}
                style={{ borderRadius: 12, boxShadow: currentTheme.spacing.shadow.sm, backgroundColor: currentTheme.colors.background.card }}
            >
                <Empty
                    description="Tidak ada data untuk periode ini"
                    style={{ padding: '60px 0' }}
                />
            </Card>
        );
    }

    // Calculate statistics
    const values = data.map(d => d.value);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;

    const maxIndex = values.indexOf(max);
    const minIndex = values.indexOf(min);

    return (
        <Card
            title={<span style={{ fontSize: 14, fontWeight: 600, color: currentTheme.colors.text.primary }}>{title}</span>}
            style={{
                borderRadius: 12,
                boxShadow: currentTheme.spacing.shadow.sm,
                backgroundColor: currentTheme.colors.background.card,
                border: `1px solid ${currentTheme.colors.border.default}`
            }}
        >
            <ResponsiveContainer width="100%" height={360}>
                <LineChart data={data} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <defs>
                        <linearGradient id={`areaGradient-${mode}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
                            <stop offset="95%" stopColor={color} stopOpacity={0.02} />
                        </linearGradient>
                    </defs>

                    <Tooltip content={<CustomTooltip />} />
                    <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.colors.border.default} />

                    <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: currentTheme.colors.text.secondary }}
                        stroke={currentTheme.colors.chart.grid}
                    />

                    <YAxis
                        tickFormatter={formatNumber}
                        tick={{ fontSize: 11, fill: currentTheme.colors.text.secondary }}
                        stroke={currentTheme.colors.chart.grid}
                        label={{
                            value: yAxisLabel,
                            angle: -90,
                            position: 'insideLeft',
                            style: { fontSize: 11, fill: currentTheme.colors.text.secondary }
                        }}
                    />

                    {/* Average line */}
                    <ReferenceLine
                        y={avg}
                        stroke={currentTheme.colors.text.muted}
                        strokeDasharray="5 5"
                        strokeWidth={1.5}
                    >
                        <Label
                            value={`Rata-rata: ${formatNumber(avg, 2)}`}
                            position="insideTopRight"
                            style={{ fontSize: 12, fill: currentTheme.colors.text.muted, fontWeight: 600 }}
                        />
                    </ReferenceLine>

                    {/* Area under line */}
                    <Area
                        type="monotone"
                        dataKey="value"
                        stroke="none"
                        fill={`url(#areaGradient-${mode})`}
                    />

                    {/* Main line with data labels */}
                    <Line
                        type="monotone"
                        dataKey="value"
                        stroke={color}
                        strokeWidth={2.5}
                        dot={(props: any) => {
                            const { cx, cy, index } = props;
                            let fill = color;
                            let r = 4;

                            // Highlight max and min points
                            if (index === maxIndex) {
                                fill = currentTheme.colors.semantic.success;
                                r = 7;
                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={r}
                                        fill={fill}
                                        stroke="#fff"
                                        strokeWidth={2}
                                    />
                                );
                            } else if (index === minIndex && minIndex !== maxIndex) {
                                fill = currentTheme.colors.semantic.danger;
                                r = 7;
                                return (
                                    <circle
                                        cx={cx}
                                        cy={cy}
                                        r={r}
                                        fill={fill}
                                        stroke="#fff"
                                        strokeWidth={2}
                                    />
                                );
                            }

                            // Regular dots
                            return (
                                <circle
                                    cx={cx}
                                    cy={cy}
                                    r={r}
                                    fill={fill}
                                    strokeWidth={0}
                                />
                            );
                        }}
                        activeDot={{ r: 6 }}
                    >
                        {/* Data labels on points */}
                        <LabelList
                            dataKey="value"
                            position="top"
                            formatter={(val: any) => formatNumber(val ?? 0)}
                            style={{ fontSize: 12, fill: currentTheme.colors.text.primary, fontWeight: 600 }}
                        />
                    </Line>


                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default TrendLineChart;
