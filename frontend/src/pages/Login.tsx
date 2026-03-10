import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import logoSBP from '../../assets/Logo Stop Boros Pangan.png';


const { Title, Text } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const onFinish = async (values: { email: string; password: string }) => {
        setLoading(true);
        try {
            await login(values.email, values.password);
            message.success('Login berhasil!');
            navigate('/', { replace: true });
        } catch (err: any) {
            message.error(err.response?.data?.message || 'Login gagal, periksa email dan password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}>
            <Card
                style={{
                    width: 420,
                    borderRadius: 16,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                    border: 'none',
                }}
                styles={{ body: { padding: '40px 36px' } }}
            >
                <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
                    <div>
                        <img
                            src={logoSBP}
                            alt="Logo Stop Boros Pangan"
                            style={{ width: 120, marginBottom: 12, objectFit: 'contain' }}
                        />
                        <Title level={3} style={{ margin: 0, fontWeight: 700 }}>
                            Dashboard Monitoring
                        </Title>
                        <Text type="secondary">Badan Pangan Nasional</Text>
                    </div>


                    <Form
                        name="login"
                        onFinish={onFinish}
                        layout="vertical"
                        size="large"
                        style={{ textAlign: 'left' }}
                    >
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Masukkan email' },
                                { type: 'email', message: 'Format email tidak valid' },
                            ]}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Email"
                                style={{ borderRadius: 10, height: 48 }}
                            />
                        </Form.Item>
                        <Form.Item
                            name="password"
                            rules={[{ required: true, message: 'Masukkan password' }]}
                        >
                            <Input.Password
                                prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
                                placeholder="Password"
                                style={{ borderRadius: 10, height: 48 }}
                            />
                        </Form.Item>
                        <Form.Item style={{ marginBottom: 0 }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                block
                                loading={loading}
                                style={{
                                    height: 48,
                                    borderRadius: 10,
                                    fontWeight: 600,
                                    fontSize: 15,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
                                }}
                            >
                                Masuk
                            </Button>
                        </Form.Item>
                    </Form>

                    <Text type="secondary" style={{ fontSize: 12 }}>
                        © 2026 Badan Pangan Nasional
                    </Text>
                </Space>
            </Card>
        </div>
    );
};

export default Login;
