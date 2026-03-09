import api from './client';

export interface ExportFilters {
    tahun?: number[];
    bulan?: number[];
    jenisLembaga?: string;
}

export const exportExcel = async (filters: ExportFilters): Promise<void> => {
    const params = new URLSearchParams();

    if (filters.tahun && filters.tahun.length > 0) {
        params.append('tahun', filters.tahun.join(','));
    }
    if (filters.bulan && filters.bulan.length > 0) {
        params.append('bulan', filters.bulan.join(','));
    }
    if (filters.jenisLembaga) {
        params.append('jenisLembaga', filters.jenisLembaga);
    }

    // Gunakan responseType blob untuk download file
    const response = await api.get(`/export?${params.toString()}`, {
        responseType: 'blob',
    });

    // Ambil nama file dari header Content-Disposition
    const contentDisposition = response.headers['content-disposition'] || '';
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    const filename = filenameMatch
        ? filenameMatch[1]
        : `SBP_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;

    // Trigger download
    const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};
