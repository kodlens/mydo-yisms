import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { App, Badge, Button, Card, Descriptions, Drawer, Empty, Select, Space, Table, Tag, Tooltip } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  DollarSign,
  Eye,
  FileCheck,
  GraduationCap,
  HelpCircle,
  Info,
  MapPin,
  Receipt,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';

type Program = {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  funding_year: number;
  amount_per_beneficiary: string | number;
  status: string;
};

type Release = {
  id: number;
  amount: string | number;
  status: 'pending' | 'scheduled' | 'released' | 'unclaimed' | 'cancelled';
  scheduled_release_date?: string | null;
  actual_release_date?: string | null;
  acknowledgment_reference?: string | null;
  remarks?: string | null;
};

type BeneficiaryRecord = {
  id: number;
  program_id: number;
  status: 'pending' | 'approved' | 'rejected';
  selected_at: string;
  reviewed_at?: string | null;
  remarks?: string | null;
  historical_brgy_name?: string | null;
  historical_school_name?: string | null;
  historical_program?: string | null;
  historical_year_level?: number | null;
  program: Program;
  release?: Release | null;
};

type Props = {
  records: BeneficiaryRecord[];
  availableYears: number[];
  selectedYear: string;
  stats: {
    total_received: number;
    total_records: number;
    total_approved: number;
    total_released: number;
    total_pending: number;
  };
};

function formatCurrency(val?: number | string | null): string {
  const num = Number(val || 0);
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
  }).format(num);
}

