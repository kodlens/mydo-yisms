import BeneficiaryReviewModal from '@/components/cash-incentives/staff/partials/beneficiary-review-modal';
import BeneficiarySelectionDrawer from '@/components/cash-incentives/staff/partials/beneficiary-selection-drawer';
import CashReleaseModal from '@/components/cash-incentives/staff/partials/cash-release-modal';
import DistributionBarangayTable from '@/components/cash-incentives/staff/partials/distribution-barangay-table';
import DistributionEducationTable from '@/components/cash-incentives/staff/partials/distribution-education-table';
import IndividualBeneficiaryLedgerModal from '@/components/cash-incentives/staff/partials/individual-beneficiary-ledger-modal';
import ProgramBudgetStatsBar from '@/components/cash-incentives/staff/partials/program-budget-stats-bar';
import ProgramCreateEditModal from '@/components/cash-incentives/staff/partials/program-create-edit-modal';
import {
  BeneficiaryStatusBadge,
  ReleaseStatusBadge,
} from '@/components/cash-incentives/staff/partials/release-status-badge';
import StaffAuthLayout from '@/layouts/staff-auth-layout';
import {
  CashIncentiveBeneficiary,
  CashIncentiveProgram,
  CashIncentiveProgramSummary,
} from '@/types/cash-incentive';
import { Head, Link, router } from '@inertiajs/react';
import {
  Alert,
  Avatar,
  Button,
  Dropdown,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Coins,
  Download,
  Edit,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Filter,
  GraduationCap,
  HelpCircle,
  MapPin,
  MoreVertical,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  program: CashIncentiveProgram;
  summary: CashIncentiveProgramSummary;
  beneficiaries: CashIncentiveBeneficiary[];
  barangays: { brgyCode: string; brgyDesc: string }[];
  auth: { user: any };
};

