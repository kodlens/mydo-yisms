import ProgramCreateEditModal from '@/components/cash-incentives/staff/partials/program-create-edit-modal';
import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { CashIncentiveProgram } from '@/types/cash-incentive';
import { Head, Link, router } from '@inertiajs/react';
import {
  Button,
  Card,
  Dropdown,
  Input,
  Modal,
  Pagination,
  Progress,
  Select,
  Table,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Banknote,
  Coins,
  DollarSign,
  Edit,
  ExternalLink,
  Eye,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
} from 'lucide-react';
import { useState } from 'react';

type Props = {
  programs: {
    data: CashIncentiveProgram[];
    current_page: number;
    total: number;
    per_page: number;
  };
  filters: {
    funding_year?: number;
    status?: string;
    search?: string;
  };
  kpi: {
    total_programs: number;
    active_programs: number;
    total_allocated_budget: number;
    total_released_amount: number;
    remaining_balance: number;
    total_approved_beneficiaries: number;
    total_disbursed_count: number;
  };
  available_years: number[];
  auth: { user: any };
};

export default function StaffCashIncentivesIndexPage({
  programs,
  filters,
  kpi,
  available_years,
  auth,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<CashIncentiveProgram | null>(null);

  const [search, setSearch] = useState(filters.search || '');
  const [yearFilter, setYearFilter] = useState<number | undefined>(filters.funding_year);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(filters.status);

  const applyFilters = (params: Record<string, any>) => {
    router.get(
      route('staff.cash-incentives.index'),
      {
        funding_year: yearFilter,
        status: statusFilter,
        search,
        ...params,
      },
      { preserveState: true }
    );
  };

  const handleOpenCreate = () => {
    setEditingProgram(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (program: CashIncentiveProgram) => {
    setEditingProgram(program);
    setModalOpen(true);
  };

  const handleDelete = (program: CashIncentiveProgram) => {
    Modal.confirm({
      title: `Delete Program '${program.title}'?`,
      content: 'This will permanently remove this draft program. This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        router.delete(route('staff.cash-incentives.destroy', program.id));
      },
    });
  };

  const formatPesos = (val: number) =>
    '₱' + val.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const columns: ColumnsType<CashIncentiveProgram> = [
    {
      title: 'Program Details',
      key: 'title',
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {record.code}
            </span>
            <Tag
              color={
                record.status === 'active'
                  ? 'success'
                  : record.status === 'draft'
                  ? 'warning'
                  : record.status === 'completed'
                  ? 'cyan'
                  : 'default'
              }
              className="text-[10px] uppercase font-bold"
            >
              {record.status}
            </Tag>
          </div>
          <Link
            href={route('staff.cash-incentives.show', record.id)}
            className="block text-sm font-bold text-slate-900 hover:text-emerald-700 transition"
          >
            {record.title}
          </Link>
          <p className="text-xs text-slate-500 line-clamp-1">{record.description || 'No description provided.'}</p>
        </div>
      ),
    },
    {
      title: 'Funding Year',
      dataIndex: 'funding_year',
      key: 'funding_year',
      align: 'center',
      render: (year) => <span className="font-bold text-slate-800">{year}</span>,
    },
    {
      title: 'Incentive / Beneficiary',
      dataIndex: 'amount_per_beneficiary',
      key: 'amount_per_beneficiary',
      align: 'right',
      render: (amount) => (
        <span className="font-mono font-bold text-emerald-800 text-sm">
          {formatPesos(amount)}
        </span>
      ),
    },
    {
      title: 'Beneficiaries',
      key: 'beneficiaries',
      align: 'center',
      render: (_, record) => (
        <div>
          <span className="font-bold text-slate-800">
            {record.approved_beneficiaries_count ?? 0}
          </span>
          <span className="text-slate-400 text-xs"> / {record.max_beneficiaries} max</span>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {record.total_beneficiaries_count ?? 0} selected
          </div>
        </div>
      ),
    },
    {
      title: 'Budget Utilization',
      key: 'budget',
      width: 200,
      render: (_, record) => {
        const released = record.released_amount ?? 0;
        const allocated = record.allocated_budget;
        const pct = record.budget_utilization_rate ?? 0;

        return (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-mono text-emerald-900 font-bold">{formatPesos(released)}</span>
              <span className="text-slate-500">{pct}%</span>
            </div>
            <Progress
              percent={pct}
              size="small"
              strokeColor={{ '0%': '#10b981', '100%': '#059669' }}
              showInfo={false}
            />
            <div className="text-[10px] text-slate-400">Budget: {formatPesos(allocated)}</div>
          </div>
        );
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'open',
                icon: <Eye size={15} />,
                label: (
                  <Link href={route('staff.cash-incentives.show', record.id)}>
                    Open Workspace
                  </Link>
                ),
              },
              {
                key: 'edit',
                icon: <Edit size={15} />,
                label: 'Edit Settings',
                onClick: () => handleOpenEdit(record),
              },
              {
                key: 'csv',
                icon: <ExternalLink size={15} />,
                label: (
                  <a href={route('staff.cash-incentives.reports.export-csv', record.id)} download>
                    Export Distribution CSV
                  </a>
                ),
              },
              ...(record.status === 'draft'
                ? [
                    { type: 'divider' as const },
                    {
                      key: 'delete',
                      icon: <Trash2 size={15} />,
                      label: 'Delete Draft Program',
                      danger: true,
                      onClick: () => handleDelete(record),
                    },
                  ]
                : []),
            ],
          }}
        >
          <Button type="text" shape="circle" icon={<MoreVertical size={16} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <StaffAuthLayout
      user={auth.user}
      header="Cash Incentives Management"
    >
      <Head title="Cash Incentives Management | Staff" />

      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Cash Incentives Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Administer cash incentive programs, select eligible youth beneficiaries, disburse funds, and monitor distribution.
            </p>
          </div>

          <div className="shrink-0">
            <Button
              type="primary"
              size="large"
              icon={<Plus size={16} />}
              onClick={handleOpenCreate}
              className="!bg-emerald-600 hover:!bg-emerald-700 shadow-sm font-semibold inline-flex items-center gap-1.5"
            >
              New Incentive Program
            </Button>
          </div>
        </div>

        {/* Global KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Total Allocated Budget</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Wallet size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatPesos(kpi.total_allocated_budget)}</p>
            <div className="mt-2 text-xs text-slate-500">
              Across <strong>{kpi.total_programs}</strong> registered programs
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
            <div className="flex items-center justify-between text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <span>Total Cash Disbursed</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                <Banknote size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-950">{formatPesos(kpi.total_released_amount)}</p>
            <div className="mt-2 text-xs text-emerald-700">
              <strong>{kpi.total_disbursed_count}</strong> beneficiaries successfully paid
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4 shadow-xs">
            <div className="flex items-center justify-between text-cyan-800 text-xs font-semibold uppercase tracking-wider">
              <span>Approved Beneficiaries</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-2xs">
                <UserCheck size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-cyan-950">{kpi.total_approved_beneficiaries}</p>
            <div className="mt-2 text-xs text-cyan-700">
              Verified & committed for distribution
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <span>Remaining Balance</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">{formatPesos(kpi.remaining_balance)}</p>
            <div className="mt-2 text-xs text-slate-500">
              <strong>{kpi.active_programs}</strong> programs currently active
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search programs by title or code..."
                prefix={<Search size={14} className="text-slate-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={() => applyFilters({ search })}
                allowClear
              />
            </div>

            <Select
              placeholder="Funding Year"
              allowClear
              value={yearFilter}
              onChange={(val) => {
                setYearFilter(val);
                applyFilters({ funding_year: val });
              }}
              style={{ width: 140 }}
              options={available_years.map((y) => ({ value: y, label: `${y} Funding` }))}
            />

            <Select
              placeholder="Status"
              allowClear
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(val);
                applyFilters({ status: val });
              }}
              style={{ width: 150 }}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'draft', label: 'Draft' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
          </div>

          <div className="text-xs text-slate-500">
            Showing <strong>{programs.data.length}</strong> of <strong>{programs.total}</strong> programs
          </div>
        </div>

        {/* Programs Table */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <Table
            columns={columns}
            dataSource={programs.data}
            rowKey="id"
            pagination={false}
          />

          {programs.total > programs.per_page && (
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <Pagination
                current={programs.current_page}
                total={programs.total}
                pageSize={programs.per_page}
                onChange={(page) => applyFilters({ page })}
                size="small"
              />
            </div>
          )}
        </div>
      </div>

      {/* Program Create / Edit Modal */}
      <ProgramCreateEditModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        program={editingProgram}
      />
    </StaffAuthLayout>
  );
}
