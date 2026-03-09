import React from 'react';
import CustomTooltip from '../CustomTooltip';
import { Card } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useTheme } from '../../contexts/ThemeContext';

interface ChartData {
    name: string;
    value: number;
}

interface TopBarChartProps {
    data: ChartData[];
    title: string;
    color?: string;
}

const formatNumber = (value: number) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(2)}rb`;
    return String(value);
};

const TopBarChart: React.FC<TopBarChartProps> = ({ data, title, color = '#1677ff' }) => {
    const { currentTheme } = useTheme();

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
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 40, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.colors.chart.grid} />
                    <XAxis
                        type="number"
                        tickFormatter={formatNumber}
                        tick={{ fontSize: 11, fill: currentTheme.colors.text.secondary }}
                        stroke={currentTheme.colors.chart.grid}
                    />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={150}
                        tick={{ fontSize: 11, fill: currentTheme.colors.text.secondary }}
                        stroke={currentTheme.colors.chart.grid}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={color} />
                        ))}
                        <LabelList
                            dataKey="value"
                            position="right"
                            formatter={(val: any) => formatNumber(val ?? 0)}
                            content={(props: any) => {
                                const { x, y, width, height, value } = props;
                                const maxValue = Math.max(...data.map(d => d.value));
                                const percentage = (value / maxValue) * 100;

                                // If bar is > 70% of max width, place label inside
                                // Otherwise, place outside
                                const isLargeBar = percentage > 70;
                                const labelX = isLargeBar ? x + width - 5 : x + width + 8;
                                const labelAnchor = isLargeBar ? 'end' : 'start';
                                const labelColor = isLargeBar ? '#fff' : currentTheme.colors.text.primary;

                                return (
                                    <text
                                        x={labelX}
                                        y={y + height / 2}
                                        fill={labelColor}
                                        fontSize={11}
                                        fontWeight={600}
                                        textAnchor={labelAnchor}
                                        dominantBaseline="middle"
                                    >
                                        {formatNumber(value ?? 0)}
                                    </text>
                                );
                            }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Card>
    );
};

export default TopBarChart;
