import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

interface RasioFilters {
    tahun?: number | number[];
    bulan?: number | number[];
    jenisLembaga?: string | string[];
}

interface PaginationParams {
    page: number;
    pageSize: number;
}

function buildWhereClause(filters: RasioFilters): Prisma.FactRasioLembagaWhereInput {
    const where: Prisma.FactRasioLembagaWhereInput = {};

    if (filters.tahun) {
        where.tahun = Array.isArray(filters.tahun) ? { in: filters.tahun } : filters.tahun;
    }
    if (filters.bulan) {
        where.bulan = Array.isArray(filters.bulan) ? { in: filters.bulan } : filters.bulan;
    }
    if (filters.jenisLembaga) {
        where.jenisLembaga = Array.isArray(filters.jenisLembaga) ? { in: filters.jenisLembaga } : filters.jenisLembaga;
    }

    return where;
}

export async function getRasioKPI(filters: RasioFilters) {
    const where = buildWhereClause(filters);

    const [totalPenyelamatan, totalPenyaluran, lembagaAktif] = await Promise.all([
        prisma.factRasioLembaga.aggregate({ where, _sum: { totalPenyelamatan: true } }),
        prisma.factRasioLembaga.aggregate({ where, _sum: { totalPenyaluran: true } }),
        prisma.factRasioLembaga.findMany({ where, select: { lembagaId: true }, distinct: ['lembagaId'] }),
    ]);

    const sumPenyelamatan = totalPenyelamatan._sum.totalPenyelamatan || 0;
    const sumPenyaluran = totalPenyaluran._sum.totalPenyaluran || 0;
    const rasio = sumPenyelamatan > 0 ? (sumPenyaluran / sumPenyelamatan) * 100 : 0;

    return {
        totalPenyelamatan: sumPenyelamatan,
        totalPenyaluran: sumPenyaluran,
        rasioPenyaluran: Math.round(rasio * 100) / 100,
        jumlahLembagaAktif: lembagaAktif.length,
    };
}

export async function getRasioDistribusiChart(filters: RasioFilters) {
    const where = buildWhereClause(filters);

    // Ambil data agregat per lembaga (rata-rata rasio)
    const data = await prisma.factRasioLembaga.groupBy({
        by: ['lembagaNama', 'jenisLembaga'],
        where,
        _avg: { rasioPenyaluran: true },
        orderBy: { _avg: { rasioPenyaluran: 'asc' } },
    });

    return data.map(d => ({
        lembaga: d.lembagaNama,
        jenisLembaga: d.jenisLembaga,
        rasio: Math.round((d._avg.rasioPenyaluran || 0) * 100) / 100,
        status: (d._avg.rasioPenyaluran || 0) >= 80 ? 'Tercapai' : 'Belum Tercapai',
    }));
}

export async function getRasioTable(filters: RasioFilters, pagination: PaginationParams) {
    const where = buildWhereClause(filters);
    const { page, pageSize } = pagination;

    // Agregat per lembaga (rata-rata rasio, sum total)
    const [data, totalCount] = await Promise.all([
        prisma.factRasioLembaga.groupBy({
            by: ['lembagaId', 'lembagaNama', 'jenisLembaga'],
            where,
            _sum: { totalPenyelamatan: true, totalPenyaluran: true },
            _avg: { rasioPenyaluran: true },
            orderBy: { _avg: { rasioPenyaluran: 'desc' } },
            skip: (page - 1) * pageSize,
            take: pageSize,
        }),
        prisma.factRasioLembaga.groupBy({
            by: ['lembagaId'],
            where,
        }),
    ]);

    return {
        rows: data.map(d => {
            const rasio = Math.round((d._avg.rasioPenyaluran || 0) * 100) / 100;
            return {
                lembaga: d.lembagaNama,
                jenisLembaga: d.jenisLembaga,
                totalPenyelamatan: d._sum.totalPenyelamatan || 0,
                totalPenyaluran: d._sum.totalPenyaluran || 0,
                rasioPenyaluran: rasio,
                statusTarget: rasio >= 80 ? '✅ Tercapai (≥80%)' : '❌ Belum Tercapai (<80%)',
            };
        }),
        total: totalCount.length,
        page,
        pageSize,
    };
}
