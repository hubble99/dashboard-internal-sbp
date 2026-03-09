import { Table, Card, Typography } from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';

const { Text } = Typography;

interface PivotTableProps<T> {
    title: string;
    columns: ColumnsType<T>;
    data: T[];
    total: number;
    grandTotal?: number;
    grandTotalLabel?: string;
    grandTotalField?: string;
    page: number;
    pageSize: number;
    loading?: boolean;
    onPageChange: (page: number, pageSize: number) => void;
}

function PivotTable<T extends Record<string, any>>({
    title,
    columns,
    data,
    total,
    grandTotal,
    grandTotalLabel = 'Grand Total',
    grandTotalField,
    page,
    pageSize,
    loading = false,
    onPageChange,
}: PivotTableProps<T>) {
    const pagination: TablePaginationConfig = {
        current: page,
        pageSize,
        total,
        position: ['bottomCenter'],
        showSizeChanger: true,
        showTotal: (total) => <span style={{ marginRight: 8, opacity: 0.8 }}>Total <b>{total}</b> baris</span>,
        pageSizeOptions: ['10', '20', '50'],
        onChange: onPageChange,
        size: 'small',
    };

    return (
        <Card
            title={
                <span style={{ fontSize: 14, fontWeight: 600 }}>{title}</span>
            }
            extra={
                grandTotal !== undefined && grandTotalField && (
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {grandTotalLabel}: <Text strong>{grandTotal.toLocaleString('id-ID')}</Text>
                    </Text>
                )
            }
            style={{ borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
            styles={{ body: { padding: 0 } }}
        >
            <Table
                columns={columns}
                dataSource={data}
                pagination={pagination}
                loading={loading}
                size="small"
                rowKey={(_, index) => String(index)}
                scroll={{ x: 'max-content' }}
                style={{ borderRadius: '0 0 12px 12px' }}
            />
        </Card>
    );
}

export default PivotTable;
