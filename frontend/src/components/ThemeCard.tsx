import React from 'react';
import { Card, Row, Col, Tag, Typography } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import type { ThemeConfig } from '../constants/theme.constants';

const { Text, Title } = Typography;

interface ThemeCardProps {
    theme: ThemeConfig;
    isSelected: boolean;
    onSelect: () => void;
}

export const ThemeCard: React.FC<ThemeCardProps> = ({ theme, isSelected, onSelect }) => {
    return (
        <Card
            hoverable
            onClick={onSelect}
            style={{
                borderColor: isSelected ? theme.colors.brand.primary : undefined,
                borderWidth: isSelected ? 2 : 1,
                position: 'relative',
                cursor: 'pointer',
            }}
            bodyStyle={{ padding: '16px' }}
        >
            {isSelected && (
                <CheckCircleFilled
                    style={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        fontSize: 24,
                        color: theme.colors.brand.primary,
                    }}
                />
            )}

            <div style={{ marginBottom: 12 }}>
                <Title level={5} style={{ marginBottom: 4, color: isSelected ? theme.colors.brand.primary : 'inherit' }}>
                    {theme.name}
                </Title>
                <Text type="secondary" style={{ fontSize: 12 }}>
                    {theme.description}
                </Text>
                <div style={{ marginTop: 8 }}>
                    <Tag color={theme.mode === 'dark' ? 'blue' : 'gold'}>
                        {theme.mode === 'dark' ? 'Dark' : 'Light'}
                    </Tag>
                </div>
            </div>

            {/* Color Palette Preview */}
            <div style={{ marginTop: 16 }}>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Color Palette
                </Text>
                <Row gutter={[8, 8]}>
                    <Col span={6}>
                        <div
                            style={{
                                width: '100%',
                                height: 40,
                                backgroundColor: theme.colors.background.primary,
                                border: `1px solid ${theme.colors.border.default}`,
                                borderRadius: 4,
                            }}
                            title="Background"
                        />
                        <Text style={{ fontSize: 10, display: 'block', textAlign: 'center', marginTop: 4 }}>
                            BG
                        </Text>
                    </Col>
                    <Col span={6}>
                        <div
                            style={{
                                width: '100%',
                                height: 40,
                                backgroundColor: theme.colors.background.card,
                                border: `1px solid ${theme.colors.border.default}`,
                                borderRadius: 4,
                            }}
                            title="Card"
                        />
                        <Text style={{ fontSize: 10, display: 'block', textAlign: 'center', marginTop: 4 }}>
                            Card
                        </Text>
                    </Col>
                    <Col span={6}>
                        <div
                            style={{
                                width: '100%',
                                height: 40,
                                backgroundColor: theme.colors.brand.primary,
                                borderRadius: 4,
                            }}
                            title="Primary"
                        />
                        <Text style={{ fontSize: 10, display: 'block', textAlign: 'center', marginTop: 4 }}>
                            Primary
                        </Text>
                    </Col>
                    <Col span={6}>
                        <div
                            style={{
                                width: '100%',
                                height: 40,
                                backgroundColor: theme.colors.brand.accent,
                                borderRadius: 4,
                            }}
                            title="Accent"
                        />
                        <Text style={{ fontSize: 10, display: 'block', textAlign: 'center', marginTop: 4 }}>
                            Accent
                        </Text>
                    </Col>
                </Row>
            </div>

            {/* Design Tokens Preview */}
            <div style={{ marginTop: 16 }}>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                    Design Style
                </Text>
                <Row gutter={[8, 8]}>
                    <Col span={12}>
                        <div
                            style={{
                                padding: '8px 12px',
                                backgroundColor: theme.colors.background.card,
                                borderRadius: theme.spacing.borderRadius.card,
                                boxShadow: theme.spacing.shadow.card,
                                border: `1px solid ${theme.colors.border.default}`,
                            }}
                        >
                            <Text style={{ fontSize: 10, color: theme.colors.text.secondary }}>
                                Rounded: {theme.spacing.borderRadius.card}
                            </Text>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div
                            style={{
                                padding: '8px 12px',
                                backgroundColor: theme.colors.background.card,
                                borderRadius: theme.spacing.borderRadius.card,
                                boxShadow: theme.spacing.shadow.card,
                                border: `1px solid ${theme.colors.border.default}`,
                            }}
                        >
                            <Text style={{ fontSize: 10, color: theme.colors.text.secondary }}>
                                Shadow: {theme.spacing.shadow.sm.includes('0.3') ? 'Strong' : 'Soft'}
                            </Text>
                        </div>
                    </Col>
                </Row>
            </div>
        </Card>
    );
};
