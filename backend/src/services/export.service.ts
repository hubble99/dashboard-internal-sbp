import ExcelJS from 'exceljs';
import prisma from '../lib/prisma';

// ─── Styling Constants ──────────────────────────────────────────────────────
const BRAND_COLOR = 'FF1A3C5E';
const WHITE_COLOR = 'FFFFFFFF';
const ALT_ROW = 'FFEAF4FB';
const TOTAL_ROW = 'FFFFF3CD';
const TOTAL_FONT = 'FF8B6914';
const BORDER_COLOR = 'FFB0C4DE';

const THIN_BORDER: ExcelJS.Borders = {
    top: { style: 'thin', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'thin', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } },
    diagonal: { style: 'thin', color: { argb: BORDER_COLOR } },
};

const TOTAL_BORDER: ExcelJS.Borders = {
    top: { style: 'medium', color: { argb: BORDER_COLOR } },
    left: { style: 'thin', color: { argb: BORDER_COLOR } },
    bottom: { style: 'medium', color: { argb: BORDER_COLOR } },
    right: { style: 'thin', color: { argb: BORDER_COLOR } },
    diagonal: { style: 'thin', color: { argb: BORDER_COLOR } },
};

const BULAN_NAMA = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// ─── Interfaces ──────────────────────────────────────────────────────────────
export interface ExportFilters {
    tahun?: number[];
    bulan?: number[];
    jenisLembaga?: string;
}

interface DataRow {
    lembagaNama: string;
    jenisLembaga: string;
    tahun: number;
    bulan: number;
    totalPenyelamatan: number;
    totalPenyaluran: number;
    totalPenerima: number;
}

// ─── Opsi A: fact_rasio_lembaga sebagai base ─────────────────────────────────
//
//  fact_rasio_lembaga sudah memiliki total_penyelamatan dan total_penyaluran
//  yang benar untuk SEMUA jenis lembaga — tidak perlu CASE/condition apapun.
//
//  Satu-satunya data yang tidak ada di sana adalah jumlah_penerima_manfaat,
//  sehingga kita hanya perlu 1 LEFT JOIN kecil ke fact_penyaluran_pangan.
//
//  Keuntungan utama:
//  ✓ Angka export persis konsisten dengan dashboard Rasio Lembaga
//  ✓ Query jauh lebih simpel (1 LEFT JOIN vs 2 CTE + CASE)
//  ✓ Tidak perlu tahu business rule Transaksi Mandiri di level query
// ─────────────────────────────────────────────────────────────────────────────
async function fetchCombinedData(filters: ExportFilters): Promise<DataRow[]> {
    const params: any[] = [];
    let paramIdx = 1;

    // Kondisi untuk fact_rasio_lembaga (r)
    const rConds: string[] = ['1=1'];
    // Kondisi untuk subquery fact_penyaluran_pangan (py) — hanya tahun & bulan
    const pyConds: string[] = ['1=1'];

    if (filters.tahun?.length) {
        rConds.push(`r.tahun = ANY($${paramIdx}::int[])`);
        pyConds.push(`tahun = ANY($${paramIdx}::int[])`);
        params.push(filters.tahun);
        paramIdx++;
    }
    if (filters.bulan?.length) {
        rConds.push(`r.bulan = ANY($${paramIdx}::int[])`);
        pyConds.push(`bulan = ANY($${paramIdx}::int[])`);
        params.push(filters.bulan);
        paramIdx++;
    }
    if (filters.jenisLembaga) {
        // Filter jenis lembaga hanya di tabel rasio, bukan di subquery penerima
        rConds.push(`r.jenis_lembaga = $${paramIdx}`);
        params.push(filters.jenisLembaga);
    }

    const rWhere = `WHERE ${rConds.join(' AND ')}`;
    const pyWhere = `WHERE ${pyConds.join(' AND ')}`;

    const sql = `
        SELECT
            r.lembaga_nama              AS "lembagaNama",
            r.jenis_lembaga             AS "jenisLembaga",
            r.tahun,
            r.bulan,
            r.total_penyelamatan        AS "totalPenyelamatan",
            r.total_penyaluran          AS "totalPenyaluran",
            COALESCE(py.total_penerima, 0) AS "totalPenerima"
        FROM fact_rasio_lembaga r
        LEFT JOIN (
            SELECT
                lembaga_nama,
                tahun,
                bulan,
                SUM(jumlah_penerima_manfaat) AS total_penerima
            FROM fact_penyaluran_pangan
            ${pyWhere}
            GROUP BY lembaga_nama, tahun, bulan
        ) py
            ON  py.lembaga_nama = r.lembaga_nama
            AND py.tahun        = r.tahun
            AND py.bulan        = r.bulan
        ${rWhere}
        ORDER BY r.lembaga_nama, r.tahun, r.bulan
    `;

    const rows: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return rows.map(r => ({
        lembagaNama: r.lembagaNama,
        jenisLembaga: r.jenisLembaga,
        tahun: Number(r.tahun),
        bulan: Number(r.bulan),
        totalPenyelamatan: parseFloat(r.totalPenyelamatan ?? 0),
        totalPenyaluran: parseFloat(r.totalPenyaluran ?? 0),
        totalPenerima: parseInt(r.totalPenerima ?? 0),
    }));
}

