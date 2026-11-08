import { Progress, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

type EducationReportItem = {
  educational_status: string;
  selected_count: number;
  approved_count: number;
  released_count: number;
  released_amount: number;
  percentage: number;
};

export default function AdminDistributionEducationTable({ data }: { data: EducationReportItem[] }) {
  const columns: ColumnsType<EducationReportItem> = [
    {
      title: 'Educational Status',
      dataIndex: 'educational_status',
      key: 'educational_status',
      render: (status) => (
        <Tag color="cyan" className="font-semibold text-xs px-2 py-0.5">
          {status}
        </Tag>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'selected_count',
      key: 'selected_count',
      align: 'center',
      render: (val, record) => (
        <div>
          <span className="font-bold text-slate-800">{val}</span>
          <span className="text-[11px] text-slate-400 block">({record.percentage}%)</span>
        </div>
      ),
    },
    {
      title: 'Approved',
      dataIndex: 'approved_count',
      key: 'approved_count',
      align: 'center',
      render: (val) => <span className="font-bold text-emerald-700">{val}</span>,
    },
    {
      title: 'Disbursed',
      dataIndex: 'released_count',
      key: 'released_count',
      align: 'center',
      render: (val) => <span className="font-bold text-slate-900">{val}</span>,
    },
    {
      title: 'Total Disbursed Amount',
      dataIndex: 'released_amount',
      key: 'released_amount',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-emerald-900">
          ₱{val.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Disbursement Rate',
      key: 'rate',
      width: 140,
      render: (_, record) => {
        const rate = record.approved_count > 0 ? Math.round((record.released_count / record.approved_count) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <Progress percent={rate} size="small" strokeColor="#0891b2" showInfo={false} />
            <span className="text-xs font-semibold text-slate-600">{rate}%</span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        dataSource={data}
        rowKey="educational_status"
        pagination={false}
        size="small"
        className="w-full"
      />
    </div>
  );
}
