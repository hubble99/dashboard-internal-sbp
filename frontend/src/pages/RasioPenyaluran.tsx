import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Spin, Typography, Result, Button, Card } from 'antd';
import { PercentageOutlined, RiseOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons';
import api from '../api/client';
import type { DashboardFilters, FilterOptions } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import KPICard from '../components/KPICard';
import FilterBar from '../components/FilterBar';
import PivotTable from '../components/PivotTable';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import CustomTooltip from '../components/CustomTooltip';

const { Title } = Typography;

interface RasioPageData {
    kpi: {
        totalPenyelamatan: number;
        totalPenyaluran: number;
        rasioPenyaluran: number;
        jumlahLembagaAktif: number;
    };
    chart: {
        lembaga: string;
        jenisLembaga: string;
        rasio: number;
        status: string;
    }[];
    table: {
        rows: any[];
        total: number;
        page: number;
        pageSize: number;
    };
}

const RasioPenyaluran: React.FC = () => {
    const { currentTheme } = useTheme();
    const [filters, setFilters] = useState<DashboardFilters>({});
    const [data, setData] = useState<RasioPageData | null>(null);
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
            const res = await api.get(`/dashboard/rasio-lembaga?${params}`);
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

    const getRasioColor = (value: number) => {
        if (value >= 80) return currentTheme.colors.semantic.success;
        if (value >= 50) return currentTheme.colors.semantic.warning;
        return currentTheme.colors.semantic.danger;
    };

    const chartHeight = data ? Math.max(300, data.chart.length * 40) : 300;
    const maxRasio = data ? Math.max(100, ...data.chart.map(d => d.rasio)) : 100;
    const chartDomainMax = Math.ceil(maxRasio / 10) * 10 + 10;

    return (
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 16px' }}>
            <Title level={4} style={{ marginBottom: 20, color: currentTheme.colors.text.primary }}>📊 Rasio Lembaga</Title>

            {/* Filter: tahun, bulan, jenisLembaga (tanpa filter individual lembaga) */}
            <FilterBar
                filters={filters}
                onChange={(f) => { setFilters(f); setPivotPage(1); }}
                showFields={['tahun', 'bulan', 'jenisLembaga']}
                options={filterOptions}
                loading={loading}
            />

            {data && (
                <>
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard title="Total Penyelamatan" value={data.kpi.totalPenyelamatan} icon={<RiseOutlined />} color={currentTheme.colors.brand.primary} suffix="Kg" />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard title="Total Penyaluran" value={data.kpi.totalPenyaluran} icon={<SendOutlined />} color={currentTheme.colors.semantic.success} suffix="Kg" />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard
                                title="Rasio Penyaluran"
                                value={data.kpi.rasioPenyaluran}
                                icon={<PercentageOutlined />}
                                color={getRasioColor(data.kpi.rasioPenyaluran)}
                                suffix="%"
                            />
                        </Col>
                        <Col xs={24} sm={12} lg={6}>
                            <KPICard title="Lembaga Aktif" value={data.kpi.jumlahLembagaAktif} icon={<TeamOutlined />} color={currentTheme.colors.semantic.warning} />
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24}>
                            <Card
                                title={<span style={{ fontSize: 14, fontWeight: 600 }}>Distribusi Rasio Penyaluran per Lembaga</span>}
                                style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                            >
                                <ResponsiveContainer width="100%" height={chartHeight}>
                                    <BarChart data={data.chart} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={currentTheme.colors.chart.grid} />
                                        <XAxis
                                            type="number"
                                            domain={[0, chartDomainMax]}
                                            tickFormatter={(v) => `${v}%`}
                                            tick={{ fontSize: 11, fill: currentTheme.colors.text.secondary }}
                                            stroke={currentTheme.colors.chart.grid}
                                        />
                                        <YAxis
                                            type="category"
                                            dataKey="lembaga"
                                            width={180}
                                            tick={{ fontSize: 11, fill: currentTheme.colors.text.secondary }}
                                            stroke={currentTheme.colors.chart.grid}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <ReferenceLine
                                            x={80}
                                            stroke={currentTheme.colors.semantic.danger}
                                            strokeDasharray="5 5"
                                            label={{ value: 'Target 80%', fill: currentTheme.colors.semantic.danger, fontSize: 11 }}
                                        />
                                        <Bar dataKey="rasio" name="Rasio (%)" radius={[0, 4, 4, 0]}>
                                            {data.chart.map((entry, index) => (
                                                <Cell key={index} fill={getRasioColor(entry.rasio)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </Card>
                        </Col>
                    </Row>

                    <Row gutter={[16, 16]}>
                        <Col xs={24}>
                            <PivotTable
                                title="Detail Rasio Lembaga"
                                columns={[
                                    { title: 'Lembaga', dataIndex: 'lembaga', key: 'lembaga', sorter: (a: any, b: any) => (a.lembaga || '').localeCompare(b.lembaga || '') },
                                    { title: 'Jenis Lembaga', dataIndex: 'jenisLembaga', key: 'jenisLembaga' },
                                    { title: 'Total Penyelamatan (Kg)', dataIndex: 'totalPenyelamatan', key: 'totalPenyelamatan', render: (v: number) => v.toLocaleString('id-ID'), align: 'right' as const, sorter: (a: any, b: any) => (a.totalPenyelamatan || 0) - (b.totalPenyelamatan || 0) },
                                    { title: 'Total Penyaluran (Kg)', dataIndex: 'totalPenyaluran', key: 'totalPenyaluran', render: (v: number) => v.toLocaleString('id-ID'), align: 'right' as const, sorter: (a: any, b: any) => (a.totalPenyaluran || 0) - (b.totalPenyaluran || 0) },
                                    { title: 'Rasio (%)', dataIndex: 'rasioPenyaluran', key: 'rasioPenyaluran', render: (v: number) => `${v.toFixed(2)}%`, align: 'right' as const, sorter: (a: any, b: any) => (a.rasioPenyaluran || 0) - (b.rasioPenyaluran || 0) },
                                    { title: 'Status', dataIndex: 'statusTarget', key: 'statusTarget' },
                                ]}
                                data={data.table.rows}
                                total={data.table.total}
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

export default RasioPenyaluran;
