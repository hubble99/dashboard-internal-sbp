import axios from 'axios';
import { config } from '../config/env';
import prisma from '../lib/prisma';

export async function refreshAllData() {
    const baseUrl = config.mockApiBaseUrl;

    // 1. Fetch semua data dari mock/developer API (1 call per dataset)
    const [produkRes, penyelamatanRes, penyaluranRes, rasioRes] = await Promise.all([
        axios.get(`${baseUrl}/produk-donasi`),
        axios.get(`${baseUrl}/penyelamatan-pangan`),
        axios.get(`${baseUrl}/penyaluran-pangan`),
        axios.get(`${baseUrl}/rasio-lembaga`),
    ]);

    // 2. Transformasi dan simpan ke database dalam satu transaksi
    await prisma.$transaction(async (tx) => {
        // ── Clear semua fact tables ──────────────────────────────
        await tx.factPenyelamatanPangan.deleteMany();
        await tx.factPenyaluranPangan.deleteMany();
        await tx.factRasioLembaga.deleteMany();
        await tx.dimProdukDonasi.deleteMany();

        // ── Insert dim_produk_donasi ─────────────────────────────
        const produkData = produkRes.data.data.map((p: any) => ({
            id: p.id,
            nama: p.nama,
        }));
        if (produkData.length > 0) {
            await tx.dimProdukDonasi.createMany({ data: produkData });
        }

        // ── Insert fact_penyelamatan_pangan ──────────────────────
        const penyelamatanData = penyelamatanRes.data.data.map((r: any) => ({
            tanggalSalur: new Date(r.tanggal_penyelamatan),
            tahun: r.tahun,
            bulan: r.bulan,
            provinsiId: String(r.provinsi_id),    // BPS code sebagai string
            provinsiNama: r.provinsi_nama,
            kabupatenId: String(r.kabupaten_id),  // BPS code sebagai string
            kabupatenNama: r.kabupaten_nama,
            lembagaId: String(r.lembaga_id),      // ID internal sebagai string
            lembagaNama: r.lembaga_nama,
            jenisLembaga: r.jenis_lembaga,
            produkDonasi: r.produk_donasi,        // JSON object langsung
            jumlahKg: r.jumlah_kg,
        }));
        if (penyelamatanData.length > 0) {
            await tx.factPenyelamatanPangan.createMany({ data: penyelamatanData });
        }

        // ── Insert fact_penyaluran_pangan ────────────────────────
        // Sudah mencakup Penggiat + Transaksi Mandiri dalam satu dataset
        const penyaluranData = penyaluranRes.data.data.map((r: any) => ({
            tanggalSalur: new Date(r.tanggal_salur),
            tahun: r.tahun,
            bulan: r.bulan,
            provinsiId: String(r.provinsi_id),
            provinsiNama: r.provinsi_nama,
            kabupatenId: String(r.kabupaten_id),
            kabupatenNama: r.kabupaten_nama,
            lembagaId: String(r.lembaga_id),
            lembagaNama: r.lembaga_nama,
            jenisLembaga: r.jenis_lembaga,
            jenisLembagaPenyedia: r.jenis_lembaga_penyedia || '-',
            produkDonasi: r.produk_donasi,
            jumlahKg: r.jumlah_kg,
            jumlahPenerimaManfaat: r.jumlah_penerima_manfaat || 0,
        }));
        if (penyaluranData.length > 0) {
            await tx.factPenyaluranPangan.createMany({ data: penyaluranData });
        }

        // ── Insert fact_rasio_lembaga ────────────────────────────
        // bulan di API bisa berupa Int (1-12) atau String (nama bulan)
        const BULAN_MAP: Record<string, number> = {
            'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
            'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
            'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12,
        };

        const rasioData = rasioRes.data.data.map((r: any) => {
            const bulan = typeof r.bulan === 'string'
                ? (BULAN_MAP[r.bulan] ?? parseInt(r.bulan) ?? 1)
                : r.bulan;
            return {
                tahun: r.tahun,
                bulan,
                lembagaId: String(r.lembaga_id),
                lembagaNama: r.lembaga_nama,
                jenisLembaga: r.jenis_lembaga,
                totalPenyelamatan: r.total_penyelamatan,
                totalPenyaluran: r.total_penyaluran,
                rasioPenyaluran: r.rasio_penyaluran,
            };
        });
        if (rasioData.length > 0) {
            await tx.factRasioLembaga.createMany({ data: rasioData });
        }

        // ── Update last refresh timestamp ────────────────────────
        await tx.systemMeta.upsert({
            where: { key: 'last_refresh' },
            update: { value: new Date().toISOString() },
            create: { key: 'last_refresh', value: new Date().toISOString() },
        });
    });

    return { message: 'Data berhasil diperbarui' };
}

export async function getLastRefresh() {
    const meta = await prisma.systemMeta.findUnique({ where: { key: 'last_refresh' } });
    return meta?.value || null;
}
