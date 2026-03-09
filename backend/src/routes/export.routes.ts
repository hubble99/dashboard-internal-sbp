import { Router, Request, Response } from 'express';
import { generateExcelExport, ExportFilters } from '../services/export.service';

const router = Router();

// GET /api/v1/export
// Query params:
//   tahun     = "2024,2025"
//   bulan     = "1,2,3"    (opsional, kosong = semua bulan)
//   jenisLembaga = "Penggiat" (opsional)
router.get('/', async (req: Request, res: Response) => {
    try {
        const tahunParam = req.query.tahun as string;
        const bulanParam = req.query.bulan as string;

        const filters: ExportFilters = {
            tahun: tahunParam ? tahunParam.split(',').map(Number) : undefined,
            bulan: bulanParam ? bulanParam.split(',').map(Number) : undefined,
            jenisLembaga: req.query.jenisLembaga as string | undefined,
        };

        const buffer = await generateExcelExport(filters);

        // Buat nama file deskriptif
        const tahunStr = filters.tahun?.join('-') || 'semua';
        const dateStr = new Date().toISOString().slice(0, 10);
        const filename = `SBP_Export_${tahunStr}_${dateStr}.xlsx`;

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    } catch (error: any) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, message: 'Gagal generate export: ' + error.message });
    }
});

export default router;
