import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

router.get('/options', async (req: Request, res: Response) => {
    try {
        const [
            provinsiPenyelamatan,
            provinsiPenyaluran,
            kabupatenPenyelamatan,
            kabupatenPenyaluran,
            tahunPenyelamatan,
            tahunPenyaluran,
            tahunRasio,
            lembagaPenyelamatan,
            lembagaPenyaluran,
            jenisLembagaPenyelamatan,
            jenisLembagaPenyaluran,
            jenisLembagaPenyediaList,
            produkDonasiList,
        ] = await Promise.all([
            // Provinsi
            prisma.factPenyelamatanPangan.findMany({ select: { provinsiId: true, provinsiNama: true }, distinct: ['provinsiId'] }),
            prisma.factPenyaluranPangan.findMany({ select: { provinsiId: true, provinsiNama: true }, distinct: ['provinsiId'] }),
            // Kabupaten
            prisma.factPenyelamatanPangan.findMany({ select: { kabupatenId: true, kabupatenNama: true, provinsiId: true }, distinct: ['kabupatenId'] }),
            prisma.factPenyaluranPangan.findMany({ select: { kabupatenId: true, kabupatenNama: true, provinsiId: true }, distinct: ['kabupatenId'] }),
            // Tahun
            prisma.factPenyelamatanPangan.findMany({ select: { tahun: true }, distinct: ['tahun'] }),
            prisma.factPenyaluranPangan.findMany({ select: { tahun: true }, distinct: ['tahun'] }),
            prisma.factRasioLembaga.findMany({ select: { tahun: true }, distinct: ['tahun'] }),
            // Lembaga
            prisma.factPenyelamatanPangan.findMany({ select: { lembagaId: true, lembagaNama: true }, distinct: ['lembagaId'] }),
            prisma.factPenyaluranPangan.findMany({ select: { lembagaId: true, lembagaNama: true }, distinct: ['lembagaId'] }),
            // Jenis Lembaga
            prisma.factPenyelamatanPangan.findMany({ select: { jenisLembaga: true }, distinct: ['jenisLembaga'] }),
            prisma.factPenyaluranPangan.findMany({ select: { jenisLembaga: true }, distinct: ['jenisLembaga'] }),
            // Jenis Lembaga Penyedia (hanya dari penyaluran, bukan "-")
            prisma.factPenyaluranPangan.findMany({
                select: { jenisLembagaPenyedia: true },
                distinct: ['jenisLembagaPenyedia'],
                where: { jenisLembagaPenyedia: { not: '-' } },
            }),
            // Produk Donasi (dari dim_produk_donasi)
            prisma.dimProdukDonasi.findMany({ orderBy: { nama: 'asc' } }),
        ]);

        // Merge & deduplicate provinsi
        const provinsiMap = new Map<string, string>();
        [...provinsiPenyelamatan, ...provinsiPenyaluran].forEach(p => {
            if (!provinsiMap.has(p.provinsiId)) provinsiMap.set(p.provinsiId, p.provinsiNama);
        });
        const provinsi = Array.from(provinsiMap.entries())
            .map(([id, nama]) => ({ id, nama }))
            .sort((a, b) => a.nama.localeCompare(b.nama));

        // Merge & deduplicate kabupaten
        const kabupatenMap = new Map<string, { nama: string; provinsiId: string }>();
        [...kabupatenPenyelamatan, ...kabupatenPenyaluran].forEach(k => {
            if (!kabupatenMap.has(k.kabupatenId)) kabupatenMap.set(k.kabupatenId, { nama: k.kabupatenNama, provinsiId: k.provinsiId });
        });
        const kabupaten = Array.from(kabupatenMap.entries())
            .map(([id, v]) => ({ id, nama: v.nama, provinsiId: v.provinsiId }))
            .sort((a, b) => a.nama.localeCompare(b.nama));

        // Merge & deduplicate tahun
        const tahunSet = new Set<number>();
        [...tahunPenyelamatan, ...tahunPenyaluran, ...tahunRasio].forEach(t => tahunSet.add(t.tahun));
        const tahun = Array.from(tahunSet).sort();

        // Merge & deduplicate lembaga
        const lembagaMap = new Map<string, string>();
        [...lembagaPenyelamatan, ...lembagaPenyaluran].forEach(l => {
            if (!lembagaMap.has(l.lembagaId)) lembagaMap.set(l.lembagaId, l.lembagaNama);
        });
        const lembaga = Array.from(lembagaMap.entries())
            .map(([id, nama]) => ({ id, nama }))
            .sort((a, b) => a.nama.localeCompare(b.nama));

        // Merge & deduplicate jenis lembaga
        const jenisSet = new Set<string>();
        [...jenisLembagaPenyelamatan, ...jenisLembagaPenyaluran].forEach(j => jenisSet.add(j.jenisLembaga));
        const jenisLembaga = Array.from(jenisSet).sort();

        // Jenis lembaga penyedia (untuk filter Transaksi Mandiri)
        const jenisLembagaPenyedia = jenisLembagaPenyediaList
            .map(j => j.jenisLembagaPenyedia)
            .sort();

        return sendSuccess(res, {
            provinsi,
            kabupaten,
            tahun,
            bulan: Array.from({ length: 12 }, (_, i) => ({
                value: i + 1,
                label: new Date(2000, i).toLocaleString('id-ID', { month: 'long' }),
            })),
            lembaga,
            jenisLembaga,
            jenisLembagaPenyedia,
            produkDonasi: produkDonasiList.map(p => ({ id: String(p.id), nama: p.nama })),
            lembagaPenyedia: [],
        });
    } catch (error: any) {
        return sendError(res, error.message, 500);
    }
});

export default router;
