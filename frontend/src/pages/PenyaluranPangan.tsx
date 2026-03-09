import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Spin, Typography, Result, Button } from 'antd';
import {
    SendOutlined,
    BankOutlined,
    EnvironmentOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import api from '../api/client';
import type { DashboardFilters, PenyaluranPageData, FilterOptions } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import KPICard from '../components/KPICard';
import FilterBar from '../components/FilterBar';
import TrendLineChart from '../components/Charts/TrendLineChart';
import TopBarChart from '../components/Charts/TopBarChart';
import PivotTable from '../components/PivotTable';

const { Title } = Typography;

const PenyaluranPangan: React.FC = () => {
    const { currentTheme } = useTheme();
    const [filters, setFilters] = useState<DashboardFilters>({});
    const [data, setData] = useState<PenyaluranPageData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pivotProvPage, setPivotProvPage] = useState(1);
    const [pivotProvPageSize, setPivotProvPageSize] = useState(20);
    const [pivotPenerimaPage, setPivotPenerimaPage] = useState(1);
    const [pivotPenerimaPageSize, setPivotPenerimaPageSize] = useState(20);
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
            params.append('page', String(pivotProvPage));
            params.append('pageSize', String(pivotProvPageSize));
            const res = await api.get(`/dashboard/penyaluran-pangan?${params}`);
            setData(res.data.data);
        } catch (err: any) {
            console.error('Failed to fetch data', err);
            setError(err.response?.data?.message || 'Gagal memuat data. Silakan coba lagi.');
        } finally {
            setLoading(false);
        }
    }, [filters, pivotProvPage, pivotProvPageSize]);

    useEffect(() => { fetchData(); }, [fetchData]);

    useEffect(() => {
        const handler = () => fetchData();
        window.addEventListener('dashboard-refresh', handler);
        return () => window.removeEventListener('dashboard-refresh', handler);
    }, [fetchData]);

    useEffect(() => {
        api.get('/filters/options').then(res => setFilterOptions(res.data.data)).catch(() => { });
    }, []);

    // Pivot penerima fetch separately to avoid re-fetching all data
    const [pivotPenerimaData, setPivotPenerimaData] = useState<any>(null);
    useEffect(() => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined) {
                if (Array.isArray(v)) v.forEach(item => params.append(k, String(item)));
                else params.append(k, String(v));
            }
        });
        params.append('page', String(pivotPenerimaPage));
        params.append('pageSize', String(pivotPenerimaPageSize));
        api.get(`/dashboard/penyaluran-pangan?${params}`)
            .then(res => setPivotPenerimaData(res.data.data?.pivotPenerima))
            .catch(() => { });
    }, [filters, pivotPenerimaPage, pivotPenerimaPageSize]);

    // Determine which filter fields to show (conditional jenisLembagaPenyedia)
    const showFields = useMemo(() => {
        const base = ['tahun', 'bulan', 'provinsiId', 'kabupatenId', 'lembaga', 'jenisLembaga', 'produkDonasi'];
        const selectedJenis = Array.isArray(filters.jenisLembaga)
            ? filters.jenisLembaga
            : filters.jenisLembaga ? [filters.jenisLembaga] : [];
        if (selectedJenis.includes('Transaksi Mandiri') || selectedJenis.length === 0) {
            base.push('jenisLembagaPenyedia');
        }
        return base;
    }, [filters.jenisLembaga]);

    const handleFilterChange = (f: DashboardFilters) => {
        setFilters(f);
        setPivotProvPage(1);
        setPivotPenerimaPage(1);
    };

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
            <Title level={4} style={{ marginBottom: 20, color: currentTheme.colors.text.primary }}>🚚 Penyaluran Pangan</Title>

            <FilterBar
                filters={filters}
                onChange={handleFilterChange}
                showFields={showFields}
                options={filterOptions}
                loading={loading}
            />

            {data && (
                <>
                    {/* ── Row 1: KPI Cards ─────────────────────────────────── */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard
                                title="Total Penyaluran"
                                value={data.kpi.totalPenyaluran}
                                icon={<SendOutlined />}
                                color={currentTheme.colors.brand.primary}
                                suffix="Kg"
                            />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard
                                title="Total Penerima Manfaat"
                                value={data.kpi.totalPenerimaManfaat}
                                icon={<TeamOutlined />}
                                color={currentTheme.colors.semantic.success}
                                suffix="Jiwa"
                            />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard
                                title="Lembaga Aktif"
                                value={data.kpi.jumlahLembagaAktif}
                                icon={<BankOutlined />}
                                color={currentTheme.colors.semantic.warning}
                            />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard
                                title="Jumlah Provinsi"
                                value={data.kpi.jumlahProvinsi}
                                icon={<EnvironmentOutlined />}
                                color={currentTheme.colors.semantic.info}
                            />
                        </Col>
                    </Row>

                    {/* ── Row 2: Trend Chart Penyaluran (Kg) ───────────────── */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24}>
                            <TrendLineChart
                                data={data.chartBulan.map(d => ({ label: d.label, value: d.jumlahKg || 0 }))}
                                title="Tren Penyaluran Per Bulan (Kg)"
                                color={currentTheme.colors.brand.primary}
                                yAxisLabel="Jumlah (Kg)"
                            />
                        </Col>
                    </Row>

                    {/* ── Row 3: Trend Chart Penerima Manfaat ──────────────── */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24}>
                            <TrendLineChart
                                data={data.chartPenerima.map(d => ({ label: d.label, value: d.jumlahPenerima || 0 }))}
                                title="Tren Penerima Manfaat Per Bulan"
                                color={currentTheme.colors.semantic.success}
                                yAxisLabel="Jumlah Penerima (Jiwa)"
                            />
                        </Col>
                    </Row>

                    {/* ── Row 4: Top Charts (Penyaluran Kg) ────────────────── */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <TopBarChart
                                data={data.topLembaga.map(d => ({ name: d.lembagaNama || '', value: d.jumlahKg || 0 }))}
                                title="Top 10 Lembaga Penyalur (Kg)"
                                color={currentTheme.colors.brand.primary}
                            />
                        </Col>
                        <Col xs={24} lg={12}>
                            <TopBarChart
                                data={data.topProvinsi.map(d => ({ name: d.provinsiNama || '', value: d.jumlahKg || 0 }))}
                                title="Top 10 Provinsi Penerima (Kg)"
                                color={currentTheme.colors.semantic.warning}
                            />
                        </Col>
                    </Row>

                    {/* ── Row 5: Top Charts (Penerima Manfaat) ─────────────── */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} lg={12}>
                            <TopBarChart
                                data={(data.topLembagaPenerima || []).map(d => ({ name: d.lembagaNama || '', value: d.jumlahPenerima || 0 }))}
                                title="Top 10 Lembaga Penerima Terbanyak"
                                color={currentTheme.colors.semantic.success}
                            />
                        </Col>
                        <Col xs={24} lg={12}>
                            <TopBarChart
                                data={(data.topProvinsiPenerima || []).map(d => ({ name: d.provinsiNama || '', value: d.jumlahPenerima || 0 }))}
                                title="Top 10 Provinsi Penerima Terbanyak"
                                color={currentTheme.colors.semantic.info}
                            />
                        </Col>
                    </Row>

                    {/* ── Row 6: Pivot Tables ───────────────────────────────── */}
                    <Row gutter={[16, 16]}>
                        <Col xs={24} lg={12}>
                            <PivotTable
                                title="Pivot: Penyaluran (Lembaga × Provinsi)"
                                columns={[
                                    { title: 'Lembaga', dataIndex: 'lembaga', key: 'lembaga', sorter: (a: any, b: any) => (a.lembaga || '').localeCompare(b.lembaga || '') },
                                    { title: 'Provinsi', dataIndex: 'provinsi', key: 'provinsi', sorter: (a: any, b: any) => (a.provinsi || '').localeCompare(b.provinsi || '') },
                                    { title: 'Jumlah (Kg)', dataIndex: 'jumlahKg', key: 'jumlahKg', render: (v: number) => v.toLocaleString('id-ID'), align: 'right' as const, sorter: (a: any, b: any) => (a.jumlahKg || 0) - (b.jumlahKg || 0) },
                                ]}
                                data={data.pivotProvinsi.rows}
                                total={data.pivotProvinsi.total}
                                grandTotal={data.pivotProvinsi.grandTotal}
                                grandTotalField="jumlahKg"
                                grandTotalLabel="Grand Total (Kg)"
                                page={pivotProvPage}
                                pageSize={pivotProvPageSize}
                                loading={loading}
                                onPageChange={(p, sz) => {
                                    setPivotProvPage(p);
                                    if (sz !== pivotProvPageSize) setPivotProvPageSize(sz);
                                }}
                            />
                        </Col>
                        <Col xs={24} lg={12}>
                            <PivotTable
                                title="Pivot: Penerima Manfaat (Lembaga × Provinsi)"
                                columns={[
                                    { title: 'Lembaga', dataIndex: 'lembaga', key: 'lembaga', sorter: (a: any, b: any) => (a.lembaga || '').localeCompare(b.lembaga || '') },
                                    { title: 'Provinsi', dataIndex: 'provinsi', key: 'provinsi', sorter: (a: any, b: any) => (a.provinsi || '').localeCompare(b.provinsi || '') },
                                    { title: 'Penerima', dataIndex: 'jumlahPenerima', key: 'jumlahPenerima', render: (v: number) => v.toLocaleString('id-ID'), align: 'right' as const, sorter: (a: any, b: any) => (a.jumlahPenerima || 0) - (b.jumlahPenerima || 0) },
                                ]}
                                data={pivotPenerimaData?.rows || data.pivotPenerima?.rows || []}
                                total={pivotPenerimaData?.total || data.pivotPenerima?.total || 0}
                                grandTotal={pivotPenerimaData?.grandTotal || data.pivotPenerima?.grandTotal || 0}
                                grandTotalField="jumlahPenerima"
                                grandTotalLabel="Grand Total (Jiwa)"
                                page={pivotPenerimaPage}
                                pageSize={pivotPenerimaPageSize}
                                loading={loading}
                                onPageChange={(p, sz) => {
                                    setPivotPenerimaPage(p);
                                    if (sz !== pivotPenerimaPageSize) setPivotPenerimaPageSize(sz);
                                }}
                            />
                        </Col>
                    </Row>

                    {/* ── Row 7: Pivot Produk Donasi ───────────────────────── */}
                    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                        <Col xs={24}>
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
                                page={pivotProvPage}
                                pageSize={pivotProvPageSize}
                                loading={loading}
                                onPageChange={(p, sz) => {
                                    setPivotProvPage(p);
                                    if (sz !== pivotProvPageSize) setPivotProvPageSize(sz);
                                }}
                            />
                        </Col>
                    </Row>
                </>
            )}
        </div>
    );
};

export default PenyaluranPangan;
