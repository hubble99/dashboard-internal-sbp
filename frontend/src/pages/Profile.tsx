import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Divider, Tag, Alert, Space, Typography } from 'antd';
import {
    LockOutlined,
    UserOutlined,
    CheckCircleOutlined,
    MailOutlined,
    SafetyCertificateOutlined,
} from '@ant-design/icons';
import { getProfile, changePassword } from '../api/profileApi';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Profile: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (error: any) {
            message.error('Gagal mengambil data profil');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (values: any) => {
        if (values.newPassword !== values.confirmPassword) {
            return message.error('Konfirmasi password tidak sesuai');
        }
        setPwLoading(true);
        try {
            await changePassword(values.oldPassword, values.newPassword);
            message.success('Password berhasil diubah!');
            form.resetFields();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal mengubah password');
        } finally {
            setPwLoading(false);
        }
    };

    const roleLabel = user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin';
    const roleColor = user?.role === 'SUPER_ADMIN' ? 'red' : 'blue';

    return (
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 16px' }}>
            {/* Info Profil */}
            <Card loading={loading} style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 }}>
                    <div style={{
                        width: 72, height: 72,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #1a3c5e, #2d6a9f)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 28, color: '#fff', fontWeight: 700, flexShrink: 0,
                    }}>
                        {(profile?.name || user?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <Title level={4} style={{ margin: 0 }}>
                            {profile?.name || user?.name}
                        </Title>
                        <Space size={8} style={{ marginTop: 4 }}>
                            <Text type="secondary">
                                <MailOutlined style={{ marginRight: 4 }} />
                                {profile?.email || user?.email}
                            </Text>
                            <Tag color={roleColor} icon={<SafetyCertificateOutlined />}>
                                {roleLabel}
                            </Tag>
                        </Space>
                        {profile?.createdAt && (
                            <div style={{ marginTop: 4 }}>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    <UserOutlined style={{ marginRight: 4 }} />
                                    Akun dibuat:{' '}
                                    {new Date(profile.createdAt).toLocaleDateString('id-ID', {
                                        day: 'numeric', month: 'long', year: 'numeric',
                                    })}
                                </Text>
                            </div>
                        )}
                    </div>
                </div>

                <Alert
                    type="info"
                    showIcon
                    message="Informasi Akun"
                    description="Untuk mengubah nama atau email, hubungi Super Admin."
                    style={{ borderRadius: 8 }}
                />
            </Card>

            {/* Ganti Password */}
            <Card title={<><LockOutlined style={{ marginRight: 8 }} />Ganti Password</>}>
                <Form form={form} layout="vertical" onFinish={handleChangePassword} autoComplete="off">
                    <Form.Item
                        name="oldPassword"
                        label="Password Lama"
                        rules={[{ required: true, message: 'Password lama harus diisi' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Masukkan password lama" />
                    </Form.Item>

                    <Divider dashed style={{ margin: '12px 0' }} />

                    <Form.Item
                        name="newPassword"
                        label="Password Baru"
                        rules={[
                            { required: true, message: 'Password baru harus diisi' },
                            { min: 8, message: 'Password minimal 8 karakter' },
                        ]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Minimal 8 karakter" />
                    </Form.Item>

                    <Form.Item
                        name="confirmPassword"
                        label="Konfirmasi Password Baru"
                        dependencies={['newPassword']}
                        rules={[
                            { required: true, message: 'Konfirmasi password harus diisi' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Password tidak sesuai!'));
                                },
                            }),
                        ]}
                    >
                        <Input.Password prefix={<CheckCircleOutlined />} placeholder="Ulangi password baru" />
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" loading={pwLoading} block icon={<LockOutlined />}>
                            Ubah Password
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Profile;
