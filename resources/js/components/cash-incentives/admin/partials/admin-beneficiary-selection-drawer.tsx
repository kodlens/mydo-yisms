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

export default function AdminBeneficiarySelectionDrawer({
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
        `${route('admin.cash-incentives.eligible-youth', program.id)}?${params.toString()}`,
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
      route('admin.cash-incentives.beneficiaries.select', program.id),
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
      route('admin.cash-incentives.beneficiaries.select', program.id),
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

  const toggleSelectAllPage = (checked: boolean) => {
    if (checked) {
      const pageIds = youthList.map((y) => y.id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])));
    } else {
      const pageIds = new Set(youthList.map((y) => y.id));
      setSelectedIds(selectedIds.filter((id) => !pageIds.has(id)));
    }
  };

  const toggleSelectId = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isAllPageSelected =
    youthList.length > 0 && youthList.every((y) => selectedIds.includes(y.id));

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      title={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <UserPlus size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-800">Add Students to Incentive List</h3>
              <p className="text-xs text-slate-500">
                Filter and enroll verified youth into {program.title}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Current Capacity</span>
            <span className="text-sm font-bold text-slate-800">
              {currentCount} / {program.max_beneficiaries} Enrolled
            </span>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              checked={isAllPageSelected}
              onChange={(e) => toggleSelectAllPage(e.target.checked)}
              disabled={youthList.length === 0}
            >
              Select All On Page
            </Checkbox>
            {selectedIds.length > 0 && (
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                {selectedIds.length} Selected
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onClose}>Close</Button>
            <Button
              type="primary"
              icon={<CheckSquare size={16} />}
              disabled={selectedIds.length === 0}
              loading={submitting}
              onClick={handleSelectBatch}
              className="!bg-emerald-600 hover:!bg-emerald-700"
            >
              Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ''} Selected
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Filters Box */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 space-y-2.5">
          <div className="flex gap-2">
            <Input
              placeholder="Search by student name, reference code, or ID..."
              prefix={<Search size={14} className="text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onPressEnter={() => fetchYouthPool(1)}
              allowClear
            />
            <Button
              type="primary"
              onClick={() => fetchYouthPool(1)}
              icon={<Search size={14} />}
              className="!bg-emerald-600"
            >
              Filter
            </Button>
            <Button
              icon={<RefreshCw size={14} />}
              onClick={() => {
                setSearch('');
                setSelectedBrgy(undefined);
                setSelectedEduStatus(undefined);
                setSelectedYear(undefined);
                setSelectedSex(undefined);
                fetchYouthPool(1);
              }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Select
              placeholder="Barangay"
              allowClear
              value={selectedBrgy}
              onChange={(val) => setSelectedBrgy(val)}
              options={barangays.map((b) => ({ value: b.brgyCode, label: b.brgyDesc }))}
              showSearch
              filterOption={(input, opt) =>
                (opt?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              size="small"
            />

            <Select
              placeholder="Status"
              allowClear
              value={selectedEduStatus}
              onChange={(val) => setSelectedEduStatus(val)}
              options={[
                { value: 'ISY', label: 'In School Youth' },
                { value: 'OSY', label: 'Out of School Youth' },
                { value: 'Graduate', label: 'Graduated' },
              ]}
              size="small"
            />

            <Select
              placeholder="Year Level"
              allowClear
              value={selectedYear}
              onChange={(val) => setSelectedYear(val)}
              options={[
                { value: 1, label: '1st Year' },
                { value: 2, label: '2nd Year' },
                { value: 3, label: '3rd Year' },
                { value: 4, label: '4th Year' },
                { value: 5, label: '5th Year' },
              ]}
              size="small"
            />

            <Select
              placeholder="Sex"
              allowClear
              value={selectedSex}
              onChange={(val) => setSelectedSex(val)}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
              ]}
              size="small"
            />
          </div>
        </div>

        {/* Results summary bar */}
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Found <strong>{total}</strong> eligible youth profiles not yet in this program
          </span>
          {loading && <Spin size="small" />}
        </div>

        {/* Youth Cards List */}
        <div className="space-y-2.5 min-h-[300px]">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spin size="large" />
            </div>
          ) : youthList.length === 0 ? (
            <div className="py-12">
              <Empty
                description={
                  <div className="text-center">
                    <p className="font-semibold text-slate-700">No eligible youth found</p>
                    <p className="text-xs text-slate-500">
                      All registered youth in this criteria may already be enrolled or criteria did not match.
                    </p>
                  </div>
                }
              />
            </div>
          ) : (
            youthList.map((youth) => {
              const isChecked = selectedIds.includes(youth.id);
              return (
                <div
                  key={youth.id}
                  className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                    isChecked
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <Checkbox
                    checked={isChecked}
                    onChange={() => toggleSelectId(youth.id)}
                    className="mt-1"
                  />

                  <Avatar
                    size={38}
                    className="shrink-0 !bg-slate-800 text-amber-200 font-bold"
                  >
                    {youth.full_name.charAt(0)}
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-slate-800 text-sm">
                          {youth.full_name}
                        </span>
                        <Tag color="geekblue" className="text-[10px] font-mono leading-tight px-1.5 py-0">
                          {youth.reference_code}
                        </Tag>
                        <Tag color="cyan" className="text-[10px] font-semibold leading-tight px-1.5 py-0">
                          {youth.educational_status}
                        </Tag>
                      </div>

                      <Button
                        size="small"
                        type={isChecked ? 'default' : 'primary'}
                        icon={<Plus size={13} />}
                        loading={selectingId === youth.id}
                        onClick={() => handleSelectOne(youth)}
                        className={!isChecked ? '!bg-emerald-600 hover:!bg-emerald-700' : ''}
                      >
                        Enroll
                      </Button>
                    </div>

                    <div className="mt-1 grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1 truncate">
                        <MapPin size={11} className="shrink-0 text-slate-400" />
                        <span className="truncate">{youth.barangay}</span>
                      </div>
                      <div className="flex items-center gap-1 truncate">
                        <GraduationCap size={11} className="shrink-0 text-slate-400" />
                        <span className="truncate">{youth.school_name || 'N/A'}</span>
                      </div>
                      <div className="truncate">
                        <span>Course: <strong>{youth.program || 'N/A'}</strong></span>
                      </div>
                      <div>
                        <span>Income: <strong>₱{Number(youth.monthly_family_income || 0).toLocaleString()}</strong></span>
                      </div>
                      <div>
                        <span>Sex: <strong>{youth.sex || 'N/A'}</strong></span>
                      </div>
                      <div>
                        <span>Year: <strong>{youth.year_level ? `${youth.year_level} Year` : 'N/A'}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {total > 8 && (
          <div className="pt-2 flex justify-end">
            <Pagination
              current={currentPage}
              total={total}
              pageSize={8}
              onChange={(page) => fetchYouthPool(page)}
              size="small"
              showSizeChanger={false}
            />
          </div>
        )}
      </div>
    </Drawer>
  );
}
