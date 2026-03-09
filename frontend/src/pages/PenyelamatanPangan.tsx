import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, Typography, Result, Button } from 'antd';
import { DashboardOutlined, BankOutlined, EnvironmentOutlined, HomeOutlined } from '@ant-design/icons';
import api from '../api/client';
import type { DashboardFilters, PenyelamatanPageData, FilterOptions } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import KPICard from '../components/KPICard';
import FilterBar from '../components/FilterBar';
import TrendLineChart from '../components/Charts/TrendLineChart';
import TopBarChart from '../components/Charts/TopBarChart';
import PivotTable from '../components/PivotTable';

const { Title } = Typography;

const PenyelamatanPangan: React.FC = () => {
    const { currentTheme } = useTheme();
    const [filters, setFilters] = useState<DashboardFilters>({});
    const [data, setData] = useState<PenyelamatanPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pivotPage, setPivotPage] = useState(1);
    const [pivotPageSize, setPivotPageSize] = useState(20);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({
        provinsi: [], kabupaten: [], tahun: [], bulan: [],
        lembaga: [], jenisLembaga: [], jenisLembagaPenyedia: [],
        produkDonasi: [], lembagaPenyedia: [],
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            Object.entries(filters).forEach(([k, v]) => {
                if (v !== undefined) {
                    if (Array.isArray(v)) v.forEach(item => params.append(k, String(item)));
                    else params.append(k, String(v));
                }
            });
            params.append('page', String(pivotPage));
            params.append('pageSize', String(pivotPageSize));
            const res = await api.get(`/dashboard/penyelamatan-pangan?${params}`);
            setData(res.data.data);
        } catch (err: any) {
            console.error('Failed to fetch data', err);
            setError(err.response?.data?.message || 'Gagal memuat data. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    }, [filters, pivotPage, pivotPageSize]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const handler = () => fetchData();
        window.addEventListener('dashboard-refresh', handler);
        return () => window.removeEventListener('dashboard-refresh', handler);
    }, [fetchData]);

    useEffect(() => {
        api.get('/filters/options').then(res => setFilterOptions(res.data.data)).catch(() => { });
    }, []);

    if (error && !data) return (
        <Result
            status="error"
            title="Gagal Memuat Data"
            subTitle={error}
            extra={<Button type="primary" onClick={fetchData}>Coba Lagi</Button>}
        />
    );

    if (loading && !data) return <Spin size="large" style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }} />;

    return (
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 16px' }}>
            <Title level={4} style={{ marginBottom: 20, color: currentTheme.colors.text.primary }}>🛡️ Penyelamatan Pangan</Title>

            <FilterBar
                filters={filters}
                onChange={(f) => { setFilters(f); setPivotPage(1); }}
                showFields={['tahun', 'bulan', 'provinsiId', 'kabupatenId', 'lembaga', 'jenisLembaga', 'produkDonasi']}
                options={filterOptions}
                loading={loading}
            />

            {data && (
                <>
                    {/* ── KPI Cards ─────────────────────────────────────────── */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard title="Total Penyelamatan" value={data.kpi.totalPenyelamatan} icon={<DashboardOutlined />} color={currentTheme.colors.brand.primary} suffix="Kg" />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard title="Lembaga Aktif" value={data.kpi.jumlahLembagaAktif} icon={<BankOutlined />} color={currentTheme.colors.semantic.success} />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard title="Jumlah Provinsi" value={data.kpi.jumlahProvinsi} icon={<EnvironmentOutlined />} color={currentTheme.colors.semantic.warning} />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard title="Jumlah Kabupaten" value={data.kpi.jumlahKabupaten} icon={<HomeOutlined />} color={currentTheme.colors.semantic.danger} />
                        </Col>
                    </Row>

                    {/* ── Trend Chart ───────────────────────────────────────── */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24}>
                            <TrendLineChart
                                data={data.chartBulan.map(d => ({ label: d.label, value: d.jumlahKg || 0 }))}
                                title="Tren Penyelamatan Per Bulan"
                                color={currentTheme.colors.brand.primary}
                                yAxisLabel="Jumlah (Kg)"
                            />
                        </Col>
                    </Row>

                    {/* ── Top Charts ────────────────────────────────────────── */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <TopBarChart
                                data={data.topLembaga.map(d => ({ name: d.lembagaNama || '', value: d.jumlahKg || 0 }))}
                                title="Top 10 Lembaga Penyelamat"
                                color={currentTheme.colors.brand.primary}
                            />
                        </Col>
                        <Col xs={24} lg={12}>
                            <TopBarChart
                                data={data.topProvinsi.map(d => ({ name: d.provinsiNama || '', value: d.jumlahKg || 0 }))}
                                title="Top 10 Provinsi"
                                color={currentTheme.colors.semantic.warning}
                            />
                        </Col>
                    </Row>

                    {/* ── Pivot Tables ──────────────────────────────────────── */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <PivotTable
                                title="Pivot: Lembaga × Produk Donasi"
                                columns={[
                                    { title: 'Lembaga', dataIndex: 'lembagaNama', key: 'lembagaNama', sorter: (a: any, b: any) => (a.lembagaNama || '').localeCompare(b.lembagaNama || '') },
                                    { title: 'Produk Donasi', dataIndex: 'produkDonasi', key: 'produkDonasi', sorter: (a: any, b: any) => (a.produkDonasi || '').localeCompare(b.produkDonasi || '') },
                                    { title: 'Jumlah (Kg)', dataIndex: 'jumlahKg', key: 'jumlahKg', render: (v: number) => v.toLocaleString('id-ID'), align: 'right' as const, sorter: (a: any, b: any) => (a.jumlahKg || 0) - (b.jumlahKg || 0) },
                                ]}
                                data={data.pivotProduk?.rows || []}
                                total={data.pivotProduk?.total || 0}
                                grandTotal={data.pivotProduk?.grandTotal || 0}
                                grandTotalField="jumlahKg"
                                grandTotalLabel="Grand Total (Kg)"
                                page={pivotPage}
                                pageSize={pivotPageSize}
                                loading={loading}
                                onPageChange={(p, sz) => {
                                    setPivotPage(p);
                                    if (sz !== pivotPageSize) setPivotPageSize(sz);
                                }}
                            />
                        </Col>
                        <Col xs={24} lg={12}>
                            <PivotTable
                                title="Pivot: Lembaga × Provinsi"
                                columns={[
                                    { title: 'Lembaga', dataIndex: 'lembaga', key: 'lembaga', sorter: (a: any, b: any) => (a.lembaga || '').localeCompare(b.lembaga || '') },
                                    { title: 'Provinsi', dataIndex: 'provinsi', key: 'provinsi', sorter: (a: any, b: any) => (a.provinsi || '').localeCompare(b.provinsi || '') },
                                    { title: 'Jumlah (Kg)', dataIndex: 'jumlahKg', key: 'jumlahKg', render: (v: number) => v.toLocaleString('id-ID'), align: 'right' as const, sorter: (a: any, b: any) => (a.jumlahKg || 0) - (b.jumlahKg || 0) },
                                ]}
                                data={data.pivotProvinsi?.rows || []}
                                total={data.pivotProvinsi?.total || 0}
                                grandTotal={data.pivotProvinsi?.grandTotal || 0}
                                grandTotalField="jumlahKg"
                                grandTotalLabel="Grand Total (Kg)"
                                page={pivotPage}
                                pageSize={pivotPageSize}
                                loading={loading}
                                onPageChange={(p, sz) => {
                                    setPivotPage(p);
                                    if (sz !== pivotPageSize) setPivotPageSize(sz);
                                }}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default PenyelamatanPangan;
