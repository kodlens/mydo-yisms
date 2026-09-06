import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { SharedData, Youth } from '@/types';
import { ScholarshipType } from '@/types/scholarship';
import { DeleteOutlined, EditOutlined, FileSearchOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { App, Button, Input, Pagination, Space, Table } from 'antd';
import axios from 'axios';
import { ReactElement, ReactNode, useEffect, useState } from 'react';

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
  const [loading, setLoading] = useState(false);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

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
        message: 'Unable to load applicants',
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

  const handleEditClick = (rowId:number) => {
    router.visit('/admin/scholarship-types/' + rowId + '/edit')
  }

  const handleDeleteClick = async (rowId:number) => {
    const res = await axios.delete('/admin/scholarship-types/' + rowId);
    if (res.data.success) {
      notification.success({
        message: 'Deleted!',
        description: 'Category successfully deleted.',
        placement: 'topRight'
      })
      loadData()
    }
  }

  return (
    <>
      <Head title="Scholarship Type Management" />

      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-start gap-4 border-b border-stone-200 px-6 py-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-700">
              <FileSearchOutlined className="text-xl" />
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-green-700">Admin Workspace</p>
              <h1 className="mt-1 text-2xl font-semibold text-stone-950">Scholarship Type</h1>
              <p className="mt-1 text-sm text-stone-500">Review Scholarship Type.</p>
            </div>

            <div className="ml-auto rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-[11px] uppercase tracking-wide text-stone-500">Total Applicants</p>
              <p className="text-2xl font-semibold leading-none text-stone-950">{data?.total ?? 0}</p>
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

            <Table<ScholarshipType>
              dataSource={data?.data ?? []}
              loading={loading}
              rowKey={(s) => s.id}
              pagination={false}
              scroll={{ x: 1080 }}
              className="[&_.ant-table-thead>tr>th]:bg-stone-50 [&_.ant-table-thead>tr>th]:text-stone-700"
            >
              <Column<Youth> title="Id" dataIndex="id" width={90} />

              <Column<Youth> title="Scholarship" dataIndex="scholarship" key="scholarship" />

              <Column title="Active" dataIndex="active" key="active" render={(active) => (
                active ? (
                  <span className='rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700'>Active</span>
                ) : (
                  <span className='rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700'>Inactive</span>
                )
              )} />


              <Column<ScholarshipType>
                title="Action"
                key="action"
                fixed="right"
                width={100}
                render={(_, s) => (
                  <Space size="small">

                    <Button
                      title='Edit subject'
                      icon={<EditOutlined />} onClick={() => handleEditClick(s.id ? s.id : 0)} />

                    <Button danger
                      title='Delete subject'
                      onClick={() => (
                        modal.confirm({
                          title: 'Delete?',
                          icon: <QuestionCircleOutlined />,
                          content: 'Are you sure you want to delete this data?',
                          okText: 'Yes',
                          cancelText: 'No',
                          onOk() {
                            handleDeleteClick(s.id ? s.id : 0)
                          }
                        })
                      )}
                      icon={<DeleteOutlined />} />
                  </Space>
                )}
              />
            </Table>

            <div className="mt-5 flex justify-end">
              <Pagination
                onChange={handlePageChange}
                current={data?.current_page ?? page}
                pageSize={data?.per_page ?? perPage}
                showSizeChanger
                total={data?.total ?? 0}
                showTotal={(value, range) => `${range[0]}-${range[1]} of ${value} applicants`}
              />
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

AdminScholarshipTypesPage.layout = (page: ReactNode) => (
  <AdminAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</AdminAuthLayout>
);

export default AdminScholarshipTypesPage;
