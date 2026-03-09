import React, { useEffect, useState } from 'react';
import { Card, Select, Row, Col, Button, Space } from 'antd';
import { FilterOutlined, ClearOutlined } from '@ant-design/icons';
import api from '../api/client';
import type { FilterOptions, DashboardFilters } from '../types';

interface FilterPanelProps {
    filters: DashboardFilters;
    onChange: (filters: DashboardFilters) => void;
    showFields?: string[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
    filters,
    onChange,
    showFields = ['tahun', 'bulan', 'provinsiId', 'kabupatenId', 'lembaga', 'jenisLembaga', 'produkDonasi'],
}) => {
    const [options, setOptions] = useState<FilterOptions | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const res = await api.get('/filters/options');
                setOptions(res.data.data);
            } catch {
                console.error('Failed to load filter options');
            } finally {
                setLoading(false);
            }
        };
        fetchOptions();
    }, []);

    const handleChange = (field: string, value: any) => {
        const newFilters = { ...filters, [field]: value || undefined };
        // Clear kabupaten when provinsi changes
        if (field === 'provinsiId') {
            newFilters.kabupatenId = undefined;
        }
        onChange(newFilters);
    };

    const handleClear = () => {
        onChange({});
    };

    const filteredKabupaten = options?.kabupaten.filter(
        (k) => {
            if (!filters.provinsiId) return true;
            const selected = Array.isArray(filters.provinsiId) ? filters.provinsiId : [filters.provinsiId];
            return selected.includes(k.provinsiId);
        }
    );

    if (!options && !loading) return null;

    return (
        <Card
            size="small"
            style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: '20px 24px' } }}
        >
            <Row gutter={[12, 12]} align="middle">
                <Col>
                    <Space size={8}>
                        <FilterOutlined style={{ color: '#1677ff', fontSize: 16 }} />
                        <span style={{ fontWeight: 600, fontSize: 14, color: '#1677ff' }}>Filter Utama</span>
                    </Space>
                </Col>

                {showFields.includes('tahun') && (
                    <Col>
                        <Select
                            placeholder="Tahun"
                            allowClear
                            size="large"
                            value={filters.tahun}
                            onChange={(v) => handleChange('tahun', v)}
                            loading={loading}
                            style={{ width: 240 }}
                            options={options?.tahun.map((t) => ({ value: t, label: String(t) }))}
                        />
                    </Col>
                )}

                {showFields.includes('bulan') && (
                    <Col>
                        <Select
                            placeholder="Bulan"
                            allowClear
                            size="large"
                            value={filters.bulan}
                            onChange={(v) => handleChange('bulan', v)}
                            loading={loading}
                            style={{ width: 240 }}
                            options={options?.bulan.map((b) => ({ value: b.value, label: b.label }))}
                        />
                    </Col>
                )}

                {showFields.includes('provinsiId') && (
                    <Col>
                        <Select
                            placeholder="Provinsi"
                            allowClear
                            size="large"
                            showSearch
                            optionFilterProp="label"
                            value={filters.provinsiId}
                            onChange={(v) => handleChange('provinsiId', v)}
                            loading={loading}
                            style={{ width: 240 }}
                            options={options?.provinsi.map((p) => ({ value: p.id, label: p.nama }))}
                        />
                    </Col>
                )}

                {showFields.includes('kabupatenId') && (
                    <Col>
                        <Select
                            placeholder="Kabupaten/Kota"
                            allowClear
                            size="large"
                            showSearch
                            optionFilterProp="label"
                            value={filters.kabupatenId}
                            onChange={(v) => handleChange('kabupatenId', v)}
                            loading={loading}
                            style={{ width: 240 }}
                            options={filteredKabupaten?.map((k) => ({ value: k.id, label: k.nama }))}
                        />
                    </Col>
                )}

                {showFields.includes('lembaga') && (
                    <Col>
                        <Select
                            placeholder="Lembaga"
                            allowClear
                            size="large"
                            showSearch
                            optionFilterProp="label"
                            value={filters.lembaga}
                            onChange={(v) => handleChange('lembaga', v)}
                            loading={loading}
                            style={{ width: 240 }}
                            options={options?.lembaga.map((l) => ({ value: l.nama, label: l.nama }))}
                        />
                    </Col>
                )}

                {showFields.includes('jenisLembaga') && (
                    <Col>
                        <Select
                            placeholder="Jenis Lembaga"
                            allowClear
                            size="large"
                            value={filters.jenisLembaga}
                            onChange={(v) => handleChange('jenisLembaga', v)}
                            loading={loading}
                            style={{ width: 240 }}
                            options={options?.jenisLembaga.map((j) => ({ value: j, label: j }))}
                        />
                    </Col>
                )}

                {showFields.includes('produkDonasi') && (
                    <Col>
                        <Select
                            placeholder="Produk Donasi"
                            allowClear
                            size="large"
                            value={filters.produkDonasi}
                            onChange={(v) => handleChange('produkDonasi', v)}
                            loading={loading}
                            style={{ width: 240 }}
                            options={options?.produkDonasi.map((p) => ({ value: p, label: p }))}
                        />
                    </Col>
                )}

                {showFields.includes('lembagaPenyedia') && (
                    <Col>
                        <Select
                            placeholder="Lembaga Penyedia"
                            allowClear
                            size="large"
                            showSearch
                            optionFilterProp="label"
                            value={filters.jenisLembagaPenyedia}
                            onChange={(v) => handleChange('jenisLembagaPenyedia', v)}
                            loading={loading}
                            style={{ width: 240 }}
                            options={options?.lembagaPenyedia.map((l) => ({ value: l.nama, label: l.nama }))}
                        />
                    </Col>
                )}


                <Col>
                    <Button
                        icon={<ClearOutlined />}
                        onClick={handleClear}
                        size="large"
                        style={{ borderRadius: 8, height: 40, paddingInline: 24 }}
                    >
                        Reset
                    </Button>
                </Col>
            </Row>
        </Card>
    );
};

export default FilterPanel;
