// Utility functions for creating sortable table columns

// Text column sorter
export const textSorter = (field: string) => (a: any, b: any) =>
    (a[field] || '').localeCompare(b[field] || '');

// Number column sorter  
export const numberSorter = (field: string) => (a: any, b: any) =>
    (a[field] || 0) - (b[field] || 0);

// Helper to create sortable pivot table columns
export const createPivotColumns = (type: 'produk' | 'provinsi') => {
    const baseColumns = [
        {
            title: 'Penggiat',
            dataIndex: 'penggiat',
            key: 'penggiat',
            sorter: textSorter('penggiat')
        },
    ];

    if (type === 'produk') {
        return [
            ...baseColumns,
            {
                title: 'Produk Donasi',
                dataIndex: 'produkDonasi',
                key: 'produkDonasi',
                sorter: textSorter('produkDonasi')
            },
            {
                title: 'Jumlah (Kg)',
                dataIndex: 'jumlahKg',
                key: 'jumlahKg',
                render: (v: number) => v.toLocaleString('id-ID'),
                align: 'right' as const,
                sorter: numberSorter('jumlahKg')
            },
        ];
    }

    // provinsi type
    return [
        ...baseColumns,
        {
            title: 'Provinsi',
            dataIndex: 'provinsi',
            key: 'provinsi',
            sorter: textSorter('provinsi')
        },
        {
            title: 'Jumlah (Kg)',
            dataIndex: 'jumlahKg',
            key: 'jumlahKg',
            render: (v: number) => v.toLocaleString('id-ID'),
            align: 'right' as const,
            sorter: numberSorter('jumlahKg')
        },
    ];
};

// Columns for Rasio Penyaluran table
export const createRasioColumns = () => [
    {
        title: 'Penggiat',
        dataIndex: 'penggiat',
        key: 'penggiat',
        sorter: textSorter('penggiat')
    },
    {
        title: 'Jumlah Diselamatkan (Kg)',
        dataIndex: 'jumlahDiselamatkan',
        key: 'jumlahDiselamatkan',
        render: (v: number) => v?.toLocaleString('id-ID') || '0',
        align: 'right' as const,
        sorter: numberSorter('jumlahDiselamatkan')
    },
    {
        title: 'Jumlah Disalurkan (Kg)',
        dataIndex: 'jumlahDisalurkan',
        key: 'jumlahDisalurkan',
        render: (v: number) => v?.toLocaleString('id-ID') || '0',
        align: 'right' as const,
        sorter: numberSorter('jumlahDisalurkan')
    },
    {
        title: 'Rasio (%)',
        dataIndex: 'rasio',
        key: 'rasio',
        render: (v: number) => v?.toFixed(2) || '0.00',
        align: 'right' as const,
        sorter: numberSorter('rasio')
    },
];
