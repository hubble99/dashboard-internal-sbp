import React, { useState } from 'react';
import {
    Modal, Select, Form, Button, Divider, Space,
    message, Typography, Alert,
} from 'antd';
import {
    FileExcelOutlined,
    DownloadOutlined,
    FilterOutlined,
} from '@ant-design/icons';
import { exportExcel } from '../api/exportApi';

const { Text, Title } = Typography;

const BULAN_OPTIONS = [
    { label: 'Januari', value: 1 },
    { label: 'Februari', value: 2 },
    { label: 'Maret', value: 3 },
    { label: 'April', value: 4 },
    { label: 'Mei', value: 5 },
    { label: 'Juni', value: 6 },
    { label: 'Juli', value: 7 },
    { label: 'Agustus', value: 8 },
    { label: 'September', value: 9 },
    { label: 'Oktober', value: 10 },
    { label: 'November', value: 11 },
    { label: 'Desember', value: 12 },
];

interface ExportModalProps {
    open: boolean;
    onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [tahun, setTahun] = useState<number[]>([new Date().getFullYear()]);
    const [bulan, setBulan] = useState<number[]>([]);
    const [jenisLembaga, setJenisLembaga] = useState<string | undefined>(undefined);

    // Generate tahun options — 5 tahun terakhir
    const currentYear = new Date().getFullYear();
    const tahunOptions = Array.from({ length: 5 }, (_, i) => ({
        label: String(currentYear - i),
        value: currentYear - i,
    }));

    const handleExport = async () => {
        if (tahun.length === 0) {
            return message.warning('Pilih minimal satu tahun');
        }

        setLoading(true);
        try {
            await exportExcel({
                tahun,
                bulan: bulan.length > 0 ? bulan : undefined,
                jenisLembaga: jenisLembaga || undefined,
            });
            message.success('File Excel berhasil diunduh!');
            onClose();
        } catch (error: any) {
            message.error('Gagal mengunduh file. Silakan coba lagi.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={
                <Space>
                    <FileExcelOutlined style={{ color: '#217346', fontSize: 20 }} />
                    <span>Export Data ke Excel</span>
                </Space>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={460}
            destroyOnClose
        >
            {/* Preview isi file */}
            <div style={{
                background: '#f6f8fa',
                border: '1px solid #e1e8ee',
                borderRadius: 8,
                padding: '12px 16px',
                marginBottom: 16,
                marginTop: 4,
            }}>
                <Text strong style={{ fontSize: 12, color: '#555' }}>📋 Isi file Excel (1 sheet):</Text>
                <div style={{ marginTop: 6, fontSize: 12, color: '#666', lineHeight: 1.8 }}>
                    <span style={{ background: '#1A3C5E', color: '#fff', borderRadius: 3, padding: '1px 6px', marginRight: 4 }}>No</span>
                    <span style={{ background: '#1A3C5E', color: '#fff', borderRadius: 3, padding: '1px 6px', marginRight: 4 }}>Nama Lembaga</span>
                    <span style={{ background: '#1A3C5E', color: '#fff', borderRadius: 3, padding: '1px 6px', marginRight: 4 }}>Jenis Lembaga</span>
                    <span style={{ background: '#1A3C5E', color: '#fff', borderRadius: 3, padding: '1px 6px', marginRight: 4 }}>Tahun</span>
                    <span style={{ background: '#1A3C5E', color: '#fff', borderRadius: 3, padding: '1px 6px', marginRight: 4 }}>Bulan</span>
                    <span style={{ background: '#1A3C5E', color: '#fff', borderRadius: 3, padding: '1px 6px', marginRight: 4 }}>Total Penyelamatan (Kg)</span>
                    <span style={{ background: '#1A3C5E', color: '#fff', borderRadius: 3, padding: '1px 6px', marginRight: 4 }}>Total Penyaluran (Kg)</span>
                    <span style={{ background: '#1A3C5E', color: '#fff', borderRadius: 3, padding: '1px 6px' }}>Penerima Manfaat</span>
                    <div style={{ marginTop: 6, color: '#888' }}>+ Baris <span style={{ background: '#FFFFF3CD', border: '1px solid #D4AC0D', borderRadius: 3, padding: '0 4px', color: '#8B6914' }}>TOTAL KESELURUHAN</span> di bagian bawah</div>
                </div>
            </div>

            <Divider style={{ margin: '0 0 16px 0' }} />

            {/* Filter Data */}
            <div style={{ marginBottom: 16 }}>
                <Text strong style={{ display: 'block', marginBottom: 10 }}>
                    <FilterOutlined style={{ marginRight: 6 }} />
                    Filter Data:
                </Text>
                <Form layout="vertical">
                    <Form.Item label="Tahun" style={{ marginBottom: 12 }}>
                        <Select
                            mode="multiple"
                            value={tahun}
                            onChange={setTahun}
                            options={tahunOptions}
                            placeholder="Pilih tahun"
                            style={{ width: '100%' }}
                            maxTagCount={3}
                        />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            Pilih satu atau lebih tahun
                        </Text>
                    </Form.Item>

                    <Form.Item label="Bulan" style={{ marginBottom: 12 }}>
                        <Select
                            mode="multiple"
                            value={bulan}
                            onChange={setBulan}
                            options={BULAN_OPTIONS}
                            placeholder="Semua bulan (biarkan kosong)"
                            style={{ width: '100%' }}
                            maxTagCount={4}
                            allowClear
                        />
                        <Text type="secondary" style={{ fontSize: 11 }}>
                            Kosongkan untuk semua bulan
                        </Text>
                    </Form.Item>

                    <Form.Item label="Jenis Lembaga" style={{ marginBottom: 0 }}>
                        <Select
                            value={jenisLembaga}
                            onChange={setJenisLembaga}
                            placeholder="Semua jenis lembaga"
                            style={{ width: '100%' }}
                            allowClear
                            options={[
                                { label: 'Penggiat', value: 'Penggiat' },
                                { label: 'Transaksi Mandiri', value: 'Transaksi Mandiri' },
                            ]}
                        />
                    </Form.Item>
                </Form>
            </div>

            <Alert
                type="success"
                showIcon
                style={{ marginBottom: 16, borderRadius: 8 }}
                message="Format report-ready"
                description="Header berwarna, border tabel, angka terformat (1.234,56), baris Total di bawah, dan freeze header otomatis."
            />

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={onClose} disabled={loading}>Batal</Button>
                <Button
                    type="primary"
                    icon={<DownloadOutlined />}
                    loading={loading}
                    onClick={handleExport}
                    style={{ background: '#217346', borderColor: '#217346' }}
                >
                    {loading ? 'Generating...' : 'Download Excel'}
                </Button>
            </Space>
        </Modal>
    );
};

export default ExportModal;
