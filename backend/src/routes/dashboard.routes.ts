import { Router, Request, Response } from 'express';
import { sendSuccess, sendError } from '../utils/response';

import * as penyelamatanService from '../services/penyelamatan.service';
import * as penyaluranService from '../services/penyaluran.service';
import * as rasioService from '../services/rasio.service';

const router = Router();

// Helper: parse common filters from query params
function parseFilters(query: any) {
    const parseValue = (value: any): number | number[] | undefined => {
        if (value === undefined) return undefined;
        if (Array.isArray(value)) return value.map(v => parseInt(v));
        if (typeof value === 'string' && !isNaN(Number(value))) return parseInt(value);
        return typeof value === 'number' ? value : undefined;
    };
    const parseStringValue = (value: any): string | string[] | undefined => {
        if (value === undefined) return undefined;
        if (Array.isArray(value)) return value as string[];
        return value as string;
    };

    return {
        provinsiId: parseStringValue(query.provinsiId),
        kabupatenId: parseStringValue(query.kabupatenId),
        tahun: parseValue(query.tahun),
        bulan: parseValue(query.bulan),
        lembaga: parseStringValue(query.lembaga),
        jenisLembaga: parseStringValue(query.jenisLembaga),
        jenisLembagaPenyedia: parseStringValue(query.jenisLembagaPenyedia),
        produkDonasi: parseStringValue(query.produkDonasi),
    };
}

function parsePagination(query: any) {
    return {
        page: query.page ? parseInt(query.page as string) : 1,
        pageSize: query.pageSize ? parseInt(query.pageSize as string) : 20,
        sortField: query.sortField as string | undefined,
        sortOrder: (query.sortOrder as 'asc' | 'desc') || 'desc',
    };
}

// ─── Page 1: Penyelamatan Pangan ─────────────────────────────────
router.get('/penyelamatan-pangan', async (req: Request, res: Response) => {
    try {
        const filters = parseFilters(req.query);
        const pagination = parsePagination(req.query);

        const [kpi, chartBulan, topLembaga, topProvinsi, pivotProduk, pivotProvinsi] = await Promise.all([
            penyelamatanService.getPenyelamatanKPI(filters),
            penyelamatanService.getPenyelamatanChartPerBulan(filters),
            penyelamatanService.getPenyelamatanTopLembaga(filters),
            penyelamatanService.getPenyelamatanTopProvinsi(filters),
            penyelamatanService.getPenyelamatanPivotProduk(filters, pagination),
            penyelamatanService.getPenyelamatanPivotProvinsi(filters, pagination),
        ]);

        return sendSuccess(res, { kpi, chartBulan, topLembaga, topProvinsi, pivotProduk, pivotProvinsi });
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
});

// ─── Page 2: Penyaluran Pangan ───────────────────────────────────
router.get('/penyaluran-pangan', async (req: Request, res: Response) => {
    try {
        const filters = parseFilters(req.query);
        const pagination = parsePagination(req.query);

        const [
            kpi,
            chartBulan,
            chartPenerima,
            topLembaga,
            topProvinsi,
            topLembagaPenerima,
            topProvinsiPenerima,
            pivotProvinsi,
            pivotPenerima,
            pivotProduk,
        ] = await Promise.all([
            penyaluranService.getPenyaluranKPI(filters),
            penyaluranService.getPenyaluranChartPerBulan(filters),
            penyaluranService.getPenyaluranChartPenerimaPerBulan(filters),
            penyaluranService.getPenyaluranTopLembaga(filters),
            penyaluranService.getPenyaluranTopProvinsi(filters),
            penyaluranService.getPenyaluranTopLembagaPenerima(filters),
            penyaluranService.getPenyaluranTopProvinsiPenerima(filters),
            penyaluranService.getPenyaluranPivotProvinsi(filters, pagination),
            penyaluranService.getPenyaluranPivotPenerima(filters, pagination),
            penyaluranService.getPenyaluranPivotProduk(filters, pagination),
        ]);

        return sendSuccess(res, {
            kpi,
            chartBulan,
            chartPenerima,
            topLembaga,
            topProvinsi,
            topLembagaPenerima,
            topProvinsiPenerima,
            pivotProvinsi,
            pivotPenerima,
            pivotProduk,
        });
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
});

// ─── Page 3: Rasio Lembaga ────────────────────────────────────────
router.get('/rasio-lembaga', async (req: Request, res: Response) => {
    try {
        const filters = {
            tahun: req.query.tahun ? (Array.isArray(req.query.tahun) ? (req.query.tahun as string[]).map(Number) : parseInt(req.query.tahun as string)) : undefined,
            bulan: req.query.bulan ? (Array.isArray(req.query.bulan) ? (req.query.bulan as string[]).map(Number) : parseInt(req.query.bulan as string)) : undefined,
            jenisLembaga: req.query.jenisLembaga as string | string[] | undefined,
        };
        const pagination = parsePagination(req.query);

        const [kpi, chart, table] = await Promise.all([
            rasioService.getRasioKPI(filters),
            rasioService.getRasioDistribusiChart(filters),
            rasioService.getRasioTable(filters, pagination),
        ]);

        return sendSuccess(res, { kpi, chart, table });
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
});

export default router;