function formatDate(val?: string | null): string {
  if (!val) return '—';
  const d = new Date(val);
  return Number.isNaN(d.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
}

const releaseStatusConfig: Record<string, { color: string; label: string }> = {
  released: { color: 'green', label: 'Disbursed / Released' },
  scheduled: { color: 'blue', label: 'Scheduled for Release' },
  pending: { color: 'gold', label: 'Pending Processing' },
  unclaimed: { color: 'orange', label: 'Unclaimed' },
  cancelled: { color: 'red', label: 'Cancelled' },
};

const YouthCashIncentivesPage = ({
  records = [],
  availableYears = [],
  selectedYear = 'all',
  stats,
}: Props) => {
  const [selectedRecord, setSelectedRecord] = useState<BeneficiaryRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleYearChange = (year: string) => {
    router.get(
      route('youth.youth-cash-incentives.index'),
      { year: year === 'all' ? undefined : year },
      { preserveState: true, preserveScroll: true },
    );
  };

  const handleViewDetails = (record: BeneficiaryRecord) => {
    setSelectedRecord(record);
    setDrawerOpen(true);
  };

  const yearOptions = [
    { value: 'all', label: 'All Academic / Funding Years' },
    ...availableYears.map((y) => ({
      value: String(y),
      label: `Academic / Funding Year ${y}`,
    })),
  ];

  const columns: ColumnsType<BeneficiaryRecord> = [
    {
      title: 'Program & Code',
      key: 'program',
      render: (_, r) => (
        <div className="space-y-0.5">
          <p className="font-bold text-slate-900 text-sm">{r.program?.title}</p>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-teal-700 font-semibold">{r.program?.code}</span>
            <Tag color="cyan" className="m-0 text-[10px]">
              A.Y. {r.program?.funding_year}
            </Tag>
          </div>
        </div>
      ),
    },
    {
      title: 'Grant Amount',
      key: 'amount',
      width: 140,
      render: (_, r) => {
        const amount = r.release?.amount ?? r.program?.amount_per_beneficiary;
        return (
          <span className="font-bold text-slate-900 text-sm">
            {formatCurrency(amount)}
          </span>
        );
      },
    },
    {
      title: 'Beneficiary Status',
      key: 'status',
      width: 140,
      render: (_, r) => (
        <Tag color={r.status === 'approved' ? 'green' : r.status === 'rejected' ? 'red' : 'gold'}>
          {r.status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Release Status',
      key: 'release_status',
      width: 170,
      render: (_, r) => {
        if (!r.release) {
          return <Tag color="default">Not Scheduled</Tag>;
        }
        const cfg = releaseStatusConfig[r.release.status] ?? { color: 'default', label: r.release.status };
        return <Tag color={cfg.color}>{cfg.label}</Tag>;
      },
    },
    {
      title: 'Disbursement Date',
      key: 'date',
      width: 150,
      render: (_, r) => {
        if (r.release?.actual_release_date) {
          return (
            <span className="text-xs text-slate-700">
              {formatDate(r.release.actual_release_date)}
            </span>
          );
        }
        if (r.release?.scheduled_release_date) {
          return (
            <span className="text-xs text-blue-700">
              Sched: {formatDate(r.release.scheduled_release_date)}
            </span>
          );
        }
        return <span className="text-xs text-slate-400">—</span>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, r) => (
        <Button
          size="small"
          icon={<Eye className="h-3.5 w-3.5" />}
          onClick={() => handleViewDetails(r)}
        >
          Details
        </Button>
      ),
    },
  ];

  return (
    <>
      <Head title="My Cash Incentives" />

      <div className="mx-auto max-w-7xl space-y-6">
        {/* ================= HEADER SECTION ================= */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                  <Wallet className="h-3.5 w-3.5 text-emerald-700" />
                  Financial Assistance & Grants
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                My Cash Incentives
              </h1>
              <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
                Official records of cash grants, college student allowances, and financial assistance awarded to you by the Municipal Youth Development Office.
              </p>
            </div>

            {/* Academic Year Filter */}
            <div className="flex flex-col gap-1.5 self-start sm:self-center">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Filter by Academic / Funding Year
              </span>
              <Select
                value={selectedYear}
                onChange={handleYearChange}
                options={yearOptions}
                size="large"
                className="w-full sm:w-64"
              />
            </div>
          </div>
        </section>

        {/* ================= KPI STATS STRIP ================= */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700">
                <Banknote className="h-5 w-5" />
              </span>
              <Tag color="green" className="m-0 text-xs">
                Total Disbursed
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Grants Received
              </span>
              <p className="mt-1 text-2xl font-bold text-emerald-800">
                {formatCurrency(stats.total_received)}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {stats.total_released} release(s) credited
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
                <FileCheck className="h-5 w-5" />
              </span>
              <Tag color="cyan" className="m-0 text-xs">
                Records
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Incentive Grants
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total_records}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Across all programs
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
                <UserCheck className="h-5 w-5" />
              </span>
              <Tag color="blue" className="m-0 text-xs">
                Beneficiary
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Approved Beneficiary
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total_approved}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Confirmed by MYDO evaluation
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
                <Clock className="h-5 w-5" />
              </span>
              <Tag color="gold" className="m-0 text-xs">
                In Queue
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending / Scheduled
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.total_pending}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Awaiting distribution release
              </p>
            </div>
          </div>
        </section>

        {/* ================= INCENTIVE RECORDS TABLE ================= */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="rounded-lg bg-teal-50 p-2 text-teal-800">
                <Receipt className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Cash Incentive Ledger
                  {selectedYear !== 'all' ? ` (Year ${selectedYear})` : ''}
                </h2>
                <p className="text-xs text-slate-500">
                  Detailed ledger of educational stipends, cash prizes, and aid disbursements.
                </p>
              </div>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              {records.length} record(s) found
            </span>
          </div>

          <Table<BeneficiaryRecord>
            dataSource={records}
            columns={columns}
            rowKey={(r) => r.id}
            pagination={false}
            scroll={{ x: 780 }}
            locale={{
              emptyText: (
                <div className="py-12 text-center">
                  <Wallet className="mx-auto h-12 w-12 text-slate-300" />
                  <h3 className="mt-3 text-base font-bold text-slate-800">
                    No Cash Incentive Records Found
                  </h3>
                  <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    {selectedYear !== 'all'
                      ? `No incentive records were found for Academic / Funding Year ${selectedYear}. Try switching the filter to "All Years".`
                      : 'You do not have any cash incentive records on file yet. Once your beneficiary nomination is approved and disbursed by MYDO, your receipt details will be displayed here.'}
                  </p>
                </div>
              ),
            }}
          />
        </section>

        {/* ================= INFORMATION CALLOUT ================= */}
        <section className="rounded-xl border border-teal-100 bg-teal-50/60 p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-teal-700 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs text-teal-900 leading-relaxed">
              <p className="font-bold">Official Municipal Disbursement Notice</p>
              <p>
                All cash assistance amounts and incentives listed here are officially disbursed through the Municipal Treasury and the Municipal Youth Development Office (MYDO). Always keep your reference code and valid student ID when claiming scheduled stipends.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ================= DETAIL DRAWER ================= */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={560}
        title={
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-teal-700" />
            <span className="font-bold text-slate-900 text-base">Incentive Record Details</span>
          </div>
        }
      >
        {selectedRecord && (
          <div className="space-y-6">
            {/* Header Highlight Card */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                    Program Title
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {selectedRecord.program?.title}
                  </h3>
                  <p className="font-mono text-xs text-slate-500 mt-0.5">
                    Code: {selectedRecord.program?.code}
                  </p>
                </div>
                <Tag color="cyan" className="font-semibold text-xs m-0">
                  A.Y. {selectedRecord.program?.funding_year}
                </Tag>
              </div>

              {selectedRecord.program?.description && (
                <p className="text-xs text-slate-600 leading-relaxed pt-2 border-t border-slate-200/60">
                  {selectedRecord.program.description}
                </p>
              )}
            </div>

            {/* Grant & Disbursement Status */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Disbursement & Release Information
              </h4>

              <Descriptions size="small" column={1} className="text-xs">
                <Descriptions.Item label="Grant Amount">
                  <span className="font-bold text-emerald-800 text-sm">
                    {formatCurrency(selectedRecord.release?.amount ?? selectedRecord.program?.amount_per_beneficiary)}
                  </span>
                </Descriptions.Item>

                <Descriptions.Item label="Beneficiary Evaluation">
                  <Tag color={selectedRecord.status === 'approved' ? 'green' : 'gold'}>
                    {selectedRecord.status.toUpperCase()}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Release Status">
                  {selectedRecord.release ? (
                    <Tag color={releaseStatusConfig[selectedRecord.release.status]?.color ?? 'default'}>
                      {releaseStatusConfig[selectedRecord.release.status]?.label ?? selectedRecord.release.status}
                    </Tag>
                  ) : (
                    <Tag color="default">Pending Schedule</Tag>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Release / Disbursement Date">
                  {selectedRecord.release?.actual_release_date ? (
                    <span className="font-semibold text-slate-800">
                      {formatDate(selectedRecord.release.actual_release_date)}
                    </span>
                  ) : selectedRecord.release?.scheduled_release_date ? (
                    <span className="text-blue-700">
                      Scheduled for {formatDate(selectedRecord.release.scheduled_release_date)}
                    </span>
                  ) : (
                    '—'
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Acknowledgment Reference">
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedRecord.release?.acknowledgment_reference || '—'}
                  </span>
                </Descriptions.Item>

                {selectedRecord.release?.remarks && (
                  <Descriptions.Item label="Disbursement Notes">
                    <span className="text-slate-600">{selectedRecord.release.remarks}</span>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>

            {/* Historical Student Snapshot at Grant Selection */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Student Record Snapshot at Evaluation
              </h4>

              <Descriptions size="small" column={1} className="text-xs">
                <Descriptions.Item label="College / University">
                  {selectedRecord.historical_school_name || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Course / Program">
                  {selectedRecord.historical_program || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Year Level">
                  {selectedRecord.historical_year_level ? `${selectedRecord.historical_year_level}th Year College` : '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Registered Barangay">
                  {selectedRecord.historical_brgy_name || '—'}
                </Descriptions.Item>
                <Descriptions.Item label="Selection Date">
                  {formatDate(selectedRecord.selected_at)}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        )}
      </Drawer>
    </>
  );
};

YouthCashIncentivesPage.layout = (page: ReactNode) => (
  <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user} header="Cash Incentives">
    {page}
  </YouthAuthLayout>
);

export default YouthCashIncentivesPage;