// ─── Fungsi utama export ──────────────────────────────────────────────────────
export async function generateExcelExport(filters: ExportFilters): Promise<ExcelJS.Buffer> {
    const data = await fetchCombinedData(filters);

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Dashboard SBP — Badan Pangan Nasional';
    wb.created = new Date();
    wb.modified = new Date();

    const ws = wb.addWorksheet('Data Penyelamatan & Penyaluran');

    // ── Lebar kolom ─────────────────────────────────────────────────────
    ws.columns = [
        { key: 'no', width: 6 },
        { key: 'lembaga', width: 44 },
        { key: 'jenis', width: 22 },
        { key: 'tahun', width: 10 },
        { key: 'bulan', width: 16 },
        { key: 'penyelamat', width: 26 },
        { key: 'penyaluran', width: 26 },
        { key: 'penerima', width: 22 },
    ];

    const NUM_COLS = 8;

    // ── Baris 1: Judul ───────────────────────────────────────────────────
    ws.addRow(['LAPORAN DATA PENYELAMATAN & PENYALURAN PANGAN']);
    ws.mergeCells(1, 1, 1, NUM_COLS);
    const titleCell = ws.getCell(1, 1);
    titleCell.font = { bold: true, size: 14, color: { argb: BRAND_COLOR } };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(1).height = 30;

    // ── Baris 2: Subtitle ────────────────────────────────────────────────
    const filterDesc = [
        filters.tahun?.length ? `Tahun: ${filters.tahun.join(', ')}` : 'Tahun: Semua',
        filters.bulan?.length ? `Bulan: ${filters.bulan.map(b => BULAN_NAMA[b]).join(', ')}` : '',
        filters.jenisLembaga ? `Jenis: ${filters.jenisLembaga}` : '',
    ].filter(Boolean).join('  |  ');

    ws.addRow([
        `Badan Pangan Nasional  •  Diekspor: ${new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}  •  ${filterDesc}`,
    ]);
    ws.mergeCells(2, 1, 2, NUM_COLS);
    const subCell = ws.getCell(2, 1);
    subCell.font = { italic: true, size: 10, color: { argb: 'FF555555' } };
    subCell.alignment = { horizontal: 'center', vertical: 'middle' };
    ws.getRow(2).height = 18;

    // ── Baris 3: Kosong ──────────────────────────────────────────────────
    ws.addRow([]);
    ws.getRow(3).height = 6;

    // ── Baris 4: Header kolom ────────────────────────────────────────────
    const headerRow = ws.addRow([
        'No',
        'Nama Lembaga',
        'Jenis Lembaga',
        'Tahun',
        'Bulan',
        'Total Penyelamatan (Kg)',
        'Total Penyaluran (Kg)',
        'Penerima Manfaat',
    ]);
    headerRow.height = 32;
    headerRow.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: BRAND_COLOR } };
        cell.font = { bold: true, color: { argb: WHITE_COLOR }, size: 11 };
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        cell.border = THIN_BORDER;
    });

    // ── Baris data ───────────────────────────────────────────────────────
    let sumPenyelamatan = 0;
    let sumPenyaluran = 0;
    let sumPenerima = 0;

    data.forEach((r, i) => {
        const isAlt = i % 2 === 1;
        const dr = ws.addRow([
            i + 1,
            r.lembagaNama,
            r.jenisLembaga,
            r.tahun,
            BULAN_NAMA[r.bulan] || String(r.bulan),
            r.totalPenyelamatan,
            r.totalPenyaluran,
            r.totalPenerima,
        ]);
        dr.height = 22;

        dr.eachCell({ includeEmpty: true }, (cell, colNum) => {
            if (isAlt) {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: ALT_ROW } };
            }
            cell.border = THIN_BORDER;
            cell.alignment = { vertical: 'middle' };

            // No & Tahun: center
            if (colNum === 1 || colNum === 4) {
                cell.alignment = { horizontal: 'center', vertical: 'middle' };
            }
            // Angka: rata kanan
            if (colNum >= 6) {
                cell.alignment = { horizontal: 'right', vertical: 'middle' };
            }
        });

        dr.getCell(6).numFmt = '#,##0.00';
        dr.getCell(7).numFmt = '#,##0.00';
        dr.getCell(8).numFmt = '#,##0';

        sumPenyelamatan += r.totalPenyelamatan;
        sumPenyaluran += r.totalPenyaluran;
        sumPenerima += r.totalPenerima;
    });

    // ── Baris TOTAL ──────────────────────────────────────────────────────
    const totalRow = ws.addRow([
        '', 'TOTAL KESELURUHAN', '', '', '',
        sumPenyelamatan,
        sumPenyaluran,
        sumPenerima,
    ]);
    totalRow.height = 28;
    // Merge kolom 2-5 supaya label "TOTAL KESELURUHAN" rapi
    ws.mergeCells(totalRow.number, 2, totalRow.number, 5);

    totalRow.eachCell({ includeEmpty: true }, (cell, colNum) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TOTAL_ROW } };
        cell.font = { bold: true, color: { argb: TOTAL_FONT }, size: 11 };
        cell.border = TOTAL_BORDER;
        cell.alignment = { vertical: 'middle' };

        if (colNum === 2) cell.alignment = { horizontal: 'center', vertical: 'middle' };
        if (colNum >= 6) cell.alignment = { horizontal: 'right', vertical: 'middle' };
    });
    totalRow.getCell(6).numFmt = '#,##0.00';
    totalRow.getCell(7).numFmt = '#,##0.00';
    totalRow.getCell(8).numFmt = '#,##0';

    // ── Freeze header (baris 1–4 tetap saat scroll) ──────────────────────
    ws.views = [{ state: 'frozen', ySplit: 4 }];

    // ── Catatan kaki ─────────────────────────────────────────────────────
    ws.addRow([]);
    const note1 = ws.addRow([
        `Total: ${data.length} baris data  |  Dihasilkan oleh Dashboard SBP — Badan Pangan Nasional`,
    ]);
    ws.mergeCells(note1.number, 1, note1.number, NUM_COLS);
    note1.getCell(1).font = { italic: true, size: 9, color: { argb: 'FF888888' } };
    note1.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };

    return await wb.xlsx.writeBuffer();
}
