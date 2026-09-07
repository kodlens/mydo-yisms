import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { SharedData } from '@/types';
import { ScholarshipType } from '@/types/scholarship';
import { DeleteOutlined, EditOutlined, FileSearchOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { App, Button, Empty, Input, Pagination, Space, Table } from 'antd';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { ReactElement, ReactNode, useEffect, useState } from 'react';
import ModalCreateEditScholarshipType from './partials/modal-create-edit-scholarship-types';

type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
};

const { Column } = Table;
const { Search } = Input;

const AdminScholarshipTypesPage = () => {
  const { notification } = App.useApp();

  const [data, setData] = useState<PaginatedResponse<ScholarshipType>>();
  const [scholarshipType, setScholarshipType] = useState<ScholarshipType>();
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<boolean>(false)


  const { modal } = App.useApp();

  const loadData = async (
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

    try {
      const res = await axios.get<PaginatedResponse<ScholarshipType>>('/admin/get-scholarship-types', {
        params: {
          search: nextSearch,
          perpage: nextPerPage,
          page: nextPage,
        },
      });

      setData(res.data);
    } catch {
      notification.error({
        title: 'Unable to load scholarship types',
        description: 'Please refresh the page and try again.',
        placement: 'topRight',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, perPage]);

  const handleSearch = (value: string) => {
    const nextSearch = value.trim();
    setSearch(nextSearch);

    if (page === 1) {
      loadData({ search: nextSearch, page: 1 });
      return;
    }

    setPage(1);
  };

  const handlePageChange = (nextPage: number, nextPerPage: number) => {
    setPage(nextPage);
    setPerPage(nextPerPage);
  };

  const handleEditClick = (row: ScholarshipType) => {
    // router.visit('/admin/scholarship-types/' + rowId + '/edit');
    setScholarshipType(row)
    setOpen(true)
  };

  const handleDeleteClick = async (rowId: number) => {
    const res = await axios.delete('/admin/scholarship-types/' + rowId);
    if (res.data.success) {
      notification.success({
        message: 'Deleted!',
        description: 'Scholarship type successfully deleted.',
        placement: 'topRight',
      });
      loadData();
    }
  };

  return (
    <>
      <Head title="Scholarship Type Management" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600" />
          <div className="flex flex-wrap items-center gap-4 border-b border-stone-100 px-4 py-6 sm:px-6 sm:py-8">
            <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700">
              <FileSearchOutlined className="text-xl" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-green-700 uppercase">Admin Workspace</p>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">Scholarship types</h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-stone-500">
                Review scholarship programs, their beneficiaries, benefits, and availability.
              </p>
            </div>

            <div className="w-full rounded-xl border border-emerald-100 bg-emerald-50/60 px-5 py-4 sm:ml-auto sm:w-auto sm:min-w-36">
              <p className="text-xs font-medium text-emerald-800">Scholarship results</p>
              <p className="mt-2 text-3xl leading-none font-semibold text-emerald-950 tabular-nums">
                {data ? data.total.toLocaleString() : '—'}
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-6">

            <div className='my-2'>
              <Button
                onClick={()=> {
                  setOpen(true)
                }}
                type='primary'
                icon={<Plus size={15} />}
              >
                  New Scholarship/Program
              </Button>
            </div>

            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-900">Scholarship directory</h2>
                <p className="mt-1 text-sm text-stone-500">Compare benefits and funding at a glance.</p>
              </div>
              <div className="w-full lg:max-w-md">
                <label htmlFor="search" className="mb-2 block text-xs font-medium text-stone-600">
                  Find a scholarship
                </label>
                <Search
                  placeholder="Search by scholarship name"
                  size="large"
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
                  className="w-full"
                />
              </div>
            </div>

            <Table<ScholarshipType>
              dataSource={data?.data ?? []}
              loading={loading}
              rowKey={(s) => s.id}
              pagination={false}
              scroll={{ x: 1180 }}
              tableLayout="fixed"
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="py-2">
                        <p className="font-medium text-stone-700">No scholarship types found</p>
                        <p className="mt-1 text-sm text-stone-500">If you searched, try another name or clear your search.</p>
                      </div>
                    }
                  />
                ),
              }}
              className="overflow-hidden rounded-xl border border-stone-200 [&_.ant-table-cell]:align-top [&_.ant-table-thead>tr>th]:bg-stone-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-stone-600"
            >
              <Column<ScholarshipType>
                title="Scholarship"
                dataIndex="scholarship"
                key="scholarship"
                width={245}
                render={(name, row) => (
                  <div>
                    <p className="text-sm leading-6 font-semibold break-words text-stone-900">{name}</p>
                    <p className="mt-2 text-xs text-stone-400 tabular-nums">ID #{row.id}</p>
                  </div>
                )}
              />
              <Column<ScholarshipType>
                title="Target beneficiaries"
                dataIndex="target_beneficiary"
                key="target_beneficiary"
                width={235}
                render={(value) => <p className="text-sm leading-6 break-words text-stone-600">{value || 'Not specified'}</p>}
              />
              <Column<ScholarshipType>
                title="Benefits"
                dataIndex="benefit"
                key="benefit"
                width={290}
                render={(value) => <p className="text-sm leading-6 break-words text-stone-600">{value || 'Not specified'}</p>}
              />
              <Column<ScholarshipType>
                title="Amount"
                dataIndex="amount"
                key="amount"
                width={150}
                align="right"
                render={(value) => (
                  <span className="text-sm font-semibold whitespace-nowrap text-stone-900 tabular-nums">
                    {value !== null && value !== undefined && value !== '' && Number.isFinite(Number(value))
                      ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(value))
                      : 'Not specified'}
                  </span>
                )}
              />

              <Column
                title="Status"
                dataIndex="is_active"
                key="is_active"
                width={110}
                render={(active) =>
                  active ? (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-600">
                      Inactive
                    </span>
                  )
                }
              />

              <Column<ScholarshipType>
                title="Actions"
                key="action"
                fixed="right"
                width={110}
                render={(_, s) => (
                  <Space size="small">
                    <Button
                      title="Edit scholarship type"
                      aria-label={`Edit ${s.scholarship}`}
                      icon={<EditOutlined />}
                      onClick={() => handleEditClick(s)}
                    />

                    <Button
                      danger
                      title="Delete scholarship type"
                      aria-label={`Delete ${s.scholarship}`}
                      onClick={() =>
                        modal.confirm({
                          title: 'Delete scholarship type?',
                          icon: <QuestionCircleOutlined />,
                          content: `Delete “${s.scholarship}”? This action cannot be undone.`,
                          okText: 'Delete scholarship',
                          okButtonProps: { danger: true },
                          cancelText: 'Cancel',
                          onOk() {
                            handleDeleteClick(s.id ? s.id : 0);
                          },
                        })
                      }
                      icon={<DeleteOutlined />}
                    />
                  </Space>
                )}
              />
            </Table>

            <div className="mt-5 flex flex-wrap items-center justify-end gap-3 border-t border-stone-100 pt-5">
              <Pagination
                onChange={handlePageChange}
                current={data?.current_page ?? page}
                pageSize={data?.per_page ?? perPage}
                showSizeChanger
                responsive
                total={data?.total ?? 0}
                showTotal={(value, range) => `${range[0]}–${range[1]} of ${value} scholarship types`}
              />
            </div>
          </div>
        </section>
      </div>

      <ModalCreateEditScholarshipType
        modalOpen={open}
        data={scholarshipType}
        onClose={()=>{
          setOpen(false)
        }} refetch={()=>{
          loadData()
        }}
      />

    </>
  );
};

AdminScholarshipTypesPage.layout = (page: ReactNode) => (
  <AdminAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</AdminAuthLayout>
);

export default AdminScholarshipTypesPage;
