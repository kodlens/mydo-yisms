import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { SharedData } from '@/types';
import { EyeOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { App, Button, Input, Pagination, Segmented, Space, Table, Tag, Tooltip } from 'antd';
import axios from 'axios';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import AdminYouthProfileDrawer, { ExtendedYouth } from './partials/admin-youth-profile-drawer';
import ChangeYouthPassword from './partials/change-youth-password';

type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
};

const { Column } = Table;
const { Search } = Input;

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Enrolled', value: 'enrolled' },
  { label: 'Out of School', value: 'out_of_school' },
  { label: 'Graduated', value: 'graduated' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

const AdminYouthProfilesPage = () => {
  const { notification } = App.useApp();

  const [applicants, setApplicants] = useState<PaginatedResponse<ExtendedYouth>>();
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedYouth, setSelectedYouth] = useState<ExtendedYouth | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const loadApplicants = async (
    overrides?: Partial<{
      search: string;
      page: number;
      perPage: number;
      status: string;
    }>,
  ) => {
    setLoading(true);

    const nextSearch = overrides?.search ?? search;
    const nextPage = overrides?.page ?? page;
    const nextPerPage = overrides?.perPage ?? perPage;
    const nextStatus = overrides?.status ?? status;

    try {
      const res = await axios.get<PaginatedResponse<ExtendedYouth>>('/admin/get-youth-profiles', {
        params: {
          search: nextSearch,
          status: nextStatus === 'all' ? undefined : nextStatus,
          perpage: nextPerPage,
          page: nextPage,
        },
      });

      setApplicants(res.data);
    } catch {
      notification.error({
        message: 'Unable to load youth profiles',
        description: 'Please refresh the page and try again.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [page, perPage, status]);

  const handleSearch = (value: string) => {
    const nextSearch = value.trim();
    setSearch(nextSearch);

    if (page === 1) {
      loadApplicants({ search: nextSearch, page: 1 });
      return;
    }

    setPage(1);
  };

  const handlePageChange = (nextPage: number, nextPerPage: number) => {
    setPage(nextPage);
    setPerPage(nextPerPage);
  };

  const handleStatusChange = (nextStatus: string) => {
    setStatus(nextStatus);
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleView = (youth: ExtendedYouth) => {
    setSelectedYouth(youth);
    setDrawerOpen(true);
  };

  return (
    <>
      <Head title="Youth Profiles (Admin)" />

      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start gap-4 border-b border-stone-200 px-6 py-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700">
              <FileSearchOutlined className="text-xl" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-700">Administration Registry</p>
              <h1 className="mt-1 text-2xl font-semibold text-stone-950">Youth Profiles Directory</h1>
              <p className="mt-1 text-sm text-stone-500">
                Browse, search, and inspect registered youth demographics, education, and linked scholarship records.
              </p>
            </div>

            <div className="ml-auto rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-stone-500">Total Registered</p>
              <p className="text-2xl font-semibold leading-none text-stone-950">{applicants?.total ?? 0}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Search
                placeholder="Search name, email, ref code, school, or program"
                autoComplete="off"
                allowClear
                enterButton={
                  <>
                    <SearchOutlined /> Search
                  </>
                }
                id="search"
                onChange={(e) => setSearch(e.target.value)}
                loading={loading}
                onSearch={handleSearch}
                className="w-full md:max-w-[460px]"
              />
              <Segmented
                options={statusOptions}
                value={status}
                onChange={(value) => handleStatusChange(String(value))}
                className="md:ml-auto"
              />
            </div>

            <Table<ExtendedYouth>
              dataSource={applicants?.data ?? []}
              loading={loading}
              rowKey={(youth) => youth.id}
              pagination={false}
              scroll={{ x: 1080 }}
              className="[&_.ant-table-thead>tr>th]:bg-stone-50 [&_.ant-table-thead>tr>th]:text-stone-700"
            >
              <Column<ExtendedYouth>
                title="Ref Code"
                dataIndex="reference_code"
                width={140}
                render={(code: string) => (
                  <span className="font-mono text-xs font-semibold text-slate-700">{code || '—'}</span>
                )}
              />
              <Column<ExtendedYouth>
                title="Full Name"
                key="name"
                render={(_, youth) => (
                  <button
                    type="button"
                    onClick={() => handleView(youth)}
                    className="text-left font-semibold text-slate-900 hover:text-green-700 transition-colors"
                  >
                    {[youth.lname, youth.fname, youth.mname].filter(Boolean).join(', ')}
                  </button>
                )}
              />
              <Column<ExtendedYouth>
                title="Barangay"
                key="barangay"
                render={(_, youth) => youth.barangay?.brgyDesc ?? '—'}
              />
              <Column<ExtendedYouth> title="Email" dataIndex="email" key="email" />
              <Column<ExtendedYouth> title="School" dataIndex="school_name" key="school_name" />
              <Column<ExtendedYouth> title="Program / Course" dataIndex="program" key="program" />
              <Column<ExtendedYouth>
                title="Status"
                key="classification"
                width={130}
                render={(_, youth) => {
                  if (youth.is_graduated) {
                    return <Tag color="blue">Graduated</Tag>;
                  }
                  if (youth.school_name) {
                    return <Tag color="green">Enrolled</Tag>;
                  }
                  return <Tag color="orange">Out of School</Tag>;
                }}
              />
              <Column<ExtendedYouth>
                title="Action"
                key="action"
                fixed="right"
                width={120}
                render={(_, youth) => (
                  <Space size="small">
                    <Tooltip title="View youth dossier">
                      <Button
                        icon={<EyeOutlined />}
                        onClick={() => handleView(youth)}
                      />
                    </Tooltip>
                    <Tooltip title="Change password">
                      <ChangeYouthPassword youth={youth} onSuccess={() => loadApplicants()} />
                    </Tooltip>
                  </Space>
                )}
              />
            </Table>

            <div className="mt-5 flex justify-end">
              <Pagination
                onChange={handlePageChange}
                current={applicants?.current_page ?? page}
                pageSize={applicants?.per_page ?? perPage}
                showSizeChanger
                total={applicants?.total ?? 0}
                showTotal={(value, range) => `${range[0]}-${range[1]} of ${value} youth profiles`}
              />
            </div>
          </div>
        </section>
      </div>

      <AdminYouthProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        youth={selectedYouth}
      />
    </>
  );
};

AdminYouthProfilesPage.layout = (page: ReactNode) => (
  <AdminAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</AdminAuthLayout>
);

export default AdminYouthProfilesPage;
