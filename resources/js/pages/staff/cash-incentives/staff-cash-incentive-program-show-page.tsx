import BeneficiarySelectionDrawer from '@/components/cash-incentives/staff/partials/beneficiary-selection-drawer';
import CashReleaseModal from '@/components/cash-incentives/staff/partials/cash-release-modal';
import DistributionBarangayTable from '@/components/cash-incentives/staff/partials/distribution-barangay-table';
import DistributionEducationTable from '@/components/cash-incentives/staff/partials/distribution-education-table';
import IndividualBeneficiaryLedgerModal from '@/components/cash-incentives/staff/partials/individual-beneficiary-ledger-modal';
import ProgramBudgetStatsBar from '@/components/cash-incentives/staff/partials/program-budget-stats-bar';
import ProgramCreateEditModal from '@/components/cash-incentives/staff/partials/program-create-edit-modal';
import { ReleaseStatusBadge } from '@/components/cash-incentives/staff/partials/release-status-badge';
import StaffAuthLayout from '@/layouts/staff-auth-layout';
import {
  CashIncentiveBeneficiary,
  CashIncentiveProgram,
  CashIncentiveProgramSummary,
} from '@/types/cash-incentive';
import { Head, Link, router } from '@inertiajs/react';
import {
  Avatar,
  Button,
  Checkbox,
  Dropdown,
  Input,
  Modal,
  Select,
  Table,
  Tabs,
  Tag,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ArrowLeft,
  Banknote,
  CheckCircle2,
  CheckSquare,
  Coins,
  Download,
  Edit,
  FileText,
  Filter,
  GraduationCap,
  MapPin,
  MoreVertical,
  Plus,
  RotateCcw,
  Search,
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
  const [releaseModalOpen, setReleaseModalOpen] = useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<CashIncentiveBeneficiary | null>(null);

  // Batch selection for releasing
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [batchReleasing, setBatchReleasing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [brgyFilter, setBrgyFilter] = useState<string>('all');

  // Reports data
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
    const isReleased = b.release?.status === 'released';
    const matchesSearch =
      !searchQuery ||
      b.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.reference_code && b.reference_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.student_id && b.student_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.barangay.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'released' && isReleased) ||
      (statusFilter === 'pending' && !isReleased);

    const matchesBrgy = brgyFilter === 'all' || b.barangay === brgyFilter;

    return matchesSearch && matchesStatus && matchesBrgy;
  });

  const handleOpenRelease = (b: CashIncentiveBeneficiary) => {
    setSelectedBeneficiary(b);
    setReleaseModalOpen(true);
  };

  const handleOpenLedger = (b: CashIncentiveBeneficiary) => {
    setSelectedBeneficiary(b);
    setLedgerModalOpen(true);
  };

  const handleRevertRelease = (b: CashIncentiveBeneficiary) => {
    Modal.confirm({
      title: 'Undo Cash Release?',
      content: `Revert disbursement for ${b.full_name} back to Pending? This will restore ₱${Number(
        program.amount_per_beneficiary
      ).toLocaleString()} to the program balance.`,
      okText: 'Yes, Undo Release',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        router.post(
          route('staff.cash-incentives.releases.revert', [program.id, b.id]),
          {},
          {
            preserveScroll: true,
            onSuccess: () => message.success('Disbursement reverted to pending.'),
          }
        );
      },
    });
  };

  const handleRemoveBeneficiary = (b: CashIncentiveBeneficiary) => {
    Modal.confirm({
      title: `Remove ${b.full_name} from list?`,
      content: 'This will remove this student from the program recipient list.',
      okText: 'Yes, Remove',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        router.delete(route('staff.cash-incentives.beneficiaries.destroy', [program.id, b.id]), {
          preserveScroll: true,
          onSuccess: () => message.success('Beneficiary removed.'),
        });
      },
    });
  };

  const handleBatchRelease = () => {
    if (selectedIds.length === 0) return;
    Modal.confirm({
      title: `Confirm Batch Disbursement?`,
      content: `Mark ${selectedIds.length} checked students as Cash Released? Total payout: ₱${(
        selectedIds.length * Number(program.amount_per_beneficiary)
      ).toLocaleString()}.`,
      okText: `Release to ${selectedIds.length} Students`,
      okType: 'primary',
      onOk: () => {
        setBatchReleasing(true);
        router.post(
          route('staff.cash-incentives.releases.batch', program.id),
          { beneficiary_ids: selectedIds },
          {
            preserveScroll: true,
            onSuccess: () => {
              setBatchReleasing(false);
              setSelectedIds([]);
              message.success('Selected beneficiaries marked as released!');
            },
            onError: () => setBatchReleasing(false),
          }
        );
      },
    });
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      // Only select pending beneficiaries
      const pendingIds = filteredBeneficiaries
        .filter((b) => b.release?.status !== 'released')
        .map((b) => b.id);
      setSelectedIds(pendingIds);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const formattedAmount =
    '₱' +
    Number(program.amount_per_beneficiary).toLocaleString('en-PH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const columns: ColumnsType<CashIncentiveBeneficiary> = [
    {
      title: 'Beneficiary Student',
      key: 'name',
      render: (_, record) => {
        const isReleased = record.release?.status === 'released';
        const isChecked = selectedIds.includes(record.id);

        return (
          <div className="flex items-center gap-3">
            {!isReleased && (
              <Checkbox
                checked={isChecked}
                onChange={(e) => toggleSelectOne(record.id, e.target.checked)}
              />
            )}
            <Avatar size="default" className="!bg-teal-600 font-bold shrink-0">
              {record.full_name[0] || 'Y'}
            </Avatar>
            <div className="min-w-0 leading-tight">
              <button
                type="button"
                onClick={() => handleOpenLedger(record)}
                className="text-left font-bold text-sm text-slate-900 hover:text-emerald-700 transition truncate max-w-56 block"
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
        );
      },
    },
    {
      title: 'School & Program',
      key: 'education',
      render: (_, record) => (
        <div className="leading-tight text-xs">
          <Tag color="cyan" className="text-[10px] m-0 mb-0.5">
            {record.educational_status || 'Enrolled'}
          </Tag>
          <p className="text-slate-700 font-medium truncate max-w-44">
            {record.school_name || 'N/A'}
          </p>
          {record.program && (
            <p className="text-[11px] text-slate-400 truncate max-w-44">{record.program}</p>
          )}
        </div>
      ),
    },
    {
      title: 'Cash Amount',
      key: 'amount',
      align: 'right',
      render: () => (
        <span className="font-mono font-bold text-slate-900 text-sm">{formattedAmount}</span>
      ),
    },
    {
      title: 'Disbursement Status',
      key: 'release_status',
      align: 'center',
      render: (_, record) => {
        const isReleased = record.release?.status === 'released';
        return (
          <div>
            <ReleaseStatusBadge status={record.release?.status} />
            {isReleased && record.release?.actual_release_date && (
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {record.release.actual_release_date}
              </span>
            )}
            {isReleased && record.release?.released_by && (
              <span className="text-[10px] text-emerald-700 block font-medium">
                By: {record.release.released_by}
              </span>
            )}
          </div>
        );
      },
    },
    {
      title: 'Payroll / Voucher #',
      key: 'ack_ref',
      render: (_, record) => (
        <span className="font-mono text-xs text-slate-700">
          {record.release?.acknowledgment_reference || '-'}
        </span>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      align: 'right',
      render: (_, record) => {
        const isReleased = record.release?.status === 'released';

        return (
          <div className="flex items-center justify-end gap-1.5">
            {!isReleased ? (
              <Button
                type="primary"
                size="small"
                onClick={() => handleOpenRelease(record)}
                className="!bg-emerald-600 hover:!bg-emerald-700 text-xs font-bold inline-flex items-center gap-1 shadow-xs"
              >
                <Banknote size={13} /> Release Cash ({formattedAmount})
              </Button>
            ) : (
              <Button
                size="small"
                onClick={() => handleOpenLedger(record)}
                className="text-xs font-semibold text-emerald-800 bg-emerald-50 border-emerald-200"
              >
                View Dossier
              </Button>
            )}

            <Dropdown
              trigger={['click']}
              menu={{
                items: [
                  {
                    key: 'ledger',
                    icon: <FileText size={14} />,
                    label: 'View Dossier Ledger',
                    onClick: () => handleOpenLedger(record),
                  },
                  ...(isReleased
                    ? [
                        {
                          key: 'undo',
                          icon: <RotateCcw size={14} />,
                          label: 'Undo / Revert to Pending',
                          danger: true,
                          onClick: () => handleRevertRelease(record),
                        },
                      ]
                    : [
                        {
                          key: 'remove',
                          icon: <Trash2 size={14} />,
                          label: 'Remove from List',
                          danger: true,
                          onClick: () => handleRemoveBeneficiary(record),
                        },
                      ]),
                ],
              }}
            >
              <Button type="text" shape="circle" icon={<MoreVertical size={15} />} />
            </Dropdown>
          </div>
        );
      },
    },
  ];

  const pendingEligible = filteredBeneficiaries.filter((b) => b.release?.status !== 'released');

  return (
    <StaffAuthLayout user={auth.user} header={program.title}>
      <Head title={`${program.title} | Cash Incentives`} />

      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={route('staff.cash-incentives.index')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition mb-1"
            >
              <ArrowLeft size={14} /> Back to Incentive Programs
            </Link>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-900 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {program.code}
              </span>
              <Tag color="success" className="font-bold uppercase text-xs">
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
              Add Students to List
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

        {/* Dynamic Budget Stats */}
        <ProgramBudgetStatsBar summary={summary} />

        {/* Tabbed Workspace */}
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
                    Recipient Students & Releasing ({beneficiaries.length})
                  </span>
                ),
                children: (
                  <div className="space-y-4 pt-2">
                    {/* Batch Release Toolbar when students are selected */}
                    {selectedIds.length > 0 && (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 rounded-xl p-3 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                          <CheckSquare size={16} className="text-emerald-700" />
                          <span>
                            {selectedIds.length} student{selectedIds.length > 1 ? 's' : ''} checked for payout (Total: ₱
                            {(selectedIds.length * Number(program.amount_per_beneficiary)).toLocaleString()})
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="small" onClick={() => setSelectedIds([])}>
                            Cancel
                          </Button>
                          <Button
                            type="primary"
                            loading={batchReleasing}
                            onClick={handleBatchRelease}
                            className="!bg-emerald-600 hover:!bg-emerald-700 font-bold"
                          >
                            Mark {selectedIds.length} as Released
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Filter controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 flex-1 flex-wrap">
                        <div className="w-full sm:w-64">
                          <Input
                            placeholder="Search student, reference code, barangay..."
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
                            { value: 'pending', label: '🟡 Pending Only' },
                            { value: 'released', label: '🟢 Released Only' },
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

                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {pendingEligible.length > 0 && (
                          <Checkbox
                            checked={selectedIds.length > 0 && selectedIds.length === pendingEligible.length}
                            indeterminate={selectedIds.length > 0 && selectedIds.length < pendingEligible.length}
                            onChange={(e) => toggleSelectAll(e.target.checked)}
                          >
                            Select All Pending
                          </Checkbox>
                        )}
                        <span>
                          Showing <strong>{filteredBeneficiaries.length}</strong> students
                        </span>
                      </div>
                    </div>

                    {/* Beneficiaries Table */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <Table
                        columns={columns}
                        dataSource={filteredBeneficiaries}
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
                    Distribution Reports & Analytics
                  </span>
                ),
                children: (
                  <div className="space-y-6 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Program Distribution Analytics
                        </h3>
                        <p className="text-xs text-slate-500">
                          Breakdown of cash releases by barangay and educational status.
                        </p>
                      </div>

                      <Button
                        type="primary"
                        icon={<Download size={14} />}
                        href={route('staff.cash-incentives.reports.export-csv', program.id)}
                        download
                        className="!bg-emerald-600 hover:!bg-emerald-700"
                      >
                        Download Full CSV
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