export default function StaffCashIncentiveProgramShowPage({
  program,
  summary,
  beneficiaries,
  barangays,
  auth,
}: Props) {
  const [activeTab, setActiveTab] = useState('beneficiaries');

  // Modals state
  const [selectionDrawerOpen, setSelectionDrawerOpen] = useState(false);
  const [editProgramModalOpen, setEditProgramModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<CashIncentiveBeneficiary | null>(null);

  // Beneficiaries filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brgyFilter, setBrgyFilter] = useState<string>('all');

  // Reports data state (for tab 3)
  const [reportsLoading, setReportsLoading] = useState(false);
  const [reportsData, setReportsData] = useState<any>(null);

  const fetchReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch(route('staff.cash-incentives.reports.summary', program.id), {
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        const json = await res.json();
        setReportsData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReportsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);

  // Filtered beneficiaries
  const filteredBeneficiaries = beneficiaries.filter((b) => {
    const matchesSearch =
      !searchQuery ||
      b.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.reference_code && b.reference_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.student_id && b.student_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.barangay.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesBrgy = brgyFilter === 'all' || b.barangay === brgyFilter;

    return matchesSearch && matchesStatus && matchesBrgy;
  });

  // Approved beneficiaries for release tab
  const approvedBeneficiaries = beneficiaries.filter((b) => b.status === 'approved');

  const handleOpenReview = (b: CashIncentiveBeneficiary) => {
    setSelectedBeneficiary(b);
    setReviewModalOpen(true);
  };

  const handleOpenRelease = (b: CashIncentiveBeneficiary) => {
    setSelectedBeneficiary(b);
    setReleaseModalOpen(true);
  };

  const handleOpenLedger = (b: CashIncentiveBeneficiary) => {
    setSelectedBeneficiary(b);
    setLedgerModalOpen(true);
  };

  const handleRemoveBeneficiary = (b: CashIncentiveBeneficiary) => {
    Modal.confirm({
      title: `Remove ${b.full_name} from Program?`,
      content: 'This will remove this youth member from the beneficiary selection. They can be re-selected later if needed.',
      okText: 'Yes, Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        router.delete(route('staff.cash-incentives.beneficiaries.destroy', [program.id, b.id]));
      },
    });
  };

  const handleMarkUnclaimed = (b: CashIncentiveBeneficiary) => {
    if (!b.release) return;
    Modal.confirm({
      title: 'Mark Release as Unclaimed?',
      content: `Mark cash release for ${b.full_name} as unclaimed? The beneficiary can claim at a later scheduled date.`,
      okText: 'Confirm Unclaimed',
      onOk: () => {
        router.post(route('staff.cash-incentives.releases.status', [program.id, b.release!.id]), {
          status: 'unclaimed',
          remarks: 'Marked as unclaimed after distribution period window elapsed.',
        });
      },
    });
  };

  // Columns for Beneficiaries Tab
  const beneficiaryColumns: ColumnsType<CashIncentiveBeneficiary> = [
    {
      title: 'Beneficiary Candidate',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar size="default" className="!bg-teal-600 font-bold shrink-0">
            {record.full_name[0] || 'Y'}
          </Avatar>
          <div className="min-w-0 leading-tight">
            <button
              type="button"
              onClick={() => handleOpenLedger(record)}
              className="text-left font-bold text-sm text-slate-900 hover:text-emerald-700 transition truncate max-w-48 block"
            >
              {record.full_name}
            </button>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 flex-wrap">
              {record.reference_code && (
                <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  {record.reference_code}
                </span>
              )}
              <span>•</span>
              <span className="inline-flex items-center gap-0.5">
                <MapPin size={11} className="text-slate-400" /> {record.barangay}
              </span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Education & School',
      key: 'education',
      render: (_, record) => (
        <div className="leading-tight">
          <Tag color="cyan" className="text-[10px] m-0 mb-0.5">
            {record.educational_status || 'N/A'}
          </Tag>
          <p className="text-xs text-slate-700 font-medium truncate max-w-44">
            {record.school_name || 'N/A'}
          </p>
          {record.program && (
            <p className="text-[11px] text-slate-400 truncate max-w-44">{record.program}</p>
          )}
        </div>
      ),
    },
    {
      title: 'Eligibility Status',
      key: 'status',
      align: 'center',
      render: (_, record) => <BeneficiaryStatusBadge status={record.status} />,
    },
    {
      title: 'Selection & Review',
      key: 'review',
      render: (_, record) => (
        <div className="text-xs space-y-0.5">
          {record.status === 'approved' && (
            <div className="text-emerald-800">
              <span className="font-semibold block">Approved by: {record.reviewed_by || 'Staff'}</span>
              <span className="text-[10px] text-slate-400">{record.reviewed_at}</span>
            </div>
          )}
          {record.status === 'rejected' && (
            <div className="text-rose-700 max-w-48">
              <span className="font-semibold block">Rejected: {record.rejection_reason}</span>
              <span className="text-[10px] text-slate-400">{record.reviewed_at}</span>
            </div>
          )}
          {record.status === 'pending' && (
            <div className="text-slate-500">
              <span>Selected {record.selected_at}</span>
              <span className="text-[10px] text-slate-400 block">Awaiting review</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Disbursement',
      key: 'release_status',
      align: 'center',
      render: (_, record) => (
        <div>
          <ReleaseStatusBadge status={record.release?.status} />
          {record.release?.actual_release_date && (
            <span className="text-[10px] text-slate-400 block mt-0.5">
              {record.release.actual_release_date}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1.5">
          {record.status === 'pending' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenReview(record)}
              className="!bg-emerald-600 hover:!bg-emerald-700 text-xs font-semibold"
            >
              Review
            </Button>
          )}

          {record.status === 'approved' && record.release?.status !== 'released' && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenRelease(record)}
              className="!bg-emerald-600 hover:!bg-emerald-700 text-xs font-semibold inline-flex items-center gap-1"
            >
              <Banknote size={13} /> Disburse
            </Button>
          )}

          <Dropdown
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'ledger',
                  icon: <FileText size={14} />,
                  label: 'View Dossier & Ledger',
                  onClick: () => handleOpenLedger(record),
                },
                {
                  key: 're_review',
                  icon: <ShieldCheck size={14} />,
                  label: 'Re-evaluate Status',
                  disabled: record.release?.status === 'released',
                  onClick: () => handleOpenReview(record),
                },
                ...(record.status !== 'approved' || record.release?.status !== 'released'
                  ? [
                      { type: 'divider' as const },
                      {
                        key: 'remove',
                        icon: <Trash2 size={14} />,
                        label: 'Remove from Program',
                        danger: true,
                        onClick: () => handleRemoveBeneficiary(record),
                      },
                    ]
                  : []),
              ],
            }}
          >
            <Button type="text" shape="circle" icon={<MoreVertical size={15} />} />
          </Dropdown>
        </div>
      ),
    },
  ];

  // Columns for Cash Release Management Tab
  const releaseColumns: ColumnsType<CashIncentiveBeneficiary> = [
    {
      title: 'Beneficiary Recipient',
      key: 'recipient',
      render: (_, record) => (
        <div>
          <button
            type="button"
            onClick={() => handleOpenLedger(record)}
            className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition"
          >
            {record.full_name}
          </button>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span className="font-mono text-emerald-800 font-bold">{record.reference_code}</span>
            <span>•</span>
            <span>{record.barangay}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Fixed Amount',
      key: 'amount',
      align: 'right',
      render: () => (
        <span className="font-mono font-bold text-slate-900 text-sm">
          ₱{program.amount_per_beneficiary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: 'Release Status',
      key: 'release_status',
      align: 'center',
      render: (_, record) => <ReleaseStatusBadge status={record.release?.status} />,
    },
    {
      title: 'Acknowledgment Ref',
      key: 'ack_ref',
      render: (_, record) => (
        <div>
          <span className="font-mono font-bold text-slate-800">
            {record.release?.acknowledgment_reference || 'Pending Release'}
          </span>
          {record.release?.released_by && (
            <span className="text-[10px] text-slate-400 block">
              By: {record.release.released_by}
            </span>
          )}
        </div>
      ),
    },
    {
      title: 'Disbursement Date',
      key: 'release_date',
      render: (_, record) => (
        <span className="text-xs text-slate-600">
          {record.release?.actual_release_date || record.release?.scheduled_release_date || '-'}
        </span>
      ),
    },
    {
      title: 'Receipt Proof',
      key: 'proof',
      align: 'center',
      render: (_, record) =>
        record.release?.supporting_document_url ? (
          <a
            href={record.release.supporting_document_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-700 font-bold underline hover:text-emerald-900"
          >
            <FileCheck size={14} /> View File
          </a>
        ) : (
          <span className="text-slate-400 text-xs">None</span>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      align: 'right',
      render: (_, record) => (
        <div className="flex items-center justify-end gap-1.5">
          {record.release?.status !== 'released' ? (
            <Button
              type="primary"
              size="small"
              onClick={() => handleOpenRelease(record)}
              className="!bg-emerald-600 hover:!bg-emerald-700 text-xs font-semibold inline-flex items-center gap-1"
            >
              <Banknote size={13} /> Record Release
            </Button>
          ) : (
            <Button
              size="small"
              onClick={() => handleOpenLedger(record)}
              className="text-xs font-medium"
            >
              View Receipt
            </Button>
          )}

          {record.release?.status === 'pending' && (
            <Button
              size="small"
              onClick={() => handleMarkUnclaimed(record)}
              className="text-xs text-amber-700"
            >
              Mark Unclaimed
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <StaffAuthLayout user={auth.user} header={program.title}>
      <Head title={`${program.title} | Cash Incentives Workspace`} />

      <div className="space-y-6">
        {/* Back Link & Program Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={route('staff.cash-incentives.index')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition mb-1"
            >
              <ArrowLeft size={14} /> Back to Cash Incentive Programs
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {program.code}
              </span>
              <Tag
                color={
                  program.status === 'active'
                    ? 'success'
                    : program.status === 'draft'
                    ? 'warning'
                    : 'default'
                }
                className="font-bold uppercase text-xs"
              >
                {program.status}
              </Tag>
              <Tag color="blue" className="font-semibold text-xs">
                {program.funding_year} Funding Year
              </Tag>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              {program.title}
            </h1>
            <p className="text-sm text-slate-500">{program.description || 'No description provided.'}</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button
              type="primary"
              size="large"
              icon={<UserPlus size={16} />}
              onClick={() => setSelectionDrawerOpen(true)}
              className="!bg-emerald-600 hover:!bg-emerald-700 shadow-sm font-semibold inline-flex items-center gap-1.5"
            >
              Select Beneficiaries
            </Button>

            <Button
              icon={<Edit size={15} />}
              onClick={() => setEditProgramModalOpen(true)}
              className="font-medium"
            >
              Settings
            </Button>

            <Button
              icon={<Download size={15} />}
              href={route('staff.cash-incentives.reports.export-csv', program.id)}
              download
              className="font-medium"
            >
              Export CSV
            </Button>
          </div>
        </div>

        {/* Dynamic Budget Utilization KPI Bar */}
        <ProgramBudgetStatsBar summary={summary} />

        {/* Master Workspace Tabs */}
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs p-5">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'beneficiaries',
                label: (
                  <span className="inline-flex items-center gap-2 font-bold text-sm">
                    <Users size={16} />
                    Beneficiary Review ({beneficiaries.length})
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-2">
                    {/* Filter controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <div className="w-full sm:w-64">
                          <Input
                            placeholder="Filter by name, reference code, barangay..."
                            prefix={<Search size={14} className="text-slate-400" />}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            allowClear
                          />
                        </div>

                        <Select
                          value={statusFilter}
                          onChange={setStatusFilter}
                          style={{ width: 150 }}
                          options={[
                            { value: 'all', label: 'All Statuses' },
                            { value: 'pending', label: 'Pending Review' },
                            { value: 'approved', label: 'Approved' },
                            { value: 'rejected', label: 'Rejected' },
                          ]}
                        />

                        <Select
                          value={brgyFilter}
                          onChange={setBrgyFilter}
                          style={{ width: 170 }}
                          options={[
                            { value: 'all', label: 'All Barangays' },
                            ...Array.from(new Set(beneficiaries.map((b) => b.barangay))).map((brgy) => ({
                              value: brgy,
                              label: brgy,
                            })),
                          ]}
                        />
                      </div>

                      <div className="text-xs text-slate-500">
                        Showing <strong>{filteredBeneficiaries.length}</strong> candidates
                      </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <Table
                        columns={beneficiaryColumns}
                        dataSource={filteredBeneficiaries}
                        rowKey="id"
                        pagination={{ pageSize: 10, size: 'small' }}
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: 'releases',
                label: (
                  <span className="inline-flex items-center gap-2 font-bold text-sm">
                    <Banknote size={16} />
                    Cash Release Management ({approvedBeneficiaries.length})
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-2">
                    <Alert
                      type="success"
                      showIcon
                      message="Eligible Disbursement Roster"
                      description={`Only candidates verified and approved for eligibility are eligible for cash release. All disbursements enforce the program's fixed rate of ₱${program.amount_per_beneficiary.toLocaleString()}.`}
                    />

                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <Table
                        columns={releaseColumns}
                        dataSource={approvedBeneficiaries}
                        rowKey="id"
                        pagination={{ pageSize: 10, size: 'small' }}
                      />
                    </div>
                  </div>
                ),
              },
              {
                key: 'reports',
                label: (
                  <span className="inline-flex items-center gap-2 font-bold text-sm">
                    <FileText size={16} />
                    Distribution Analytics & Reports
                  </span>
                ),
                children: (
                  <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Program Distribution & Demographic Reports
                        </h3>
                        <p className="text-xs text-slate-500">
                          Breakdown of beneficiaries across barangays, educational categories, and cash disbursement status.
                        </p>
                      </div>

                      <Button
                        type="primary"
                        icon={<Download size={14} />}
                        href={route('staff.cash-incentives.reports.export-csv', program.id)}
                        download
                        className="!bg-emerald-600 hover:!bg-emerald-700"
                      >
                        Download Full Distribution CSV
                      </Button>
                    </div>

                    {/* Barangay Distribution */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        1. Distribution by Barangay
                      </h4>
                      <DistributionBarangayTable data={reportsData?.by_barangay || []} />
                    </div>

                    {/* Educational Status Distribution */}
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                        2. Recipients by Educational Status
                      </h4>
                      <DistributionEducationTable data={reportsData?.by_education || []} />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Beneficiary Selection Drawer */}
      <BeneficiarySelectionDrawer
        open={selectionDrawerOpen}
        onClose={() => setSelectionDrawerOpen(false)}
        program={program}
        barangays={barangays}
        currentCount={beneficiaries.length}
      />

      {/* Program Settings Modal */}
      <ProgramCreateEditModal
        open={editProgramModalOpen}
        onClose={() => setEditProgramModalOpen(false)}
        program={program}
      />

      {/* Individual Review Modal */}
      <BeneficiaryReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        beneficiary={selectedBeneficiary}
        program={program}
      />

      {/* Cash Release Modal */}
      <CashReleaseModal
        open={releaseModalOpen}
        onClose={() => setReleaseModalOpen(false)}
        beneficiary={selectedBeneficiary}
        program={program}
      />

      {/* Individual Beneficiary Ledger Modal */}
      <IndividualBeneficiaryLedgerModal
        open={ledgerModalOpen}
        onClose={() => setLedgerModalOpen(false)}
        beneficiary={selectedBeneficiary}
        program={program}
      />
    </StaffAuthLayout>
  );
}
