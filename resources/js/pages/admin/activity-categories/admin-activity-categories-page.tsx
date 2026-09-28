import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { SharedData } from '@/types';
import { ActivityCategory } from '@/types/activity-category';
import { CheckOutlined, CloseCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Alert, App, Button, Dropdown, Empty, Input, MenuProps, Pagination, Segmented, Space, Switch, Table, Tooltip } from 'antd';
import axios from 'axios';
import { Copy, MoreHorizontal, Pencil, Plus, RefreshCw, SearchX, Trash2, TriangleAlert } from 'lucide-react';
import { ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ModalCreateEditActivityCategories from './partials/modal-create-edit-activity-categories';

type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
};

type StatusFilter = '' | 'active' | 'inactive';

const { Column } = Table;
const { Search } = Input;

const SEARCH_DEBOUNCE_MS = 350;

const dateFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' });

const accents = [
  { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-100', bar: 'bg-emerald-500' },
  { badge: 'bg-teal-50 text-teal-700 ring-teal-100', bar: 'bg-teal-500' },
  { badge: 'bg-sky-50 text-sky-700 ring-sky-100', bar: 'bg-sky-500' },
  { badge: 'bg-amber-50 text-amber-800 ring-amber-100', bar: 'bg-amber-500' },
  { badge: 'bg-violet-50 text-violet-700 ring-violet-100', bar: 'bg-violet-500' },
];

const accentFor = (id: number) => accents[Math.abs(id) % accents.length];

const formatDate = (value?: string | null) => {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : dateFormatter.format(parsed);
};

const initialsOf = (name?: string | null) => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

const AdminActivityCategoriesPage = () => {
  const { notification, modal } = App.useApp();

  const [data, setData] = useState<PaginatedResponse<ActivityCategory>>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<StatusFilter>('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ActivityCategory | undefined>();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const requestId = useRef(0);

  const loadData = useCallback(async () => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setLoadError(null);

    try {
      const res = await axios.get<PaginatedResponse<ActivityCategory>>('/admin/get-activity-categories', {
        params: {
          search,
          status,
          perpage: perPage,
          page,
        },
      });

      // Ignore responses that arrive after a newer request has been sent.
      if (currentRequest !== requestId.current) return;

      setData(res.data);

      // Deleting the last row of a page would otherwise leave the user on a blank page.
      if (res.data.data.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch {
      if (currentRequest !== requestId.current) return;

      setLoadError('We could not load activity categories. Check your connection and try again.');
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, [page, perPage, search, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search so admins get results while typing, without a request per keystroke.
  useEffect(() => {
    const next = searchInput.trim();
    const timer = window.setTimeout(() => {
      setSearch((current) => {
        if (current === next) return current;
        return next;
      });
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const applySearch = (value: string) => {
    setSearchInput(value);
    setSearch(value.trim());
    setPage(1);
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearch('');
    setPage(1);
  };

  const handleStatusChange = (value: string | number) => {
    setStatus(value === 'active' || value === 'inactive' ? value : '');
    setPage(1);
  };

  const handleCreate = () => {
    setEditing(undefined);
    setOpen(true);
  };

  const handleEdit = (row: ActivityCategory) => {
    setEditing(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggleActive = async (row: ActivityCategory) => {
    const nextValue = !row.is_active;

    setPendingId(row.id);
    setData((current) =>
      current
        ? { ...current, data: current.data.map((item) => (item.id === row.id ? { ...item, is_active: nextValue } : item)) }
        : current,
    );

    try {
      const res = await axios.post(`/admin/activity-categories/${row.id}/active`, {
        is_active: nextValue,
      });

      if (!res.data?.success) {
        throw new Error('The server did not confirm the status change.');
      }

      notification.success({
        message: 'Status updated',
        description: `“${row.name}” is now ${nextValue ? 'active' : 'inactive'}.`,
        placement: 'topRight',
      });
    } catch (err: unknown) {
      let description = 'Something went wrong. Please try again.';

      if (axios.isAxiosError(err)) {
        description = err.response?.data?.message ?? err.message ?? description;
      }

      // Roll the optimistic update back so the switch matches the server.
      setData((current) =>
        current
          ? { ...current, data: current.data.map((item) => (item.id === row.id ? { ...item, is_active: row.is_active } : item)) }
          : current,
      );

      notification.error({
        message: 'Could not update status',
        description,
        placement: 'topRight',
      });
    } finally {
      setPendingId(null);
      loadData();
    }
  };

  const handleDelete = async (row: ActivityCategory) => {
    try {
      const res = await axios.delete(`/admin/activity-categories/${row.id}`);

      if (!res.data?.success) {
        throw new Error('The server did not confirm the deletion.');
      }

      notification.success({
        message: 'Category deleted',
        description: `“${row.name}” was removed successfully.`,
        placement: 'topRight',
      });

      loadData();
    } catch (err: unknown) {
      let description = 'Something went wrong. Please try again.';

      if (axios.isAxiosError(err)) {
        description = err.response?.data?.message ?? err.message ?? description;
      }

      notification.error({
        message: 'Could not delete category',
        description,
        placement: 'topRight',
      });
    }
  };

  const confirmDelete = (row: ActivityCategory) => {
    modal.confirm({
      title: `Delete “${row.name}”?`,
      icon: <QuestionCircleOutlined />,
      content: 'Activities linked to this category may be affected. This action cannot be undone.',
      okText: 'Delete category',
      okButtonProps: {
        danger: true,
        icon: <CheckOutlined />,
      },
      cancelText: 'Keep it',
      cancelButtonProps: {
        icon: <CloseCircleOutlined />,
      },
      onOk: () => handleDelete(row),
    });
  };

  const handleCopySlug = async (row: ActivityCategory) => {
    try {
      await navigator.clipboard.writeText(row.slug);
      notification.success({
        message: 'Slug copied',
        description: `“${row.slug}” is on your clipboard.`,
        placement: 'topRight',
      });
    } catch {
      notification.error({
        message: 'Could not copy slug',
        description: 'Your browser blocked clipboard access. Copy the slug manually instead.',
        placement: 'topRight',
      });
    }
  };

  const rows = useMemo(() => data?.data ?? [], [data]);
  const activeOnPage = useMemo(() => rows.filter((row) => row.is_active).length, [rows]);
  const inactiveOnPage = rows.length - activeOnPage;
  const total = data?.total ?? 0;
  const isFiltered = !!search || !!status;

  const stats = [
    { key: 'total', label: isFiltered ? 'Matching categories' : 'Total categories', value: total, tone: 'text-stone-950' },
    { key: 'active', label: 'Active on this page', value: activeOnPage, tone: 'text-emerald-700' },
    { key: 'inactive', label: 'Inactive on this page', value: inactiveOnPage, tone: 'text-stone-500' },
  ];

  return (
    <>
      <Head title="Activity Categories" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-700 uppercase">Admin Workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">Activity Categories</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Organise the categories used to group events and activities. Inactive categories are kept but hidden from listings.
            </p>
          </div>

          <Button size="large" type="primary" icon={<Plus size={16} />} onClick={handleCreate} className="w-full sm:w-auto">
            New category
          </Button>
        </header>

        <section aria-label="Category overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.key} className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium text-stone-500">{stat.label}</p>
              <p className={`mt-2 text-3xl leading-none font-semibold tabular-nums ${stat.tone}`}>
                {loading && !data ? '—' : stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600" />

          <div className="p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-900">Category directory</h2>
                <p className="mt-1 text-sm text-stone-500">Search, edit, or toggle availability for each category.</p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-2xl lg:items-end">
                <div className="w-full lg:max-w-md">
                  <label htmlFor="activity-category-search" className="mb-2 block text-xs font-medium text-stone-600">
                    Find a category
                  </label>
                  <Search
                    id="activity-category-search"
                    placeholder="Search by name or slug"
                    size="large"
                    autoComplete="off"
                    allowClear
                    enterButton={
                      <>
                        <SearchOutlined /> Search
                      </>
                    }
                    value={searchInput}
                    loading={loading}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onSearch={applySearch}
                    onClear={() => applySearch('')}
                    className="w-full"
                  />
                </div>

                <div>
                  <span className="mb-2 block text-xs font-medium text-stone-600">Availability</span>
                  <Segmented
                    block
                    size="large"
                    aria-label="Filter by availability"
                    value={status}
                    onChange={handleStatusChange}
                    options={[
                      { label: 'All', value: '' },
                      { label: 'Active', value: 'active' },
                      { label: 'Inactive', value: 'inactive' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {loadError && (
              <Alert
                type="error"
                showIcon
                icon={<TriangleAlert size={18} />}
                className="mb-4"
                message="Activity categories could not be loaded"
                description={loadError}
                action={
                  <Button size="small" icon={<RefreshCw size={14} />} loading={loading} onClick={loadData}>
                    Retry
                  </Button>
                }
              />
            )}

            <Table<ActivityCategory>
              aria-label="Activity categories"
              dataSource={rows}
              loading={loading}
              rowKey="id"
              pagination={false}
              scroll={{ x: 900 }}
              tableLayout="fixed"
              size="large"
              rowClassName={() => 'hover:bg-stone-50'}
              locale={{
                emptyText: loading ? (
                  <span className="py-2 text-sm text-stone-500">Loading categories...</span>
                ) : isFiltered ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="py-2">
                        <p className="font-medium text-stone-700">No categories match these filters</p>
                        <p className="mt-1 text-sm text-stone-500">Try another name, or reset the filters to see everything.</p>
                        <Button
                          className="mt-4"
                          icon={<SearchX size={15} />}
                          onClick={() => {
                            clearSearch();
                            handleStatusChange('');
                          }}
                        >
                          Reset filters
                        </Button>
                      </div>
                    }
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="py-2">
                        <p className="font-medium text-stone-700">No categories yet</p>
                        <p className="mt-1 text-sm text-stone-500">Create your first category to start grouping activities.</p>
                        <Button className="mt-4" type="primary" icon={<Plus size={15} />} onClick={handleCreate}>
                          New category
                        </Button>
                      </div>
                    }
                  />
                ),
              }}
              className="overflow-hidden rounded-xl border border-stone-200 [&_.ant-table-cell]:align-middle [&_.ant-table-thead>tr>th]:bg-stone-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-stone-600 [&_.ant-table-thead>tr>th]:tracking-wide [&_.ant-table-thead>tr>th]:uppercase"
            >
              <Column<ActivityCategory>
                title="Category"
                dataIndex="name"
                key="name"
                width={280}
                render={(name: string, row) => (
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-inset ${accentFor(row.id).badge}`}
                    >
                      {initialsOf(name) || 'AC'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-6 font-semibold break-words text-stone-900">{name || 'Unnamed category'}</p>
                      <p className="mt-1 text-xs text-stone-400 tabular-nums">ID #{row.id}</p>
                    </div>
                  </div>
                )}
              />

              <Column<ActivityCategory>
                title="Slug"
                dataIndex="slug"
                key="slug"
                width={200}
                render={(slug: string, row) => (
                  <div className="flex min-w-0 items-center gap-2">
                    <code className="min-w-0 truncate rounded-md bg-stone-100 px-2 py-1 text-xs text-stone-600">{slug || '—'}</code>
                    {slug && (
                      <Tooltip title="Copy slug">
                        <Button
                          type="text"
                          size="small"
                          aria-label={`Copy slug ${slug}`}
                          icon={<Copy size={14} />}
                          onClick={() => handleCopySlug(row)}
                        />
                      </Tooltip>
                    )}
                  </div>
                )}
              />

              <Column<ActivityCategory>
                title="Description"
                dataIndex="description"
                key="description"
                width={320}
                ellipsis={{ showTitle: false }}
                render={(description: string | null) => (
                  <Tooltip title={description || undefined}>
                    <span className="block truncate text-sm text-stone-600">{description || <span className="text-stone-400">No description</span>}</span>
                  </Tooltip>
                )}
              />

              <Column<ActivityCategory>
                title="Updated"
                dataIndex="updated_at"
                key="updated_at"
                width={140}
                render={(value: string | null) => <span className="text-sm whitespace-nowrap text-stone-500">{formatDate(value) || '—'}</span>}
              />

              <Column<ActivityCategory>
                title="Status"
                dataIndex="is_active"
                key="is_active"
                width={130}
                render={(isActive: boolean, row) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      size="small"
                      checked={!!isActive}
                      loading={pendingId === row.id}
                      aria-label={`${isActive ? 'Deactivate' : 'Activate'} ${row.name}`}
                      onChange={() => handleToggleActive(row)}
                    />
                    <span className={`text-xs font-semibold ${isActive ? 'text-emerald-700' : 'text-stone-500'}`}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}
              />

              <Column<ActivityCategory>
                title="Actions"
                key="action"
                fixed="right"
                width={90}
                align="center"
                render={(_, row) => (
                  <Space size="small">
                    <Dropdown
                      trigger={['click']}
                      placement="bottomRight"
                      menu={
                        {
                          items: [
                            {
                              label: 'Edit category',
                              key: `admin.activity-categories.edit.${row.id}`,
                              icon: <Pencil size={15} />,
                              onClick: () => handleEdit(row),
                            },
                            {
                              label: 'Copy slug',
                              key: `admin.activity-categories.copy-slug.${row.id}`,
                              icon: <Copy size={15} />,
                              disabled: !row.slug,
                              onClick: () => handleCopySlug(row),
                            },
                            {
                              label: row.is_active ? 'Deactivate' : 'Set active',
                              key: `admin.activity-categories.active.${row.id}`,
                              icon: <RefreshCw size={15} />,
                              onClick: () => handleToggleActive(row),
                            },
                            { type: 'divider' },
                            {
                              label: 'Delete',
                              key: `admin.activity-categories.delete.${row.id}`,
                              danger: true,
                              icon: <Trash2 size={15} />,
                              onClick: () => confirmDelete(row),
                            },
                          ],
                        } as MenuProps
                      }
                    >
                      <Tooltip title={`Actions for ${row.name}`}>
                        <Button type="text" size="small" aria-label={`Actions for ${row.name}`} icon={<MoreHorizontal size={18} />} />
                      </Tooltip>
                    </Dropdown>
                  </Space>
                )}
              />
            </Table>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
              <p className="text-xs text-stone-500">
                {total > 0
                  ? `Showing ${(data?.current_page ?? page - 1) * (data?.per_page ?? perPage) + 1}–${(data?.current_page ?? page - 1) * (data?.per_page ?? perPage) + rows.length} of ${total} categories`
                  : 'No categories to show yet.'}
              </p>

              <Pagination
                onChange={(nextPage, nextPerPage) => {
                  setPage(nextPage);
                  setPerPage(nextPerPage);
                }}
                current={data?.current_page ?? page}
                pageSize={data?.per_page ?? perPage}
                showSizeChanger
                pageSizeOptions={[10, 20, 50]}
                responsive
                total={total}
                hideOnSinglePage={false}
                showTotal={(value, range) => `${range[0]}–${range[1]} of ${value} categories`}
              />
            </div>
          </div>
        </section>
      </div>

      <ModalCreateEditActivityCategories
        modalOpen={open}
        data={editing}
        onClose={handleClose}
        refetch={loadData}
      />
    </>
  );
};

AdminActivityCategoriesPage.layout = (page: ReactNode) => (
  <AdminAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</AdminAuthLayout>
);

export default AdminActivityCategoriesPage;
