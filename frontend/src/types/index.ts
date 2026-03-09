// ─── Auth ──────────────────────────────────────────────
export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponse {
    token: string;
    user: { id: string; email: string; nama: string };
}

// ─── Common ────────────────────────────────────────────
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

export interface PivotResponse<T> {
    rows: T[];
    total: number;
    grandTotal: number;
    page: number;
    pageSize: number;
}

export interface ChartDataPoint {
    tahun: number;
    bulan: number;
    label: string;
    jumlahKg?: number;
    jumlahPenerima?: number;
}

export interface TopItem {
    lembagaNama?: string;
    provinsiNama?: string;
    jumlahKg?: number;
    jumlahPenerima?: number;
}

// ─── Dashboard Filters ─────────────────────────────────
export interface DashboardFilters {
    provinsiId?: string | string[];
    kabupatenId?: string | string[];
    tahun?: number | number[];
    bulan?: number | number[];
    lembaga?: string | string[];
    jenisLembaga?: string | string[];
    jenisLembagaPenyedia?: string | string[];
    produkDonasi?: string | string[];  // ID produk dari dim_produk_donasi
}

// ─── Filter Options ────────────────────────────────────
export interface FilterOptions {
    provinsi: { id: string; nama: string }[];
    kabupaten: { id: string; nama: string; provinsiId: string }[];
    tahun: number[];
    bulan: { value: number; label: string }[];
    lembaga: { id: string; nama: string }[];
    jenisLembaga: string[];
    jenisLembagaPenyedia: string[];
    produkDonasi: { id: string; nama: string }[];   // dari dim_produk_donasi
    lembagaPenyedia: { id: string; nama: string }[];  // kept for backward compat
}

// ─── KPI Types ─────────────────────────────────────────
export interface PenyelamatanKPI {
    totalPenyelamatan: number;
    jumlahLembagaAktif: number;
    jumlahProvinsi: number;
    jumlahKabupaten: number;
}

export interface PenyaluranKPI {
    totalPenyaluran: number;
    totalPenerimaManfaat: number;
    jumlahLembagaAktif: number;
    jumlahProvinsi: number;
    jumlahKabupaten: number;
}

export interface RasioKPI {
    totalPenyelamatan: number;
    totalPenyaluran: number;
    rasioPenyaluran: number;
    jumlahLembagaAktif: number;
}

// ─── Pivot Row Types ───────────────────────────────────
export interface PivotProvinsiRow {
    lembaga: string;
    provinsi: string;
    jumlahKg: number;
}

export interface PivotJenisRow {
    lembaga: string;
    jenisLembaga: string;
    jumlahKg: number;
}

export interface PivotPenerimaRow {
    lembaga: string;
    provinsi: string;
    jumlahPenerima: number;
}

export interface PivotProdukRow {
    lembagaNama: string;
    produkDonasi: string;
    jumlahKg: number;
}

export interface RasioChartItem {
    lembaga: string;
    jenisLembaga: string;
    rasio: number;
    status: string;
}

export interface RasioTableRow {
    lembaga: string;
    jenisLembaga: string;
    totalPenyelamatan: number;
    totalPenyaluran: number;
    rasioPenyaluran: number;
    statusTarget: string;
}

// ─── Full Dashboard Page Data ──────────────────────────
export interface PenyelamatanPageData {
    kpi: PenyelamatanKPI;
    chartBulan: ChartDataPoint[];
    topLembaga: TopItem[];
    topProvinsi: TopItem[];
    pivotProduk: PivotResponse<PivotProdukRow>;
    pivotProvinsi: PivotResponse<PivotProvinsiRow>;
}

export interface PenyaluranPageData {
    kpi: PenyaluranKPI;
    chartBulan: ChartDataPoint[];
    chartPenerima: ChartDataPoint[];
    topLembaga: TopItem[];
    topProvinsi: TopItem[];
    topLembagaPenerima: TopItem[];
    topProvinsiPenerima: TopItem[];
    pivotProvinsi: PivotResponse<PivotProvinsiRow>;
    pivotPenerima: PivotResponse<PivotPenerimaRow>;
    pivotProduk: PivotResponse<PivotProdukRow>;
}

export interface RasioPageData {
    kpi: RasioKPI;
    chart: RasioChartItem[];
    table: {
        rows: RasioTableRow[];
        total: number;
        page: number;
        pageSize: number;
    };
}
