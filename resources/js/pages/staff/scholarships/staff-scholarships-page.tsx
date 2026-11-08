import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData } from '@/types';
import { ScholarshipType, ScholarshipTypeStatusFilter } from '@/types/scholarship';
import { Head, router } from '@inertiajs/react';
import {
  App,
  Button,
  Empty,
  Input,
  Pagination,
  Popconfirm,
  Segmented,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
} from 'antd';
import axios from 'axios';
import {
  ArrowUpRight,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  FileSearch,
  GraduationCap,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import StaffScholarshipModal from './partials/staff-scholarship-modal';

type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
};

const { Column } = Table;

const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const formatAmount = (amount: number | string | null | undefined) => {
  if (amount === null || amount === undefined || amount === '') return 'Flexible / Not set';
  const numeric = Number(amount);
  return Number.isFinite(numeric) ? pesoFormatter.format(numeric) : 'Flexible / Not set';
};

const statusOptions = [
  { label: 'All Programs', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export default function StaffScholarshipsPage() {
  const { notification, message } = App.useApp();

  const [scholarships, setScholarships] = useState<PaginatedResponse<ScholarshipType>>();
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ScholarshipTypeStatusFilter>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<ScholarshipType | undefined>(undefined);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const fetchScholarships = async (params?: {
    search?: string;
    page?: number;
    perPage?: number;
    status?: string;
  }) => {
    setLoading(true);
    const qSearch = params?.search !== undefined ? params.search : search;
    const qPage = params?.page !== undefined ? params.page : page;
    const qPerPage = params?.perPage !== undefined ? params.perPage : perPage;
    const qStatus = params?.status !== undefined ? params.status : status;

    try {
      const res = await axios.get<PaginatedResponse<ScholarshipType>>(route('staff.scholarships.get-data'), {
        params: {
          search: qSearch,
          status: qStatus,
          perpage: qPerPage,
          page: qPage,
        },
      });
      setScholarships(res.data);
    } catch {
      notification.error({
        message: 'Failed to load scholarships',
        description: 'Could not retrieve scholarship list. Please try again.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, [page, perPage, status]);

  const handleSearch = (value: string) => {
    const trimmed = value.trim();
    setSearch(trimmed);
    setPage(1);
    fetchScholarships({ search: trimmed, page: 1 });
  };

  const handleStatusToggle = async (scholarship: ScholarshipType, checked: boolean) => {
    setTogglingId(scholarship.id);
    try {
      const res = await axios.post<{ success: boolean; message: string; is_active: boolean }>(
        route('staff.scholarships.toggle-status', scholarship.id),
        { is_active: checked }
      );
      message.success(res.data.message);
      setScholarships((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          data: prev.data.map((item) =>
            item.id === scholarship.id ? { ...item, is_active: checked } : item
          ),
        };
      });
    } catch (err: unknown) {
      notification.error({
        message: 'Status update failed',
        description: 'Unable to update program status. Please try again.',
        placement: 'topRight',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (scholarship: ScholarshipType) => {
    try {
      const res = await axios.delete<{ success: boolean; message: string }>(
        route('staff.scholarships.destroy', scholarship.id)
      );
      if (res.data.success) {
        message.success(res.data.message);
        fetchScholarships();
      }
    } catch (err: any) {
      notification.error({
        message: 'Cannot delete scholarship',
        description: err.response?.data?.message || 'Error deleting scholarship.',
        placement: 'topRight',
      });
    }
  };

  const totalPrograms = scholarships?.total ?? 0;
  const activeCount = scholarships?.data?.filter((s) => s.is_active).length ?? 0;
  const totalApplicants = scholarships?.data?.reduce((acc, s) => acc + (s.applications_count || 0), 0) ?? 0;

  return (
    <>
      <Head title="Scholarships Management | Staff" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-lg">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-white/15 backdrop-blur-sm">
                <GraduationCap className="h-4 w-4" />
                Staff Workspace · Educational Assistance
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Scholarships Management
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-emerald-100/90">
                Create and manage municipal educational assistance programs, configure grant amounts, and monitor youth application counts.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="primary"
                size="large"
                icon={<Plus className="h-4 w-4" />}
                onClick={() => {
                  setSelectedScholarship(undefined);
                  setModalOpen(true);
                }}
                className="!h-11 !rounded-xl !bg-white !px-6 !font-semibold !text-emerald-900 shadow-md hover:!bg-emerald-50 hover:!text-emerald-950"
              >
                Create Scholarship
              </Button>

              <Button
                size="large"
                icon={<FileSearch className="h-4 w-4" />}
                onClick={() => router.visit(route('staff.scholarship-applicants.index'))}
                className="!h-11 !rounded-xl !border-white/20 !bg-white/10 !text-white hover:!bg-white/20"
              >
                Review Applicants
              </Button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/15 pt-5 sm:grid-cols-3 md:gap-4">
            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm ring-1 ring-white/10">
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-200">Total Programs</p>
              <p className="mt-1 text-2xl font-bold text-white">{totalPrograms}</p>
            </div>

            <div className="rounded-xl bg-white/10 p-3.5 backdrop-blur-sm ring-1 ring-white/10">
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-200">Active Grants</p>
              <p className="mt-1 text-2xl font-bold text-white">{activeCount}</p>
            </div>

            <div className="col-span-2 rounded-xl bg-white/10 p-3.5 backdrop-blur-sm ring-1 ring-white/10 sm:col-span-1">
              <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-200">Current Page Applicants</p>
              <p className="mt-1 text-2xl font-bold text-white">{totalApplicants}</p>
            </div>
          </div>
        </section>

        {/* Main Content Card */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          {/* Filter Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-md">
              <Input.Search
                placeholder="Search program name, beneficiary, or benefit..."
                allowClear
                enterButton={<Search className="h-4 w-4" />}
                size="large"
                onSearch={handleSearch}
                onChange={(e) => {
                  if (e.target.value === '') {
                    handleSearch('');
                  }
                }}
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Segmented
                size="large"
                options={statusOptions}
                value={status}
                onChange={(val) => {
                  setStatus(val as ScholarshipTypeStatusFilter);
                  setPage(1);
                }}
              />

              <Button
                size="large"
                icon={<RefreshCw className="h-4 w-4" />}
                onClick={() => fetchScholarships()}
                loading={loading}
                title="Refresh list"
              />
            </div>
          </div>

          {/* Table */}
          <Table<ScholarshipType>
            dataSource={scholarships?.data ?? []}
            loading={loading}
            rowKey="id"
            pagination={false}
            scroll={{ x: 960 }}
            className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-700 font-normal"
            locale={{
              emptyText: (
                <Empty
                  description={
                    <div className="py-6">
                      <p className="text-base font-semibold text-slate-700">No scholarships found</p>
                      <p className="text-sm text-slate-500">
                        {search
                          ? 'Try adjusting your search criteria.'
                          : 'Create your first scholarship program using the button above.'}
                      </p>
                    </div>
                  }
                />
              ),
            }}
          >
            <Column<ScholarshipType>
              title="Scholarship Program"
              key="scholarship"
              width={280}
              render={(_, record) => (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{record.scholarship}</span>
                  </div>
                  {record.benefit && (
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>{record.benefit}</span>
                    </p>
                  )}
                </div>
              )}
            />

            <Column<ScholarshipType>
              title="Target Beneficiaries"
              dataIndex="target_beneficiary"
              key="target_beneficiary"
              render={(val) => (
                <div className="text-sm text-slate-600 max-w-xs">
                  {val ? (
                    <span className="line-clamp-2">{val}</span>
                  ) : (
                    <span className="text-slate-400 italic">Open to all qualified youth</span>
                  )}
                </div>
              )}
            />

            <Column<ScholarshipType>
              title="Grant Amount"
              dataIndex="amount"
              key="amount"
              width={160}
              render={(val) => (
                <div className="font-semibold text-emerald-800 flex items-center gap-1">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                  <span>{formatAmount(val)}</span>
                </div>
              )}
            />

            <Column<ScholarshipType>
              title="Applicants"
              key="applicants"
              width={130}
              render={(_, record) => (
                <Button
                  type="link"
                  size="small"
                  onClick={() =>
                    router.visit(`${route('staff.scholarship-applicants.index')}?search=${encodeURIComponent(record.scholarship)}`)
                  }
                  className="!p-0 !text-emerald-700 hover:!text-emerald-900 inline-flex items-center gap-1"
                >
                  <Tag color="cyan" className="!font-semibold !px-2.5 !py-0.5 !rounded-full">
                    {record.applications_count ?? 0} {record.applications_count === 1 ? 'applicant' : 'applicants'}
                  </Tag>
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              )}
            />

            <Column<ScholarshipType>
              title="Status"
              dataIndex="is_active"
              key="is_active"
              width={140}
              render={(val, record) => (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={Boolean(val)}
                    loading={togglingId === record.id}
                    onChange={(checked) => handleStatusToggle(record, checked)}
                    checkedChildren="Active"
                    unCheckedChildren="Inactive"
                    className={val ? '!bg-emerald-600' : '!bg-slate-300'}
                  />
                </div>
              )}
            />

            <Column<ScholarshipType>
              title="Actions"
              key="actions"
              width={120}
              fixed="right"
              render={(_, record) => (
                <Space size="small">
                  <Tooltip title="Edit scholarship program">
                    <Button
                      type="text"
                      icon={<Pencil className="h-4 w-4 text-slate-600" />}
                      onClick={() => {
                        setSelectedScholarship(record);
                        setModalOpen(true);
                      }}
                    />
                  </Tooltip>

                  <Tooltip title={record.applications_count > 0 ? 'Cannot delete: applications exist' : 'Delete program'}>
                    <Popconfirm
                      title="Delete scholarship program"
                      description={`Are you sure you want to delete '${record.scholarship}'?`}
                      onConfirm={() => handleDelete(record)}
                      okText="Delete"
                      cancelText="Cancel"
                      disabled={record.applications_count > 0}
                      okButtonProps={{ danger: true }}
                    >
                      <Button
                        type="text"
                        danger
                        icon={<Trash2 className="h-4 w-4" />}
                        disabled={record.applications_count > 0}
                      />
                    </Popconfirm>
                  </Tooltip>
                </Space>
              )}
            />
          </Table>

          {/* Pagination */}
          <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:flex-row">
            <span className="text-xs text-slate-500">
              Showing {scholarships?.data?.length ?? 0} of {totalPrograms} scholarship program(s)
            </span>

            <Pagination
              current={page}
              pageSize={perPage}
              total={totalPrograms}
              onChange={(nextPage, nextPerPage) => {
                setPage(nextPage);
                setPerPage(nextPerPage);
              }}
              showSizeChanger
              pageSizeOptions={['10', '20', '50']}
            />
          </div>
        </section>
      </div>

      {/* Create / Edit Modal */}
      <StaffScholarshipModal
        open={modalOpen}
        scholarship={selectedScholarship}
        onClose={() => setModalOpen(false)}
        onSuccess={(msg) => {
          message.success(msg);
          fetchScholarships();
        }}
      />
    </>
  );
}

StaffScholarshipsPage.layout = (page: ReactNode) => (
  <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user} header="Scholarships">
    {page}
  </StaffAuthLayout>
);
