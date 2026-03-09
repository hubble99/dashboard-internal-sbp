import React, { useState } from 'react';
import { Card, Tabs, Form, Input, Button, message, Alert, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, BgColorsOutlined, SaveOutlined } from '@ant-design/icons';
import { changePassword, updateProfile } from '../api/settingsApi';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { THEMES } from '../constants/theme.constants';
import { ThemeCard } from '../components/ThemeCard';

const Settings: React.FC = () => {
    const { user } = useAuth();
    const { currentTheme, setTheme } = useTheme();
    const [passwordForm] = Form.useForm();
    const [profileForm] = Form.useForm();
    const [loadingPassword, setLoadingPassword] = useState(false);
    const [loadingProfile, setLoadingProfile] = useState(false);

    const handlePasswordChange = async (values: any) => {
        setLoadingPassword(true);
        try {
            await changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });
            message.success('Password berhasil diubah');
            passwordForm.resetFields();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal mengubah password');
        } finally {
            setLoadingPassword(false);
        }
    };

    const handleProfileUpdate = async (values: any) => {
        setLoadingProfile(true);
        try {
            await updateProfile({
                name: values.name,
                email: values.email,
            });
            message.success('Profil berhasil diupdate');
            // Reload page to update user info in context
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal mengupdate profil');
        } finally {
            setLoadingProfile(false);
        }
    };

    const profileTab = (
        <div style={{ maxWidth: 600 }}>
            <Alert
                message={<span style={{ fontWeight: 600 }}>Informasi Profil</span>}
                description="Perbarui informasi profil Anda secara berkala. Perubahan akan diterapkan sepenuhnya setelah halaman dimuat ulang."
                type="info"
                showIcon
                style={{ marginBottom: 32, borderRadius: 8 }}
            />
            <Form
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileUpdate}
                initialValues={{
                    name: user?.name,
                    email: user?.email,
                }}
            >
                <Form.Item
                    name="name"
                    label="Nama"
                    rules={[{ required: true, message: 'Nama harus diisi' }]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Masukkan nama" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Email harus diisi' },
                        { type: 'email', message: 'Format email tidak valid' },
                    ]}
                >
                    <Input prefix={<UserOutlined />} placeholder="Masukkan email" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loadingProfile}
                    >
                        Simpan Perubahan
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );

    const passwordTab = (
        <div style={{ maxWidth: 600 }}>
            <Alert
                message={<span style={{ fontWeight: 600 }}>Keamanan Akun</span>}
                description="Gunakan kata sandi yang kuat dengan kombinasi minimal 8 karakter untuk menjaga keamanan akun Anda."
                type="warning"
                showIcon
                style={{ marginBottom: 32, borderRadius: 8 }}
            />
            <Form
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordChange}
            >
                <Form.Item
                    name="oldPassword"
                    label="Password Lama"
                    rules={[{ required: true, message: 'Password lama harus diisi' }]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Masukkan password lama" />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Password Baru"
                    rules={[
                        { required: true, message: 'Password baru harus diisi' },
                        { min: 8, message: 'Password minimal 8 karakter' },
                    ]}
                    hasFeedback
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Masukkan password baru" />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Konfirmasi Password Baru"
                    dependencies={['newPassword']}
                    hasFeedback
                    rules={[
                        { required: true, message: 'Konfirmasi password harus diisi' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Password tidak cocok'));
                            },
                        }),
                    ]}
                >
                    <Input.Password prefix={<LockOutlined />} placeholder="Konfirmasi password baru" />
                </Form.Item>

                <Form.Item>
                    <Button
                        type="primary"
                        htmlType="submit"
                        icon={<SaveOutlined />}
                        loading={loadingPassword}
                    >
                        Ubah Password
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );

    const themeTab = (
        <div style={{ maxWidth: 900 }}>
            <Alert
                message={<span style={{ fontWeight: 600 }}>Personalisasi Pengalaman</span>}
                description="Pilih tema yang sesuai dengan preferensi Anda untuk kenyamanan mata. Tema akan diterapkan ke seluruh dashboard dan disimpan secara otomatis."
                type="info"
                showIcon
                icon={<BgColorsOutlined />}
                style={{ marginBottom: 32, borderRadius: 8 }}
            />

            <Row gutter={[16, 16]}>
                {THEMES.map((theme) => (
                    <Col xs={24} sm={12} lg={8} key={theme.id}>
                        <ThemeCard
                            theme={theme}
                            isSelected={currentTheme.id === theme.id}
                            onSelect={() => setTheme(theme.id)}
                        />
                    </Col>
                ))}
            </Row>

            <div style={{
                marginTop: 40,
                padding: '24px 32px',
                background: currentTheme.colors.background.secondary,
                borderRadius: 12,
                border: `1px solid ${currentTheme.colors.border.subtle}`,
                lineHeight: 1.6
            }}>
                <h4 style={{
                    color: currentTheme.colors.text.primary,
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <BgColorsOutlined style={{ color: currentTheme.colors.brand.primary }} />
                    Tema Saat Ini: {currentTheme.name}
                </h4>
                <p style={{
                    marginBottom: 16,
                    color: currentTheme.colors.text.secondary,
                    fontSize: 14,
                    fontWeight: 500
                }}>
                    Tema ini mencakup konfigurasi visual berikut:
                </p>
                <ul style={{
                    margin: 0,
                    paddingLeft: 22,
                    color: currentTheme.colors.text.secondary,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                    fontSize: 14
                }}>
                    <li>Palet warna primer dan sekunder yang harmonis.</li>
                    <li>Tipografi modern dengan tingkat keterbacaan tinggi.</li>
                    <li>Konfigurasi border radius serta bayangan yang elegan.</li>
                    <li>Skema warna grafik dan KPI yang informatif.</li>
                </ul>
            </div>
        </div>
    );

    const items = [
        {
            key: 'profile',
            label: (
                <span>
                    <UserOutlined /> Profil
                </span>
            ),
            children: profileTab,
        },
        {
            key: 'password',
            label: (
                <span>
                    <LockOutlined /> Password
                </span>
            ),
            children: passwordTab,
        },
        {
            key: 'theme',
            label: (
                <span>
                    <BgColorsOutlined /> Tema
                </span>
            ),
            children: themeTab,
        },
    ];

    return (
        <div style={{ padding: 24 }}>
            <Card title="Pengaturan">
                <Tabs items={items} defaultActiveKey="profile" />
            </Card>
        </div>
    );
};

export default Settings;
