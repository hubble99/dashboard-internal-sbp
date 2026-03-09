import { Router, Request, Response } from 'express';

const router = Router();

// ─── Reference data ───────────────────────────────────────────────
// Menggunakan kode BPS sebagai provinsiId dan kabupatenId
const provinces = [
    { id: '31', nama: 'DKI Jakarta' },
    { id: '32', nama: 'Jawa Barat' },
    { id: '33', nama: 'Jawa Tengah' },
    { id: '35', nama: 'Jawa Timur' },
    { id: '36', nama: 'Banten' },
    { id: '34', nama: 'DI Yogyakarta' },
    { id: '12', nama: 'Sumatera Utara' },
    { id: '13', nama: 'Sumatera Barat' },
    { id: '73', nama: 'Sulawesi Selatan' },
    { id: '51', nama: 'Bali' },
    { id: '64', nama: 'Kalimantan Timur' },
    { id: '18', nama: 'Lampung' },
];

const kabupatenMap: Record<string, { id: string; nama: string }[]> = {
    '31': [
        { id: '3171', nama: 'Jakarta Pusat' },
        { id: '3174', nama: 'Jakarta Selatan' },
        { id: '3173', nama: 'Jakarta Barat' },
    ],
    '32': [
        { id: '3273', nama: 'Kota Bandung' },
        { id: '3271', nama: 'Kota Bogor' },
        { id: '3275', nama: 'Kota Bekasi' },
        { id: '3276', nama: 'Kota Depok' },
    ],
    '33': [
        { id: '3374', nama: 'Kota Semarang' },
        { id: '3372', nama: 'Kota Surakarta' },
    ],
    '35': [
        { id: '3578', nama: 'Kota Surabaya' },
        { id: '3573', nama: 'Kota Malang' },
    ],
    '36': [
        { id: '3671', nama: 'Kota Tangerang' },
        { id: '3674', nama: 'Kota Tangerang Selatan' },
    ],
    '34': [
        { id: '3471', nama: 'Kota Yogyakarta' },
        { id: '3404', nama: 'Sleman' },
    ],
    '12': [
        { id: '1275', nama: 'Kota Medan' },
        { id: '1212', nama: 'Deli Serdang' },
    ],
    '13': [
        { id: '1371', nama: 'Kota Padang' },
    ],
    '73': [
        { id: '7371', nama: 'Kota Makassar' },
    ],
    '51': [
        { id: '5171', nama: 'Kota Denpasar' },
        { id: '5103', nama: 'Badung' },
    ],
    '64': [
        { id: '6472', nama: 'Kota Samarinda' },
    ],
    '18': [
        { id: '1871', nama: 'Kota Bandar Lampung' },
    ],
};

// Lembaga Penggiat
const penggiatList = [
    { id: '101', nama: 'Bank Pangan Jakarta', jenis: 'Penggiat' },
    { id: '102', nama: 'Bank Pangan Jawa Barat', jenis: 'Penggiat' },
    { id: '103', nama: 'Lumbung Pangan Semarang', jenis: 'Penggiat' },
    { id: '104', nama: 'Bank Pangan Surabaya', jenis: 'Penggiat' },
    { id: '105', nama: 'Lumbung Pangan Yogya', jenis: 'Penggiat' },
    { id: '106', nama: 'Bank Pangan Medan', jenis: 'Penggiat' },
    { id: '107', nama: 'Lumbung Pangan Makassar', jenis: 'Penggiat' },
    { id: '108', nama: 'Bank Pangan Bali', jenis: 'Penggiat' },
    { id: '109', nama: 'Lumbung Pangan Banten', jenis: 'Penggiat' },
    { id: '110', nama: 'Bank Pangan Bogor', jenis: 'Penggiat' },
];

