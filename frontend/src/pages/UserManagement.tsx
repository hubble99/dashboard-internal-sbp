import React, { useState, useEffect } from 'react';
import {
    Table, Button, Modal, Form, Input, Select, message,
    Popconfirm, Tag, Space, Card, Alert, Badge,
} from 'antd';
import {
    PlusOutlined, DeleteOutlined, UserOutlined,
    SafetyCertificateOutlined, TeamOutlined,
} from '@ant-design/icons';
import { getUsers, createUser, deleteUser } from '../api/userApi';
import type { User, CreateUserDto } from '../types/user.types';
import { Role } from '../types/user.types';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const UserManagement: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getUsers();
            setUsers(data);
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal mengambil data user');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = () => {
        form.resetFields();
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteUser(id);
            message.success('User berhasil dihapus');
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal menghapus user');
        }
    };

    const handleSubmit = async (values: any) => {
        try {
            const createData: CreateUserDto = {
                name: values.name,
                email: values.email,
                password: values.password,
                role: values.role,
            };
            await createUser(createData);
            message.success('User berhasil dibuat');
            setModalVisible(false);
            form.resetFields();
            fetchUsers();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Gagal membuat user');
        }
    };

    const superAdminCount = users.filter(u => u.role === Role.SUPER_ADMIN).length;
    const adminCount = users.filter(u => u.role === Role.ADMIN).length;

    const columns = [
        {
            title: 'Nama',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <Space>
                    <UserOutlined />
                    <span style={{ fontWeight: 500 }}>{text}</span>
                </Space>
            ),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => (
                <Tag
                    color={role === 'SUPER_ADMIN' ? 'red' : 'blue'}
                    icon={<SafetyCertificateOutlined />}
                >
                    {role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                </Tag>
            ),
        },
        {
            title: 'Dibuat',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm'),
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, record: User) => {
                const isSelf = record.id === Number(currentUser?.id);
                const isLastSuperAdmin = record.role === 'SUPER_ADMIN' && superAdminCount <= 1;
                return (
                    <Popconfirm
                        title="Hapus user ini?"
                        description={
                            isLastSuperAdmin
                                ? 'Tidak dapat menghapus Super Admin terakhir.'
                                : 'Tindakan ini tidak dapat dibatalkan.'
                        }
                        onConfirm={() => handleDelete(record.id)}
                        okText="Ya, Hapus"
                        cancelText="Tidak"
                        disabled={isSelf || isLastSuperAdmin}
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={isSelf || isLastSuperAdmin}
                            title={
                                isSelf ? 'Tidak bisa menghapus akun sendiri'
                                    : isLastSuperAdmin ? 'Tidak bisa menghapus Super Admin terakhir'
                                        : 'Hapus user'
                            }
                        >
                            Hapus
                        </Button>
                    </Popconfirm>
                );
            },
        },
    ];

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px' }}>
            {/* Ringkasan */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                <Card size="small" style={{ flex: 1, textAlign: 'center' }}>
                    <Badge count={superAdminCount} color="red" showZero>
                        <SafetyCertificateOutlined style={{ fontSize: 24, color: '#cf1322' }} />
                    </Badge>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Super Admin</div>
                </Card>
                <Card size="small" style={{ flex: 1, textAlign: 'center' }}>
                    <Badge count={adminCount} color="blue" showZero>
                        <TeamOutlined style={{ fontSize: 24, color: '#1677ff' }} />
                    </Badge>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Admin</div>
                </Card>
                <Card size="small" style={{ flex: 1, textAlign: 'center' }}>
                    <Badge count={users.length} color="default" showZero>
                        <UserOutlined style={{ fontSize: 24, color: '#555' }} />
                    </Badge>
                    <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>Total User</div>
                </Card>
            </div>

            <Card
                title="Manajemen User"
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                        Tambah User
                    </Button>
                }
            >
                <Alert
                    type="warning"
                    showIcon
                    message="Halaman ini hanya bisa diakses oleh Super Admin"
                    description="Hanya Super Admin yang dapat menambah dan menghapus akun pengguna."
                    style={{ marginBottom: 16, borderRadius: 8 }}
                />
                <Table
                    columns={columns}
                    dataSource={users}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        position: ['bottomCenter'],
                        showTotal: (total) => `Total ${total} user`,
                    }}
                />
            </Card>

            <Modal
                title="Tambah User Baru"
                open={modalVisible}
                onCancel={() => { setModalVisible(false); form.resetFields(); }}
                footer={null}
            >
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item
                        name="name"
                        label="Nama Lengkap"
                        rules={[{ required: true, message: 'Nama harus diisi' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Masukkan nama lengkap" />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Email harus diisi' },
                            { type: 'email', message: 'Format email tidak valid' },
                        ]}
                    >
                        <Input placeholder="contoh@bapanas.go.id" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="Password"
                        rules={[
                            { required: true, message: 'Password harus diisi' },
                            { min: 8, message: 'Password minimal 8 karakter' },
                        ]}
                    >
                        <Input.Password placeholder="Minimal 8 karakter" />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Role harus dipilih' }]}
                        initialValue={Role.ADMIN}
                    >
                        <Select>
                            <Select.Option value={Role.ADMIN}>
                                <Tag color="blue">Admin</Tag>
                                — Bisa refresh data & lihat audit log
                            </Select.Option>
                            <Select.Option value={Role.SUPER_ADMIN}>
                                <Tag color="red">Super Admin</Tag>
                                — Full access termasuk kelola user
                            </Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item style={{ marginBottom: 0 }}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={() => { setModalVisible(false); form.resetFields(); }}>
                                Batal
                            </Button>
                            <Button type="primary" htmlType="submit">
                                Buat User
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UserManagement;
