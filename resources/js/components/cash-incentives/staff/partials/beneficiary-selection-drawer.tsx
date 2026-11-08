import { AvailableYouth, CashIncentiveProgram } from '@/types/cash-incentive';
import { router } from '@inertiajs/react';
import {
  Avatar,
  Button,
  Checkbox,
  Drawer,
  Empty,
  Input,
  Pagination,
  Select,
  Spin,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  AlertCircle,
  CheckCircle,
  CheckSquare,
  Filter,
  GraduationCap,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  program: CashIncentiveProgram;
  barangays: { brgyCode: string; brgyDesc: string }[];
  currentCount: number;
};

export default function BeneficiarySelectionDrawer({
  open,
  onClose,
  program,
  barangays,
  currentCount,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [youthList, setYouthList] = useState<AvailableYouth[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Selection checkboxes
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedBrgy, setSelectedBrgy] = useState<string | undefined>(undefined);
  const [selectedEduStatus, setSelectedEduStatus] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedSex, setSelectedSex] = useState<string | undefined>(undefined);

  const [selectingId, setSelectingId] = useState<number | null>(null);

  const fetchYouthPool = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('per_page', '8');
      if (search) params.append('search', search);
      if (selectedBrgy) params.append('brgy_code', selectedBrgy);
      if (selectedEduStatus) params.append('educational_status', selectedEduStatus);
      if (selectedYear) params.append('year_level', String(selectedYear));
      if (selectedSex) params.append('sex', selectedSex);

      const res = await fetch(
        `${route('staff.cash-incentives.eligible-youth', program.id)}?${params.toString()}`,
        {
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          credentials: 'same-origin',
        }
      );

      if (res.ok) {
        const json = await res.json();
        setYouthList(json.data || []);
        setTotal(json.total || 0);
        setCurrentPage(json.current_page || 1);
        setSelectedIds([]);
      } else {
        message.error('Failed to load eligible youth profiles.');
      }
    } catch (e) {
      console.error(e);
      message.error('Network error while querying youth profiles.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchYouthPool(1);
    }
  }, [open, selectedBrgy, selectedEduStatus, selectedYear, selectedSex]);

  // Individual selection
  const handleSelectOne = (youth: AvailableYouth) => {
    setSelectingId(youth.id);
    router.post(
      route('staff.cash-incentives.beneficiaries.select', program.id),
      { youth_profile_id: youth.id },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setSelectingId(null);
          message.success(`${youth.full_name} added to program beneficiaries!`);
          fetchYouthPool(currentPage);
        },
        onError: (errs) => {
          setSelectingId(null);
          const firstErr = Object.values(errs)[0];
          message.error(firstErr ? String(firstErr) : 'Could not add beneficiary.');
        },
      }
    );
  };

  // Batch selection
  const handleSelectBatch = () => {
    if (selectedIds.length === 0) return;

    setSubmitting(true);
    router.post(
      route('staff.cash-incentives.beneficiaries.select', program.id),
      { youth_profile_ids: selectedIds },
      {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          setSubmitting(false);
          message.success(`${selectedIds.length} youth members added to beneficiaries!`);
          setSelectedIds([]);
          fetchYouthPool(currentPage);
        },
        onError: (errs) => {
          setSubmitting(false);
          const firstErr = Object.values(errs)[0];
          message.error(firstErr ? String(firstErr) : 'Could not add selected beneficiaries.');
        },
      }
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      const remainingQuota = Math.max(0, program.max_beneficiaries - currentCount);
      const idsToAdd = youthList.slice(0, remainingQuota).map((y) => y.id);
      setSelectedIds(idsToAdd);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id: number, checked: boolean) => {
    if (checked) {
      if (currentCount + selectedIds.length >= program.max_beneficiaries) {
        message.warning(`Maximum program capacity of ${program.max_beneficiaries} beneficiaries reached.`);
        return;
      }
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id));
    }
  };

  const isLimitReached = currentCount >= program.max_beneficiaries;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={740}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Select Youth Beneficiaries</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {program.title} ({program.code})
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Quota & Slots</span>
            <span
              className={`text-xs font-bold ${
                isLimitReached ? 'text-rose-600' : 'text-emerald-700'
              }`}
            >
              {currentCount} / {program.max_beneficiaries} Selected
            </span>
          </div>
        </div>
      }
      footer={
        selectedIds.length > 0 ? (
          <div className="flex items-center justify-between bg-emerald-50 -m-6 p-4 border-t border-emerald-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
              <CheckSquare size={16} className="text-emerald-700" />
              <span>
                <strong>{selectedIds.length}</strong> youth selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button size="small" onClick={() => setSelectedIds([])}>
                Clear
              </Button>
              <Button
                type="primary"
                loading={submitting}
                onClick={handleSelectBatch}
                className="!bg-emerald-600 hover:!bg-emerald-700 font-bold"
              >
                Add {selectedIds.length} to Beneficiaries
              </Button>
            </div>
          </div>
        ) : null
      }
    >
      <div className="space-y-4 pb-12">
        {isLimitReached && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>
              <strong>Limit Reached:</strong> This program has reached its maximum quota of{' '}
              {program.max_beneficiaries} beneficiaries.
            </span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
            <div className="sm:col-span-3">
              <Input
                placeholder="Search by full name, reference code, student ID, email..."
                prefix={<Search size={14} className="text-slate-400" />}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onPressEnter={() => fetchYouthPool(1)}
                allowClear
              />
            </div>
            <div>
              <Button
                type="primary"
                onClick={() => fetchYouthPool(1)}
                loading={loading}
                className="w-full !bg-emerald-600 hover:!bg-emerald-700 font-medium"
              >
                Search Pool
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Barangay Filter */}
            <div>
              <Select
                placeholder="All Barangays"
                allowClear
                value={selectedBrgy}
                onChange={(val) => setSelectedBrgy(val)}
                className="w-full"
                showSearch
                optionFilterProp="label"
                options={barangays.map((b) => ({ value: b.brgyCode, label: b.brgyDesc }))}
              />
            </div>

            {/* Educational Status Filter */}
            <div>
              <Select
                placeholder="Education Status"
                allowClear
                value={selectedEduStatus}
                onChange={(val) => setSelectedEduStatus(val)}
                className="w-full"
                options={[
                  { value: 'enrolled', label: 'In-School / Enrolled' },
                  { value: 'graduated', label: 'Graduated' },
                  { value: 'out_of_school', label: 'Out of School' },
                ]}
              />
            </div>

            {/* Year Level Filter */}
            <div>
              <Select
                placeholder="Year Level"
                allowClear
                value={selectedYear}
                onChange={(val) => setSelectedYear(val)}
                className="w-full"
                options={[
                  { value: 1, label: '1st Year' },
                  { value: 2, label: '2nd Year' },
                  { value: 3, label: '3rd Year' },
                  { value: 4, label: '4th Year' },
                ]}
              />
            </div>

            {/* Sex Filter */}
            <div>
              <Select
                placeholder="Sex"
                allowClear
                value={selectedSex}
                onChange={(val) => setSelectedSex(val)}
                className="w-full"
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                ]}
              />
            </div>
          </div>
        </div>

        {/* Toolbar: Select All & Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <div className="flex items-center gap-2">
            {!isLimitReached && youthList.length > 0 && (
              <Checkbox
                checked={selectedIds.length > 0 && selectedIds.length === youthList.length}
                indeterminate={selectedIds.length > 0 && selectedIds.length < youthList.length}
                onChange={(e) => toggleSelectAll(e.target.checked)}
              >
                <span className="font-medium text-slate-700">Select All on Page</span>
              </Checkbox>
            )}
            <span>• Found {total} eligible youth profiles</span>
          </div>

          <button
            type="button"
            onClick={() => fetchYouthPool(currentPage)}
            className="inline-flex items-center gap-1 hover:text-emerald-700 transition"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        {/* Youth Candidates List */}
        {loading ? (
          <div className="py-12 text-center">
            <Spin size="large" />
            <p className="mt-2 text-xs text-slate-500">Querying registered youth pool...</p>
          </div>
        ) : youthList.length === 0 ? (
          <Empty description="No youth profiles match your search criteria or all candidates have already been added." />
        ) : (
          <div className="space-y-2.5">
            {youthList.map((youth) => {
              const isChecked = selectedIds.includes(youth.id);
              const isThisSelecting = selectingId === youth.id;

              return (
                <div
                  key={youth.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 shadow-2xs transition ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-400'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {!isLimitReached && (
                      <div className="pt-1">
                        <Checkbox
                          checked={isChecked}
                          onChange={(e) => toggleSelectOne(youth.id, e.target.checked)}
                        />
                      </div>
                    )}

                    <Avatar size="default" className="!bg-teal-600 font-bold shrink-0 mt-0.5">
                      {youth.full_name[0] || 'Y'}
                    </Avatar>

                    <div className="min-w-0 leading-tight">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-slate-800">{youth.full_name}</span>
                        {youth.reference_code && (
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-semibold border border-slate-200">
                            {youth.reference_code}
                          </span>
                        )}
                        <Tag color="cyan" className="text-[10px] m-0">
                          {youth.educational_status}
                        </Tag>
                      </div>

                      <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" /> {youth.barangay}
                        </span>
                        {youth.school_name && youth.school_name !== 'N/A' && (
                          <span className="inline-flex items-center gap-1 truncate max-w-56">
                            <GraduationCap size={12} className="text-slate-400" /> {youth.school_name}
                          </span>
                        )}
                        {youth.program && youth.program !== 'N/A' && (
                          <span className="text-slate-400">({youth.program})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <Button
                      type="primary"
                      disabled={isLimitReached || isThisSelecting || submitting}
                      loading={isThisSelecting}
                      onClick={() => handleSelectOne(youth)}
                      className="!bg-emerald-600 hover:!bg-emerald-700 font-medium inline-flex items-center gap-1 text-xs"
                    >
                      <Plus size={13} /> Select
                    </Button>
                  </div>
                </div>
              );
            })}

            {total > 8 && (
              <div className="pt-2 flex justify-end">
                <Pagination
                  current={currentPage}
                  total={total}
                  pageSize={8}
                  onChange={(p) => fetchYouthPool(p)}
                  size="small"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Drawer>
  );
}
