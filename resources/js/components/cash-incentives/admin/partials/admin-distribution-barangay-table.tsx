import { Progress, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

type BarangayReportItem = {
  barangay_name: string;
  selected_count: number;
  approved_count: number;
  rejected_count: number;
  pending_count: number;
  released_count: number;
  unclaimed_count: number;
  released_amount: number;
  percentage: number;
};

export default function AdminDistributionBarangayTable({ data }: { data: BarangayReportItem[] }) {
  const columns: ColumnsType<BarangayReportItem> = [
    {
      title: 'Barangay',
      dataIndex: 'barangay_name',
      key: 'barangay_name',
      render: (name) => <span className="font-bold text-slate-800">{name}</span>,
    },
    {
      title: 'Beneficiaries',
      dataIndex: 'selected_count',
      key: 'selected_count',
      align: 'center',
      render: (val, record) => (
        <div>
          <span className="font-bold text-slate-900">{val}</span>
          <span className="text-[11px] text-slate-400 block">({record.percentage}%)</span>
        </div>
      ),
    },
    {
      title: 'Approved',
      dataIndex: 'approved_count',
      key: 'approved_count',
      align: 'center',
      render: (val) => <span className="font-semibold text-emerald-700">{val}</span>,
    },
    {
      title: 'Paid Out',
      dataIndex: 'released_count',
      key: 'released_count',
      align: 'center',
      render: (val, record) => (
        <span className="font-bold text-slate-800">
          {val} / {record.approved_count}
        </span>
      ),
    },
    {
      title: 'Unclaimed',
      dataIndex: 'unclaimed_count',
      key: 'unclaimed_count',
      align: 'center',
      render: (val) => (val > 0 ? <span className="font-bold text-amber-600">{val}</span> : '-'),
    },
    {
      title: 'Total Disbursed',
      dataIndex: 'released_amount',
      key: 'released_amount',
      align: 'right',
      render: (val) => (
        <span className="font-mono font-bold text-emerald-800">
          ₱{val.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Quota Utilization',
      key: 'progress',
      width: 140,
      render: (_, record) => {
        const rate = record.approved_count > 0 ? Math.round((record.released_count / record.approved_count) * 100) : 0;
        return (
          <div className="flex items-center gap-2">
            <Progress percent={rate} size="small" strokeColor="#059669" showInfo={false} />
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
        rowKey="barangay_name"
        pagination={false}
        size="small"
        className="w-full"
      />
    </div>
  );
}
