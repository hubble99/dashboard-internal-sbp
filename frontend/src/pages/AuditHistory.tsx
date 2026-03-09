import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Select, Button, Space, Tag, message, Tooltip } from 'antd';
import { ReloadOutlined, SearchOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { getAuditLogs } from '../api/auditApi';
import type { AuditLog, AuditFilters } from '../api/auditApi';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

// Hanya tampilkan 4 action yang relevan
const RELEVANT_ACTIONS = ['LOGIN', 'LOGIN_FAILED', 'REFRESH_ALL', 'CREATE_USER'];

const ACTION_CONFIG: Record<string, { label: string; color: string; description: string }> = {
    LOGIN: { label: 'Login', color: 'green', description: 'Login berhasil' },
    LOGIN_FAILED: { label: 'Login Gagal', color: 'red', description: 'Percobaan login gagal' },
    REFRESH_ALL: { label: 'Refresh Data', color: 'cyan', description: 'Data dashboard diperbarui' },
    CREATE_USER: { label: 'Buat User', color: 'purple', description: 'User baru dibuat' },
};

const AuditHistory: React.FC = () => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 50, total: 0 });
    const [filters, setFilters] = useState<AuditFilters>({
        startDate: dayjs().subtract(30, 'days').format('YYYY-MM-DD'),
        endDate: dayjs().format('YYYY-MM-DD'),
    });
    const [selectedAction, setSelectedAction] = useState<string>('');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async (page = 1) => {
        setLoading(true);
        try {
            const response = await getAuditLogs({
                ...filters,
                action: selectedAction || undefined,
                page,
                limit: pagination.pageSize,
            });
            setLogs(response.logs);
            setPagination({
                current: response.pagination.page,
                pageSize: response.pagination.limit,
                total: response.pagination.total,
            });
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal mengambil audit logs');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination: any) => {
        if (newPagination.pageSize !== pagination.pageSize) {
            setPagination(prev => ({ ...prev, pageSize: newPagination.pageSize }));
            fetchLogs(1);
        } else {
            fetchLogs(newPagination.current);
        }
    };

    const handleDateChange = (dates: any) => {
        if (dates) {
            setFilters(prev => ({
                ...prev,
                startDate: dates[0].format('YYYY-MM-DD'),
                endDate: dates[1].format('YYYY-MM-DD'),
            }));
        } else {
            setFilters(prev => {
                const { startDate: _s, endDate: _e, ...rest } = prev;
                return rest;
            });
        }
    };

    const renderDetails = (record: AuditLog) => {
        if (!record.details) return <span style={{ color: '#999' }}>—</span>;
        try {
            const d = JSON.parse(record.details);
            if (d.attemptedEmail) return <span style={{ color: '#cf1322' }}>Email: {d.attemptedEmail}</span>;
            if (d.createdUserId) return <span>User baru: <strong>{d.email}</strong> ({d.role})</span>;
            if (d.message) return <span>{d.message}</span>;
            return <span style={{ fontSize: 11, color: '#888' }}>{JSON.stringify(d)}</span>;
        } catch {
            return record.details;
        }
    };

    const columns = [
        {
            title: 'Waktu',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm:ss'),
        },
        {
            title: 'User',
            key: 'user',
            width: 220,
            render: (_: any, record: AuditLog) => (
                record.user ? (
                    <div>
                        <div style={{ fontWeight: 500 }}>{record.user.name}</div>
                        <div style={{ fontSize: 11, opacity: 0.65 }}>{record.user.email}</div>
                        <Tag color={record.user.role === 'SUPER_ADMIN' ? 'red' : 'blue'} style={{ marginTop: 2 }}>
                            {record.user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                        </Tag>
                    </div>
                ) : (
                    <span style={{ color: '#aaa', fontStyle: 'italic' }}>—</span>
                )
            ),
        },
        {
            title: 'Aksi',
            dataIndex: 'action',
            key: 'action',
            width: 150,
            render: (action: string) => {
                const cfg = ACTION_CONFIG[action];
                return cfg ? (
                    <Tooltip title={cfg.description}>
                        <Tag color={cfg.color}>{cfg.label}</Tag>
                    </Tooltip>
                ) : (
                    <Tag>{action}</Tag>
                );
            },
        },
        {
            title: 'Detail',
            key: 'details',
            render: (_: any, record: AuditLog) => renderDetails(record),
        },
        {
            title: 'IP',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 130,
            render: (ip: string) => ip || <span style={{ color: '#aaa' }}>—</span>,
        },
    ];

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}>
            <Card
                title={
                    <Space>
                        Riwayat Aktivitas
                        <Tooltip title="Hanya 4 event penting yang dicatat: Login, Login Gagal, Refresh Data, Buat User">
                            <InfoCircleOutlined style={{ color: '#aaa' }} />
                        </Tooltip>
                    </Space>
                }
                extra={
                    <Button type="primary" icon={<ReloadOutlined />} onClick={() => fetchLogs(1)}>
                        Refresh
                    </Button>
                }
            >
                <Space style={{ marginBottom: 16, width: '100%' }} wrap>
                    <RangePicker
                        defaultValue={[dayjs().subtract(30, 'days'), dayjs()]}
                        onChange={handleDateChange}
                        format="DD MMM YYYY"
                    />
                    <Select
                        value={selectedAction || undefined}
                        placeholder="Filter Aksi"
                        style={{ width: 180 }}
                        allowClear
                        onChange={(v) => setSelectedAction(v || '')}
                        options={RELEVANT_ACTIONS.map(a => ({
                            label: ACTION_CONFIG[a]?.label || a,
                            value: a,
                        }))}
                    />
                    <Button type="primary" icon={<SearchOutlined />} onClick={() => fetchLogs(1)}>
                        Cari
                    </Button>
                </Space>

                <Table
                    columns={columns}
                    dataSource={logs}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        ...pagination,
                        position: ['bottomCenter'],
                        showTotal: (total) => `Total ${total} baris`,
                    }}
                    onChange={handleTableChange}
                    rowClassName={(record) => record.action === 'LOGIN_FAILED' ? 'audit-row-failed' : ''}
                />
            </Card>
        </div>
    );
};

export default AuditHistory;
