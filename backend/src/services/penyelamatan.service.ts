import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

interface DashboardFilters {
    provinsiId?: string | string[];
    kabupatenId?: string | string[];
    tahun?: number | number[];
    bulan?: number | number[];
    lembaga?: string | string[];
    jenisLembaga?: string | string[];
    produkDonasi?: string | string[];  // ID produk dari dim_produk_donasi
}

interface PaginationParams {
    page: number;
    pageSize: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc';
}

// Helper: bangun WHERE clause dinamis untuk raw SQL penyelamatan
function buildRawWhere(filters: DashboardFilters, alias = 'f') {
    const conditions: string[] = [];
    const params: any[] = [];
    let i = 1;

    if (filters.provinsiId) {
        const v = Array.isArray(filters.provinsiId) ? filters.provinsiId : [filters.provinsiId];
        conditions.push(`${alias}.provinsi_id = ANY($${i}::text[])`);
        params.push(v); i++;
    }
    if (filters.kabupatenId) {
        const v = Array.isArray(filters.kabupatenId) ? filters.kabupatenId : [filters.kabupatenId];
        conditions.push(`${alias}.kabupaten_id = ANY($${i}::text[])`);
        params.push(v); i++;
    }
    if (filters.tahun) {
        const v = (Array.isArray(filters.tahun) ? filters.tahun : [filters.tahun]) as number[];
        conditions.push(`${alias}.tahun = ANY($${i}::int[])`);
        params.push(v); i++;
    }
    if (filters.bulan) {
        const v = (Array.isArray(filters.bulan) ? filters.bulan : [filters.bulan]) as number[];
        conditions.push(`${alias}.bulan = ANY($${i}::int[])`);
        params.push(v); i++;
    }
    if (filters.lembaga) {
        const v = Array.isArray(filters.lembaga) ? filters.lembaga : [filters.lembaga];
        conditions.push(`${alias}.lembaga_nama = ANY($${i}::text[])`);
        params.push(v); i++;
    }
    if (filters.jenisLembaga) {
        const v = Array.isArray(filters.jenisLembaga) ? filters.jenisLembaga : [filters.jenisLembaga];
        conditions.push(`${alias}.jenis_lembaga = ANY($${i}::text[])`);
        params.push(v); i++;
    }
    if (filters.produkDonasi) {
        // JSONB ?| operator: cek apakah salah satu key ID produk ada di produk_donasi
        const v = Array.isArray(filters.produkDonasi) ? filters.produkDonasi : [filters.produkDonasi];
        conditions.push(`${alias}.produk_donasi ?| $${i}::text[]`);
        params.push(v); i++;
    }

    return { sql: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', params, nextIdx: i };
}

function buildWhereClause(filters: DashboardFilters): Prisma.FactPenyelamatanPanganWhereInput {
    const where: Prisma.FactPenyelamatanPanganWhereInput = {};

    if (filters.provinsiId) {
        where.provinsiId = Array.isArray(filters.provinsiId) ? { in: filters.provinsiId } : filters.provinsiId;
    }
    if (filters.kabupatenId) {
        where.kabupatenId = Array.isArray(filters.kabupatenId) ? { in: filters.kabupatenId } : filters.kabupatenId;
    }
    if (filters.tahun) {
        where.tahun = Array.isArray(filters.tahun) ? { in: filters.tahun } : filters.tahun;
    }
    if (filters.bulan) {
        where.bulan = Array.isArray(filters.bulan) ? { in: filters.bulan } : filters.bulan;
    }
    if (filters.lembaga) {
        where.lembagaNama = Array.isArray(filters.lembaga) ? { in: filters.lembaga } : filters.lembaga;
    }
    if (filters.jenisLembaga) {
        where.jenisLembaga = Array.isArray(filters.jenisLembaga) ? { in: filters.jenisLembaga } : filters.jenisLembaga;
    }
    if (filters.produkDonasi) {
        // Filter by produk ID dalam JSONB: cek apakah key ada di produk_donasi
        const ids = Array.isArray(filters.produkDonasi) ? filters.produkDonasi : [filters.produkDonasi];
        // Prisma JSON path filter - checks if path key exists (not null)
        if (ids.length === 1) {
            where.produkDonasi = { path: [ids[0]], not: Prisma.AnyNull };
        } else {
            // Multiple products: OR any of the IDs exist as key
            (where as any).OR = ids.map(id => ({
                produkDonasi: { path: [id], not: Prisma.AnyNull },
            }));
        }
    }

    return where;
}

export async function getPenyelamatanKPI(filters: DashboardFilters) {
    const where = buildWhereClause(filters);

    const [totalKg, lembagaAktif, provinsiCount, kabupatenCount] = await Promise.all([
        prisma.factPenyelamatanPangan.aggregate({ where, _sum: { jumlahKg: true } }),
        prisma.factPenyelamatanPangan.findMany({ where, select: { lembagaId: true }, distinct: ['lembagaId'] }),
        prisma.factPenyelamatanPangan.findMany({ where, select: { provinsiId: true }, distinct: ['provinsiId'] }),
        prisma.factPenyelamatanPangan.findMany({ where, select: { kabupatenId: true }, distinct: ['kabupatenId'] }),
    ]);

    return {
        totalPenyelamatan: totalKg._sum.jumlahKg || 0,
        jumlahLembagaAktif: lembagaAktif.length,
        jumlahProvinsi: provinsiCount.length,
        jumlahKabupaten: kabupatenCount.length,
    };
}

export async function getPenyelamatanChartPerBulan(filters: DashboardFilters) {
    const where = buildWhereClause(filters);
    const data = await prisma.factPenyelamatanPangan.groupBy({
        by: ['tahun', 'bulan'],
        where,
        _sum: { jumlahKg: true },
        orderBy: [{ tahun: 'asc' }, { bulan: 'asc' }],
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    const result: Array<{ tahun: number; bulan: number; label: string; jumlahKg: number }> = [];
    const hasYearFilter = !!filters.tahun;
    const hasMonthFilter = !!filters.bulan;

    if (hasYearFilter && hasMonthFilter) {
        const years = Array.isArray(filters.tahun) ? filters.tahun as number[] : [filters.tahun as number];
        const months = Array.isArray(filters.bulan) ? filters.bulan as number[] : [filters.bulan as number];
        for (const year of years) {
            for (const month of months) {
                const matched = data.find(d => d.tahun === year && d.bulan === month);
                result.push({ tahun: year, bulan: month, label: `${monthNames[month - 1]} ${year}`, jumlahKg: matched?._sum.jumlahKg || 0 });
            }
        }
    } else if (hasYearFilter) {
        const years = (Array.isArray(filters.tahun) ? filters.tahun : [filters.tahun]) as number[];
        for (const year of years.sort()) {
            for (let month = 1; month <= 12; month++) {
                const matched = data.find(d => d.tahun === year && d.bulan === month);
                result.push({ tahun: year, bulan: month, label: `${monthNames[month - 1]} ${year}`, jumlahKg: matched?._sum.jumlahKg || 0 });
            }
        }
    } else if (hasMonthFilter) {
        const months = (Array.isArray(filters.bulan) ? filters.bulan : [filters.bulan]) as number[];
        const availableYears = [...new Set(data.map(d => d.tahun))].sort() as number[];
        for (const year of availableYears) {
            for (const month of months) {
                const matched = data.find(d => d.tahun === year && d.bulan === month);
                if (matched) result.push({ tahun: year, bulan: month, label: `${monthNames[month - 1]} ${year}`, jumlahKg: matched._sum.jumlahKg || 0 });
            }
        }
    } else {
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const year = target.getFullYear();
            const month = target.getMonth() + 1;
            const matched = data.find(d => d.tahun === year && d.bulan === month);
            result.push({ tahun: year, bulan: month, label: `${monthNames[month - 1]} ${year}`, jumlahKg: matched?._sum.jumlahKg || 0 });
        }
    }

    return result;
}

export async function getPenyelamatanTopLembaga(filters: DashboardFilters, limit = 10) {
    const where = buildWhereClause(filters);
    const data = await prisma.factPenyelamatanPangan.groupBy({
        by: ['lembagaNama'],
        where,
        _sum: { jumlahKg: true },
        orderBy: { _sum: { jumlahKg: 'desc' } },
        take: limit,
    });
    return data.map(d => ({ lembagaNama: d.lembagaNama, jumlahKg: d._sum.jumlahKg || 0 }));
}

export async function getPenyelamatanTopProvinsi(filters: DashboardFilters, limit = 10) {
    const where = buildWhereClause(filters);
    const data = await prisma.factPenyelamatanPangan.groupBy({
        by: ['provinsiNama'],
        where,
        _sum: { jumlahKg: true },
        orderBy: { _sum: { jumlahKg: 'desc' } },
        take: limit,
    });
    return data.map(d => ({ provinsiNama: d.provinsiNama, jumlahKg: d._sum.jumlahKg || 0 }));
}

// Pivot: Lembaga × Produk Donasi (via JSONB expansion)
export async function getPenyelamatanPivotProduk(filters: DashboardFilters, pagination: PaginationParams) {
    const { page, pageSize } = pagination;
    const { sql: whereSQL, params, nextIdx } = buildRawWhere(filters);

    // Extra: jika filter produkDonasi aktif, tambah filter val.key agar hanya produk terpilih yang tampil di pivot
    let extraValFilter = '';
    let extraParams = [...params];
    let limitIdx = nextIdx;
    if (filters.produkDonasi) {
        const ids = Array.isArray(filters.produkDonasi) ? filters.produkDonasi : [filters.produkDonasi];
        extraValFilter = whereSQL ? `AND val.key = ANY($${nextIdx}::text[])` : `WHERE val.key = ANY($${nextIdx}::text[])`;
        extraParams = [...params, ids];
        limitIdx = nextIdx + 1;
    }
    const offsetIdx = limitIdx + 1;

    const data = await prisma.$queryRawUnsafe<{ lembagaNama: string; produkDonasi: string; jumlahKg: number }[]>(
        `SELECT
            f.lembaga_nama AS "lembagaNama",
            d.nama AS "produkDonasi",
            SUM(CAST(val.value AS FLOAT)) AS "jumlahKg"
         FROM fact_penyelamatan_pangan f
         CROSS JOIN LATERAL jsonb_each_text(f.produk_donasi) AS val(key, value)
         JOIN dim_produk_donasi d ON d.id = CAST(val.key AS INTEGER)
         ${whereSQL}
         ${extraValFilter}
         GROUP BY f.lembaga_nama, d.nama
         ORDER BY SUM(CAST(val.value AS FLOAT)) DESC
         LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
        ...extraParams, pageSize, (page - 1) * pageSize
    );

    const countData = await prisma.$queryRawUnsafe<{ count: bigint }[]>(
        `SELECT COUNT(*) AS count FROM (
            SELECT DISTINCT f.lembaga_nama, d.nama
            FROM fact_penyelamatan_pangan f
            CROSS JOIN LATERAL jsonb_each_text(f.produk_donasi) AS val(key, value)
            JOIN dim_produk_donasi d ON d.id = CAST(val.key AS INTEGER)
            ${whereSQL}
            ${extraValFilter}
         ) t`,
        ...extraParams
    );

    const grandTotalData = await prisma.$queryRawUnsafe<{ total: string }[]>(
        `SELECT SUM(CAST(val.value AS FLOAT)) AS total
         FROM fact_penyelamatan_pangan f
         CROSS JOIN LATERAL jsonb_each_text(f.produk_donasi) AS val(key, value)
         ${whereSQL}
         ${extraValFilter}`,
        ...extraParams
    );

    return {
        rows: data.map(d => ({ lembagaNama: d.lembagaNama, produkDonasi: d.produkDonasi, jumlahKg: Number(d.jumlahKg) })),
        total: Number(countData[0]?.count || 0),
        grandTotal: parseFloat(grandTotalData[0]?.total || '0'),
        page,
        pageSize,
    };
}

// Pivot: Lembaga × Provinsi (Kg) — tetap dipertahankan
export async function getPenyelamatanPivotProvinsi(filters: DashboardFilters, pagination: PaginationParams) {
    const where = buildWhereClause(filters);
    const { page, pageSize } = pagination;

    const [data, totalGroups, grandTotalAgg] = await Promise.all([
        prisma.factPenyelamatanPangan.groupBy({
            by: ['lembagaNama', 'provinsiNama'],
            where,
            _sum: { jumlahKg: true },
            orderBy: { _sum: { jumlahKg: 'desc' } },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.factPenyelamatanPangan.groupBy({ by: ['lembagaNama', 'provinsiNama'], where }),
        prisma.factPenyelamatanPangan.aggregate({ where, _sum: { jumlahKg: true } }),
    ]);

    return {
        rows: data.map(d => ({ lembaga: d.lembagaNama, provinsi: d.provinsiNama, jumlahKg: d._sum.jumlahKg || 0 })),
        total: totalGroups.length,
        grandTotal: grandTotalAgg._sum.jumlahKg || 0,
        page, pageSize,
    };
}
