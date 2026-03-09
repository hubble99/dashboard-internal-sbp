import React from 'react';
import { Select, Button, Flex, message } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import type { DashboardFilters, FilterOptions } from '../types';

interface FilterBarProps {
    filters: DashboardFilters;
    onChange: (filters: DashboardFilters) => void;
    showFields: string[];
    options: FilterOptions;
    loading?: boolean;
}

const FilterBar: React.FC<FilterBarProps> = ({ filters, onChange, showFields, options, loading }) => {
    const handleChange = (key: string, value: string | number | string[] | number[] | undefined) => {
        const newFilters = { ...filters, [key]: value };

        // Reset kabupaten when provinsi changes
        if (key === 'provinsiId') {
            newFilters.kabupatenId = undefined;
        }
        // Reset jenisLembagaPenyedia when jenisLembaga changes
        if (key === 'jenisLembaga') {
            newFilters.jenisLembagaPenyedia = undefined;
        }

        onChange(newFilters);
    };

    const handleReset = () => {
        onChange({});
        message.info('Filter berhasil direset');
    };

    const kabupatenFiltered = filters.provinsiId
        ? options.kabupaten.filter(k => {
            const selected = Array.isArray(filters.provinsiId) ? filters.provinsiId : [filters.provinsiId];
            return selected.includes(k.provinsiId);
        })
        : options.kabupaten;

    return (
        <div style={{
            width: '100%',
            margin: '0 auto 32px auto',
            padding: '0 8px'
        }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Row 1: Tahun, Bulan, Provinsi, Kabupaten */}
                <Flex wrap="wrap" gap={16} align="center" justify="center">
                    {showFields.includes('tahun') && (
                        <Select
                            mode="multiple"
                            size="large"
                            placeholder="Tahun"
                            value={filters.tahun ? (Array.isArray(filters.tahun) ? filters.tahun : [filters.tahun]) : []}
                            onChange={(v) => handleChange('tahun', v.length > 0 ? v : undefined)}
                            allowClear
                            style={{ minWidth: 260, flex: 1 }}
                            maxTagCount="responsive"
                            options={options.tahun.map(y => ({ label: String(y), value: y }))}
                            loading={loading}
                        />
                    )}

                    {showFields.includes('bulan') && (
                        <Select
                            mode="multiple"
                            size="large"
                            placeholder="Bulan"
                            value={filters.bulan ? (Array.isArray(filters.bulan) ? filters.bulan : [filters.bulan]) : []}
                            onChange={(v) => handleChange('bulan', v.length > 0 ? v : undefined)}
                            allowClear
                            style={{ minWidth: 260, flex: 1 }}
                            maxTagCount="responsive"
                            options={options.bulan.map(b => ({ label: b.label, value: b.value }))}
                            loading={loading}
                        />
                    )}

                    {showFields.includes('provinsiId') && (
                        <Select
                            mode="multiple"
                            size="large"
                            showSearch
                            placeholder="Provinsi"
                            value={filters.provinsiId ? (Array.isArray(filters.provinsiId) ? filters.provinsiId : [filters.provinsiId]) : []}
                            onChange={(v) => handleChange('provinsiId', v.length > 0 ? v : undefined)}
                            allowClear
                            style={{ minWidth: 260, flex: 1 }}
                            maxTagCount="responsive"
                            options={options.provinsi.map(p => ({ label: p.nama, value: p.id }))}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            loading={loading}
                        />
                    )}

                    {showFields.includes('kabupatenId') && (
                        <Select
                            mode="multiple"
                            size="large"
                            showSearch
                            placeholder="Kabupaten"
                            value={filters.kabupatenId ? (Array.isArray(filters.kabupatenId) ? filters.kabupatenId : [filters.kabupatenId]) : []}
                            onChange={(v) => handleChange('kabupatenId', v.length > 0 ? v : undefined)}
                            allowClear
                            disabled={!filters.provinsiId}
                            style={{ minWidth: 260, flex: 1 }}
                            maxTagCount="responsive"
                            options={kabupatenFiltered.map(k => ({ label: k.nama, value: k.id }))}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            loading={loading}
                        />
                    )}
                </Flex>

                {/* Row 2: Lembaga, Jenis Lembaga, Produk Donasi, other fields, Reset */}
                <Flex wrap="wrap" gap={16} align="center" justify="center">
                    {showFields.includes('lembaga') && (
                        <Select
                            mode="multiple"
                            size="large"
                            showSearch
                            placeholder="Lembaga"
                            value={filters.lembaga ? (Array.isArray(filters.lembaga) ? filters.lembaga : [filters.lembaga]) : []}
                            onChange={(v) => handleChange('lembaga', v.length > 0 ? v : undefined)}
                            allowClear
                            style={{ minWidth: 260, flex: 1 }}
                            maxTagCount="responsive"
                            options={options.lembaga.map(l => ({ label: l.nama, value: l.nama }))}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                            }
                            loading={loading}
                        />
                    )}

                    {showFields.includes('jenisLembaga') && (
                        <Select
                            mode="multiple"
                            size="large"
                            placeholder="Jenis Lembaga"
                            value={filters.jenisLembaga ? (Array.isArray(filters.jenisLembaga) ? filters.jenisLembaga : [filters.jenisLembaga]) : []}
                            onChange={(v) => handleChange('jenisLembaga', v.length > 0 ? v : undefined)}
                            allowClear
                            style={{ minWidth: 260, flex: 1 }}
                            maxTagCount="responsive"
                            options={options.jenisLembaga.map(j => ({ label: j, value: j }))}
                            loading={loading}
                        />
                    )}

                    {showFields.includes('jenisLembagaPenyedia') && (
                        <Select
                            mode="multiple"
                            size="large"
                            placeholder="Jenis Lembaga Penyedia"
                            value={filters.jenisLembagaPenyedia ? (Array.isArray(filters.jenisLembagaPenyedia) ? filters.jenisLembagaPenyedia : [filters.jenisLembagaPenyedia]) : []}
                            onChange={(v) => handleChange('jenisLembagaPenyedia', v.length > 0 ? v : undefined)}
                            allowClear
                            style={{ minWidth: 260, flex: 1 }}
                            maxTagCount="responsive"
                            options={(options.jenisLembagaPenyedia || []).map(j => ({ label: j, value: j }))}
                            loading={loading}
                        />
                    )}

                    {showFields.includes('produkDonasi') && (
                        <Select
                            mode="multiple"
                            size="large"
                            showSearch
                            placeholder="Produk Donasi"
                            value={filters.produkDonasi ? (Array.isArray(filters.produkDonasi) ? filters.produkDonasi : [filters.produkDonasi]) : []}
                            onChange={(v) => handleChange('produkDonasi', v.length > 0 ? v : undefined)}
                            allowClear
                            style={{ minWidth: 220, flex: 1 }}
                            maxTagCount="responsive"
                            options={(options.produkDonasi || []).map((p: any) => ({ label: p.nama, value: p.id }))}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
                            }
                            loading={loading}
                        />
                    )}

                    <Button
                        size="large"
                        icon={<ReloadOutlined />}
                        onClick={handleReset}
                        style={{ height: 40, paddingInline: 24 }}
                    >
                        Reset
                    </Button>
                </Flex>
            </div>
        </div>
    );
};

export default FilterBar;
