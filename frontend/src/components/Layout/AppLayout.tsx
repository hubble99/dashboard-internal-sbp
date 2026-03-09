import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Typography, Space, Avatar, Dropdown, message } from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    DashboardOutlined,
    ShoppingCartOutlined,
    BarChartOutlined,
    ReloadOutlined,
    LogoutOutlined,
    UserOutlined,
    BulbOutlined,
    BulbFilled,
    UsergroupAddOutlined,
    HistoryOutlined,
    SettingOutlined,
    FileExcelOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import api from '../../api/client';
import dayjs from 'dayjs';
import ExportModal from '../ExportModal';
import './AppLayout.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const AppLayout: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [exportModalOpen, setExportModalOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout, isSuperAdmin, isAdmin } = useAuth();
    const { mode, toggleTheme, currentTheme } = useTheme();

    // Build menu items based on role
    const dashboardItems = [
        { key: '/penyelamatan-pangan', icon: <DashboardOutlined />, label: 'Penyelamatan Pangan' },
        { key: '/penyaluran-pangan', icon: <ShoppingCartOutlined />, label: 'Penyaluran Pangan' },
        { key: '/rasio-lembaga', icon: <BarChartOutlined />, label: 'Rasio Lembaga' },
    ];

    // Manajemen User: hanya SUPER_ADMIN
    const superAdminItems = isSuperAdmin ? [
        { type: 'divider' as const },
        { key: '/user-management', icon: <UsergroupAddOutlined />, label: 'Manajemen User' },
    ] : [];

    // Riwayat Audit: SUPER_ADMIN dan ADMIN
    const adminItems = isAdmin ? [
        ...(!isSuperAdmin ? [{ type: 'divider' as const }] : []),
        { key: '/audit-history', icon: <HistoryOutlined />, label: 'Riwayat Audit' },
    ] : [];

    const settingsItems = [
        { type: 'divider' as const },
        { key: '/settings', icon: <SettingOutlined />, label: 'Pengaturan' },
    ];

    const menuItems = [...dashboardItems, ...superAdminItems, ...adminItems, ...settingsItems];

    useEffect(() => {
        // Try to get last refresh from server, fallback to localStorage
        const fetchLastRefresh = async () => {
            try {
                const res = await api.get('/last-refresh');
                if (res.data?.data?.lastRefresh) {
                    const formatted = dayjs(res.data.data.lastRefresh).format('DD MMM YYYY HH:mm:ss');
                    setLastRefresh(formatted);
                    localStorage.setItem('lastRefresh', formatted);
                }
            } catch {
                // Fallback to localStorage
                const saved = localStorage.getItem('lastRefresh');
                if (saved) setLastRefresh(saved);
            }
        };
        fetchLastRefresh();
    }, []);

    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await api.post('/refresh-all');
            const now = dayjs().format('DD MMM YYYY HH:mm:ss');
            setLastRefresh(now);
            localStorage.setItem('lastRefresh', now);
            message.success('Data berhasil diperbarui!');
            // Force reload the current page data
            window.dispatchEvent(new Event('dashboard-refresh'));
        } catch {
            message.error('Gagal memperbarui data');
        } finally {
            setRefreshing(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    const userMenuItems = [
        { key: 'name', label: <span style={{ fontWeight: 600 }}>{user?.name}</span>, disabled: true },
        { key: 'email', label: <span style={{ fontSize: 12, opacity: 0.7 }}>{user?.email}</span>, disabled: true },
        { type: 'divider' as const },
        { key: 'profile', icon: <UserOutlined />, label: 'Profil & Password', onClick: () => navigate('/profile') },
        { type: 'divider' as const },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Keluar', onClick: handleLogout },
    ];

    return (
        <Layout className="app-layout">
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                className="app-sider"
                width={260}
            >
                <div className="app-logo">
                    {!collapsed ? (
                        <div className="logo-text">
                            <Text strong style={{ color: currentTheme.colors.text.inverse, fontSize: 16, letterSpacing: '0.5px' }}>Dashboard Monitoring</Text>
                            <Text style={{ color: `${currentTheme.colors.text.inverse}D9`, fontSize: 11, textTransform: 'uppercase', letterSpacing: '1px' }}>Penyelamatan Pangan</Text>
                        </div>
                    ) : (
                        <div className="logo-text-collapsed" style={{ textAlign: 'center', width: '100%' }}>
                            <Text strong style={{ color: currentTheme.colors.text.inverse, fontSize: 18 }}>SBP</Text>
                        </div>
                    )}
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[location.pathname === '/' ? '/penyelamatan-pangan' : location.pathname]}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                    className="app-menu"
                />
            </Sider>
            <Layout>
                <Header className="app-header">
                    <Space>
                        <Button
                            type="text"
                            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                            onClick={() => setCollapsed(!collapsed)}
                            className="trigger-btn"
                        />
                    </Space>
                    <Space size="middle" className="header-actions">
                        {lastRefresh && (
                            <Text type="secondary" className="refresh-timestamp">
                                Terakhir diperbarui: {lastRefresh}
                            </Text>
                        )}
                        <Button
                            type="text"
                            icon={mode === 'dark' ? <BulbFilled /> : <BulbOutlined />}
                            onClick={toggleTheme}
                            className="theme-toggle-btn"
                            title={`Switch to ${mode === 'dark' ? 'light' : 'dark'} mode`}
                            style={{ fontSize: 18 }}
                        />
                        <Button
                            icon={<FileExcelOutlined />}
                            onClick={() => setExportModalOpen(true)}
                            style={{ color: '#217346', borderColor: '#217346' }}
                            title="Export Data ke Excel"
                        >
                            Export
                        </Button>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined spin={refreshing} />}
                            onClick={handleRefresh}
                            loading={refreshing}
                            className="refresh-btn"
                        >
                            Refresh Data
                        </Button>
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <Avatar icon={<UserOutlined />} className="user-avatar" />
                        </Dropdown>
                    </Space>
                </Header>
                <Content className="app-content">
                    <Outlet />
                </Content>
            </Layout>
            <ExportModal open={exportModalOpen} onClose={() => setExportModalOpen(false)} />
        </Layout>
    );
};

export default AppLayout;
