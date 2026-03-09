import React from 'react';
import { Card, Statistic } from 'antd';
import type { StatisticProps } from 'antd';
import { useTheme } from '../contexts/ThemeContext';

interface KPICardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
    prefix?: string;
    precision?: number;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, icon, color, suffix, prefix, precision = 0 }) => {
    const { currentTheme } = useTheme();

    const formatterProps: StatisticProps = {
        title: (
            <span style={{ color: currentTheme.colors.text.secondary, fontSize: 13, fontWeight: 500 }}>{title}</span>
        ),
        value,
        precision,
        suffix,
        prefix: prefix || undefined,
    };

    return (
        <Card
            hoverable
            style={{
                borderRadius: 12,
                border: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                overflow: 'hidden',
                position: 'relative',
            }}
            styles={{
                body: { padding: '20px 24px' },
            }}
        >
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                background: color,
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Statistic
                    {...formatterProps}
                    valueStyle={{ color, fontWeight: 700, fontSize: 28 }}
                />
                <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: `${color}15`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    color,
                    flexShrink: 0,
                }}>
                    {icon}
                </div>
            </div>
        </Card>
    );
};

export default KPICard;
