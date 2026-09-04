import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData, Student } from '@/types';
import { EyeOutlined, FileSearchOutlined, SearchOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { App, Button, Input, Pagination, Space, Table, Tag } from 'antd';
import axios from 'axios';
import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';

type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
};

const { Column } = Table;
const { Search } = Input;

const statusColor: Record<string, string> = {
  approved: 'green',
  pending: 'gold',
  draft: 'default',
  rejected: 'red',
};

const formatName = (student: Student) =>
  [student.lname, student.fname, student.mname].filter(Boolean).join(', ').replace(', ,', ',');

const StaffApplicantIndex = () => {
  const { notification } = App.useApp();

  const [applicants, setApplicants] = useState<PaginatedResponse<Student>>();
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const rows = useMemo(() => (Array.isArray(applicants?.data) ? applicants.data : []), [applicants]);

  const loadApplicants = async (
    overrides?: Partial<{
      search: string;
      page: number;
      perPage: number;
    }>,
  ) => {
    setLoading(true);

    const nextSearch = overrides?.search ?? search;
    const nextPage = overrides?.page ?? page;
    const nextPerPage = overrides?.perPage ?? perPage;

    try {
      const res = await axios.get<PaginatedResponse<Student>>('/staff/get-applicants', {
        params: {
          search: nextSearch,
          perpage: nextPerPage,
          page: nextPage,
        },
      });

      setApplicants(res.data);
    } catch {
      notification.error({
        message: 'Unable to load applicants',
        description: 'Please refresh the page and try again.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplicants();
  }, [page, perPage]);

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

  return (
    <>
      <Head title="Staff Applicants" />

      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start gap-4 border-b border-stone-200 px-6 py-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700">
              <FileSearchOutlined className="text-xl" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-700">Staff Workspace</p>
              <h1 className="mt-1 text-2xl font-semibold text-stone-950">Applicant Review</h1>
              <p className="mt-1 text-sm text-stone-500">Review submitted student applications and verify applicant details.</p>
            </div>

            <div className="ml-auto rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-stone-500">Total Applicants</p>
              <p className="text-2xl font-semibold leading-none text-stone-950">{applicants?.total ?? 0}</p>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <Search
                placeholder="Search name, email, school, or program"
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
            </div>

            <Table<Student>
              dataSource={rows}
              loading={loading}
              rowKey={(student) => student.id}
              pagination={false}
              scroll={{ x: 1080 }}
              className="[&_.ant-table-thead>tr>th]:bg-stone-50 [&_.ant-table-thead>tr>th]:text-stone-700"
            >
              <Column<Student> title="ID" dataIndex="id" width={80} />
              <Column<Student> title="Applicant" key="applicant" render={(_, student) => formatName(student)} />
              <Column<Student> title="Email" dataIndex="email" key="email" />
              <Column<Student> title="Mobile" dataIndex="mobile_number" key="mobile_number" />
              <Column<Student> title="School" dataIndex="school_name" key="school_name" />
              <Column<Student> title="Program" dataIndex="program" key="program" />
              <Column<Student>
                title="Status"
                dataIndex="registration_status"
                key="registration_status"
                width={130}
                render={(status: string) => (
                  <Tag color={statusColor[status] ?? 'default'} className="capitalize">
                    {status ?? 'draft'}
                  </Tag>
                )}
              />
              <Column<Student>
                title="Action"
                key="action"
                fixed="right"
                width={100}
                render={(_, student) => (
                  <Space size="small">
                    <Button
                      title="View applicant"
                      icon={<EyeOutlined />}
                      onClick={() => router.visit(`/staff/applicants/${student.id}`)}
                    />
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
                showTotal={(value, range) => `${range[0]}-${range[1]} of ${value} applicants`}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

StaffApplicantIndex.layout = (page: ReactNode) => (
  <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</StaffAuthLayout>
);

export default StaffApplicantIndex;