// Lembaga Transaksi Mandiri + jenis penyedianya
const mandiriList = [
    { id: '201', nama: 'Supermarket Maju Jaya', jenisPenyedia: 'Retail' },
    { id: '202', nama: 'Hotel Grand Palace', jenisPenyedia: 'HoReCa' },
    { id: '203', nama: 'Restoran Nusantara', jenisPenyedia: 'HoReCa' },
    { id: '204', nama: 'PT Indofood Sukses Makmur', jenisPenyedia: 'Industri Pangan' },
    { id: '205', nama: 'Hypermart Central', jenisPenyedia: 'Retail' },
    { id: '206', nama: 'Hotel Bintang Lima', jenisPenyedia: 'HoReCa' },
    { id: '207', nama: 'PT Mayora Indah', jenisPenyedia: 'Industri Pangan' },
    { id: '208', nama: 'Catering Nusantara', jenisPenyedia: 'Katering' },
];

// Master produk donasi (referensi dim_produk_donasi)
const produkList = [
    { id: 1, nama: 'Beras' },
    { id: 2, nama: 'Mie Instan' },
    { id: 3, nama: 'Minyak Goreng' },
    { id: 4, nama: 'Gula Pasir' },
    { id: 5, nama: 'Tepung Terigu' },
    { id: 6, nama: 'Susu UHT' },
    { id: 7, nama: 'Telur Ayam' },
    { id: 8, nama: 'Sayuran Segar' },
    { id: 9, nama: 'Daging Ayam' },
    { id: 10, nama: 'Roti & Kue' },
];

// Helpers
function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}
function generateDateRange(startYear: number, endYear: number) {
    const dates: { year: number; month: number; date: Date }[] = [];
    for (let y = startYear; y <= endYear; y++) {
        for (let m = 1; m <= 12; m++) {
            const day = randomInt(1, 28);
            dates.push({ year: y, month: m, date: new Date(y, m - 1, day) });
        }
    }
    return dates;
}

// Hasilkan JSON produk_donasi: { "id_produk": jumlah_kg }
function generateProdukDonasi(maxProducts = 3): { json: Record<string, number>; totalKg: number } {
    const numProducts = randomInt(1, maxProducts);
    const selectedIds = [...produkList].sort(() => Math.random() - 0.5).slice(0, numProducts);
    const json: Record<string, number> = {};
    let totalKg = 0;
    for (const produk of selectedIds) {
        const kg = randomInt(20, 500);
        json[String(produk.id)] = kg;
        totalKg += kg;
    }
    return { json, totalKg };
}

// ─── GET /produk-donasi ───────────────────────────────────────────
router.get('/produk-donasi', (_req: Request, res: Response) => {
    res.json({ success: true, data: produkList });
});

// ─── GET /penyelamatan-pangan ─────────────────────────────────────
router.get('/penyelamatan-pangan', (_req: Request, res: Response) => {
    const dates = generateDateRange(2023, 2025);
    const records: any[] = [];

    for (const d of dates) {
        const numRecords = randomInt(3, 8);
        for (let i = 0; i < numRecords; i++) {
            const prov = randomItem(provinces);
            const kabs = kabupatenMap[prov.id] || [];
            const kab = kabs.length > 0 ? randomItem(kabs) : { id: '0000', nama: 'Unknown' };
            const lembaga = randomItem(penggiatList);
            const { json: produkDonasi, totalKg } = generateProdukDonasi(3);

            records.push({
                tanggal_penyelamatan: d.date.toISOString().split('T')[0],
                tahun: d.year,
                bulan: d.month,
                provinsi_id: prov.id,
                provinsi_nama: prov.nama,
                kabupaten_id: kab.id,
                kabupaten_nama: kab.nama,
                lembaga_id: lembaga.id,
                lembaga_nama: lembaga.nama,
                jenis_lembaga: lembaga.jenis,
                produk_donasi: produkDonasi,
                jumlah_kg: totalKg,
            });
        }
    }

    res.json({ success: true, data: records });
});

// ─── GET /penyaluran-pangan ───────────────────────────────────────
// Mencakup: Penggiat + Transaksi Mandiri (gabungan)
router.get('/penyaluran-pangan', (_req: Request, res: Response) => {
    const dates = generateDateRange(2023, 2025);
    const records: any[] = [];

    for (const d of dates) {
        // --- Penggiat ---
        const numPenggiat = randomInt(2, 5);
        for (let i = 0; i < numPenggiat; i++) {
            const prov = randomItem(provinces);
            const kabs = kabupatenMap[prov.id] || [];
            const kab = kabs.length > 0 ? randomItem(kabs) : { id: '0000', nama: 'Unknown' };
            const lembaga = randomItem(penggiatList);
            const { json: produkDonasi, totalKg } = generateProdukDonasi(3);

            records.push({
                tanggal_salur: d.date.toISOString().split('T')[0],
                tahun: d.year,
                bulan: d.month,
                provinsi_id: prov.id,
                provinsi_nama: prov.nama,
                kabupaten_id: kab.id,
                kabupaten_nama: kab.nama,
                lembaga_id: lembaga.id,
                lembaga_nama: lembaga.nama,
                jenis_lembaga: 'Penggiat',
                jenis_lembaga_penyedia: '-',
                produk_donasi: produkDonasi,
                jumlah_kg: totalKg,
                jumlah_penerima_manfaat: randomInt(20, 300),
            });
        }

        // --- Transaksi Mandiri ---
        const numMandiri = randomInt(1, 3);
        for (let i = 0; i < numMandiri; i++) {
            const prov = randomItem(provinces);
            const kabs = kabupatenMap[prov.id] || [];
            const kab = kabs.length > 0 ? randomItem(kabs) : { id: '0000', nama: 'Unknown' };
            const lembaga = randomItem(mandiriList);
            const { json: produkDonasi, totalKg } = generateProdukDonasi(4);

            records.push({
                tanggal_salur: d.date.toISOString().split('T')[0],
                tahun: d.year,
                bulan: d.month,
                provinsi_id: prov.id,
                provinsi_nama: prov.nama,
                kabupaten_id: kab.id,
                kabupaten_nama: kab.nama,
                lembaga_id: lembaga.id,
                lembaga_nama: lembaga.nama,
                jenis_lembaga: 'Transaksi Mandiri',
                jenis_lembaga_penyedia: lembaga.jenisPenyedia,
                produk_donasi: produkDonasi,
                jumlah_kg: totalKg,
                jumlah_penerima_manfaat: randomInt(50, 500),
            });
        }
    }

    res.json({ success: true, data: records });
});

// ─── GET /rasio-lembaga ───────────────────────────────────────────
// Data agregat per lembaga per bulan
router.get('/rasio-lembaga', (_req: Request, res: Response) => {
    const dates = generateDateRange(2023, 2025);
    const records: any[] = [];
    const allLembaga = [...penggiatList, ...mandiriList.map(m => ({ ...m, jenis: 'Transaksi Mandiri' }))];

    for (const d of dates) {
        // Tidak semua lembaga muncul di setiap bulan
        const numLembaga = randomInt(4, 10);
        const selected = [...allLembaga].sort(() => Math.random() - 0.5).slice(0, numLembaga);

        for (const lembaga of selected) {
            const totalPenyelamatan = randomInt(500, 10000);
            const totalPenyaluran = randomInt(Math.floor(totalPenyelamatan * 0.5), Math.min(totalPenyelamatan * 1.1, totalPenyelamatan + 2000));
            const rasio = totalPenyelamatan > 0
                ? Math.round((totalPenyaluran / totalPenyelamatan) * 10000) / 100
                : 0;

            records.push({
                tahun: d.year,
                bulan: d.month, // Int (1-12)
                lembaga_id: lembaga.id,
                lembaga_nama: lembaga.nama,
                jenis_lembaga: 'jenis' in lembaga ? lembaga.jenis : 'Transaksi Mandiri',
                total_penyelamatan: totalPenyelamatan,
                total_penyaluran: totalPenyaluran,
                rasio_penyaluran: rasio,
            });
        }
    }

    res.json({ success: true, data: records });
});

export default router;
