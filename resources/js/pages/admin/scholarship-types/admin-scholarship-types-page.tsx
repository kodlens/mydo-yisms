import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { SharedData } from '@/types';
import { ScholarshipType, ScholarshipTypeStatusFilter } from '@/types/scholarship';
import { CheckOutlined, CloseCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Alert, App, Button, Dropdown, Empty, Input, MenuProps, Pagination, Segmented, Space, Switch, Table, Tooltip } from 'antd';
import axios from 'axios';
import {
  FileText,
  Gift,
  Info,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  SearchX,
  Trash2,
  TriangleAlert,
  Users,
  Wallet,
} from 'lucide-react';
import { ReactElement, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ModalCreateEditScholarshipType from './partials/modal-create-edit-scholarship-types';

type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
};

const { Column } = Table;
const { Search } = Input;

const SEARCH_DEBOUNCE_MS = 350;

const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const dateFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' });

const formatDate = (value?: string | null) => {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : dateFormatter.format(parsed);
};

const formatAmount = (amount: ScholarshipType['amount']) => {
  if (amount === null || amount === undefined || amount === '') return null;

  const numeric = Number(amount);

  return Number.isFinite(numeric) ? pesoFormatter.format(numeric) : null;
};

const initialsOf = (name?: string | null) => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

const AdminScholarshipTypesPage = () => {
  const { notification, modal } = App.useApp();

  const [data, setData] = useState<PaginatedResponse<ScholarshipType>>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ScholarshipTypeStatusFilter>('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ScholarshipType | undefined>();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const requestId = useRef(0);

  const loadData = useCallback(async () => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setLoadError(null);

    try {
      const res = await axios.get<PaginatedResponse<ScholarshipType>>('/admin/get-scholarship-types', {
        params: {
          search,
          status: status === 'all' ? '' : status,
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

      setLoadError('We could not load scholarship types. Check your connection and try again.');
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
      setSearch((current) => (current === next ? current : next));
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

  const handleStatusChange = (next: ScholarshipTypeStatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  const handleCreate = () => {
    setEditing(undefined);
    setOpen(true);
  };

  const handleEdit = (row: ScholarshipType) => {
    setEditing(row);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleToggleActive = async (row: ScholarshipType) => {
    const nextValue = !row.is_active;

    setPendingId(row.id);
    setData((current) =>
      current
        ? { ...current, data: current.data.map((item) => (item.id === row.id ? { ...item, is_active: nextValue } : item)) }
        : current,
    );

    try {
      const res = await axios.post(`/admin/scholarship-types/${row.id}/active`, {
        is_active: nextValue,
      });

      if (!res.data?.success) {
        throw new Error('The server did not confirm the status change.');
      }

      notification.success({
        message: 'Status updated',
        description: `“${row.scholarship}” is now ${nextValue ? 'open to applicants' : 'closed to applicants'}.`,
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

  const handleDelete = async (row: ScholarshipType) => {
    try {
      const res = await axios.delete(`/admin/scholarship-types/${row.id}`);

      if (!res.data?.success) {
        throw new Error('The server did not confirm the deletion.');
      }

      notification.success({
        message: 'Scholarship deleted',
        description: `“${row.scholarship}” was removed successfully.`,
        placement: 'topRight',
      });
    } catch (err: unknown) {
      const description = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message ?? 'Something went wrong. Please try again.')
        : 'Something went wrong. Please try again.';

      // A 422 here means the type is still referenced by applications, so it cannot be deleted.
      notification.error({
        message: 'Could not delete scholarship',
        description,
        placement: 'topRight',
      });
    } finally {
      loadData();
    }
  };

  const confirmDelete = (row: ScholarshipType) => {
    // Mirror the server rule up front so the warning shows before the request is made.
    const isBlocked = row.applications_count > 0;

    modal.confirm({
      title: `Delete “${row.scholarship}”?`,
      icon: <QuestionCircleOutlined />,
      content: isBlocked ? (
        <div className="flex items-start gap-2">
          <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <span>
            {row.applications_count === 1
              ? 'One application still uses this scholarship. Close it instead of deleting it.'
              : `${row.applications_count} applications still use this scholarship. Close it instead of deleting it.`}
          </span>
        </div>
      ) : (
        'This removes the scholarship from the youth listings. This action cannot be undone.'
      ),
      okText: isBlocked ? 'Close it instead' : 'Delete scholarship',
      okButtonProps: {
        danger: !isBlocked,
        icon: isBlocked ? <RefreshCw size={15} /> : <CheckOutlined />,
      },
      cancelText: isBlocked ? 'Keep it open' : 'Keep it',
      cancelButtonProps: {
        icon: <CloseCircleOutlined />,
      },
      onOk: isBlocked ? () => handleToggleActive(row) : () => handleDelete(row),
    });
  };

  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;
  const openOnPage = useMemo(() => rows.filter((row) => row.is_active).length, [rows]);
  const closedOnPage = rows.length - openOnPage;
  const applicantsOnPage = useMemo(() => rows.reduce((sum, row) => sum + (row.applications_count ?? 0), 0), [rows]);

  const stats = [
    {
      key: 'total',
      label: search || status !== 'all' ? 'Matching scholarships' : 'Total scholarships',
      value: total,
      tone: 'text-stone-950',
    },
    { key: 'open', label: 'Open on this page', value: openOnPage, tone: 'text-emerald-700' },
    { key: 'closed', label: 'Closed on this page', value: closedOnPage, tone: 'text-stone-500' },
  ];

  const filtersActive = Boolean(search) || status !== 'all';

  // Rows shown before the current page, so the footer can render "Showing 1–10 of 42".
  const offset = ((data?.current_page ?? page) - 1) * (data?.per_page ?? perPage);

  return (
    <>
      <Head title="Scholarship Type Management" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-700 uppercase">Admin Workspace</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">Scholarship Types</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
              Manage the scholarship programs youth can discover and apply for. Closed programs stay listed here but are hidden from the youth
              side.
            </p>
          </div>

          <Button size="large" type="primary" icon={<Plus size={16} />} onClick={handleCreate} className="w-full sm:w-auto">
            New scholarship
          </Button>
        </header>

        <section aria-label="Scholarship overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                <h2 className="text-base font-semibold text-stone-900">Scholarship directory</h2>
                <p className="mt-1 text-sm text-stone-500">Search, edit, or open and close each program.</p>
              </div>

              <div className="w-full lg:max-w-md">
                <label htmlFor="scholarship-type-search" className="mb-2 block text-xs font-medium text-stone-600">
                  Find a scholarship
                </label>
                <Search
                  id="scholarship-type-search"
                  placeholder="Search name, beneficiaries, or benefits"
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
            </div>

            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <Segmented<ScholarshipTypeStatusFilter>
                value={status}
                onChange={handleStatusChange}
                aria-label="Filter by availability"
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Open', value: 'active' },
                  { label: 'Closed', value: 'inactive' },
                ]}
              />

              {applicantsOnPage > 0 && (
                <p className="text-xs text-stone-500">
                  {applicantsOnPage === 1 ? '1 application' : `${applicantsOnPage} applications`} linked to the programs on this page
                </p>
              )}
            </div>

            {loadError && (
              <Alert
                type="error"
                showIcon
                icon={<TriangleAlert size={18} />}
                className="mb-4"
                message="Scholarship types could not be loaded"
                description={loadError}
                action={
                  <Button size="small" icon={<RefreshCw size={14} />} loading={loading} onClick={loadData}>
                    Retry
                  </Button>
                }
              />
            )}

            <Table<ScholarshipType>
              aria-label="Scholarship types"
              dataSource={rows}
              loading={loading}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1180 }}
              tableLayout="fixed"
              size="large"
              rowClassName={(row) => (row.is_active ? 'hover:bg-stone-50' : 'bg-stone-50/40 hover:bg-stone-50')}
              locale={{
                emptyText: loading ? (
                  <span className="py-2 text-sm text-stone-500">Loading scholarships...</span>
                ) : filtersActive ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="py-2">
                        <p className="font-medium text-stone-700">No scholarships match your filters</p>
                        <p className="mt-1 text-sm text-stone-500">Try another search term or show all programs again.</p>
                        <Button
                          className="mt-4"
                          icon={<SearchX size={15} />}
                          onClick={() => {
                            clearSearch();
                            handleStatusChange('all');
                          }}
                        >
                          Clear filters
                        </Button>
                      </div>
                    }
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="py-2">
                        <p className="font-medium text-stone-700">No scholarships yet</p>
                        <p className="mt-1 text-sm text-stone-500">Create your first program so youth can discover and apply for it.</p>
                        <Button className="mt-4" type="primary" icon={<Plus size={15} />} onClick={handleCreate}>
                          New scholarship
                        </Button>
                      </div>
                    }
                  />
                ),
              }}
              className="overflow-hidden rounded-xl border border-stone-200 [&_.ant-table-cell]:align-middle [&_.ant-table-thead>tr>th]:bg-stone-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-stone-600 [&_.ant-table-thead>tr>th]:tracking-wide [&_.ant-table-thead>tr>th]:uppercase"
            >
              <Column<ScholarshipType>
                title="Scholarship"
                dataIndex="scholarship"
                key="scholarship"
                width={265}
                render={(name: string, row) => (
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-inset ${
                        row.is_active ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-stone-100 text-stone-500 ring-stone-200'
                      }`}
                    >
                      {initialsOf(name) || 'ST'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-6 font-semibold break-words text-stone-900">{name || 'Unnamed scholarship'}</p>
                      <p className="mt-1 text-xs text-stone-400 tabular-nums">ID #{row.id}</p>
                    </div>
                  </div>
                )}
              />

              <Column<ScholarshipType>
                title="Target beneficiaries"
                dataIndex="target_beneficiary"
                key="target_beneficiary"
                width={230}
                render={(value: string | null) => (
                  <div className="flex min-w-0 gap-2">
                    <Users size={14} className="mt-1 shrink-0 text-stone-300" aria-hidden="true" />
                    <Tooltip title={value || undefined}>
                      <span className="block truncate text-sm text-stone-600">
                        {value || <span className="text-stone-400">Not specified</span>}
                      </span>
                    </Tooltip>
                  </div>
                )}
              />

              <Column<ScholarshipType>
                title="Benefits"
                dataIndex="benefit"
                key="benefit"
                width={240}
                render={(value: string | null) => (
                  <div className="flex min-w-0 gap-2">
                    <Gift size={14} className="mt-1 shrink-0 text-stone-300" aria-hidden="true" />
                    <Tooltip title={value || undefined}>
                      <span className="block truncate text-sm text-stone-600">
                        {value || <span className="text-stone-400">Not specified</span>}
                      </span>
                    </Tooltip>
                  </div>
                )}
              />

              <Column<ScholarshipType>
                title="Amount"
                dataIndex="amount"
                key="amount"
                width={140}
                align="right"
                render={(value: ScholarshipType['amount']) => {
                  const formatted = formatAmount(value);

                  return (
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      {formatted ? (
                        <>
                          <Wallet size={14} className="text-stone-300" aria-hidden="true" />
                          <span className="text-sm font-semibold text-stone-900 tabular-nums">{formatted}</span>
                        </>
                      ) : (
                        <span className="text-sm text-stone-400">Not specified</span>
                      )}
                    </span>
                  );
                }}
              />

              <Column<ScholarshipType>
                title="Applications"
                dataIndex="applications_count"
                key="applications_count"
                width={130}
                align="center"
                render={(count: number) => (
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm tabular-nums ${
                      count > 0 ? 'font-semibold text-stone-900' : 'text-stone-400'
                    }`}
                    title={count > 0 ? 'This program has applications and cannot be deleted' : 'No applications yet'}
                  >
                    <FileText size={14} aria-hidden="true" />
                    {(count ?? 0).toLocaleString()}
                    {count > 0 && <span className="sr-only">applications, cannot be deleted</span>}
                  </span>
                )}
              />

              <Column<ScholarshipType>
                title="Updated"
                dataIndex="updated_at"
                key="updated_at"
                width={130}
                render={(value: string | null) => <span className="text-sm whitespace-nowrap text-stone-500">{formatDate(value) || '—'}</span>}
              />

              <Column<ScholarshipType>
                title="Status"
                dataIndex="is_active"
                key="is_active"
                width={140}
                render={(isActive: boolean, row) => (
                  <div className="flex items-center gap-2">
                    <Switch
                      size="small"
                      checked={!!isActive}
                      loading={pendingId === row.id}
                      aria-label={`${isActive ? 'Close' : 'Open'} ${row.scholarship} to applicants`}
                      onChange={() => handleToggleActive(row)}
                    />
                    <span className={`text-xs font-semibold ${isActive ? 'text-emerald-700' : 'text-stone-500'}`}>
                      {isActive ? 'Open' : 'Closed'}
                    </span>
                  </div>
                )}
              />

              <Column<ScholarshipType>
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
                              label: 'Edit scholarship',
                              key: `admin.scholarship-types.edit.${row.id}`,
                              icon: <Pencil size={15} />,
                              onClick: () => handleEdit(row),
                            },
                            {
                              label: row.is_active ? 'Close to applicants' : 'Open to applicants',
                              key: `admin.scholarship-types.active.${row.id}`,
                              icon: <RefreshCw size={15} />,
                              onClick: () => handleToggleActive(row),
                            },
                            { type: 'divider' },
                            {
                              label: row.applications_count > 0 ? 'Cannot delete (has applications)' : 'Delete',
                              key: `admin.scholarship-types.delete.${row.id}`,
                              danger: true,
                              // Blocking here keeps the destructive action from looking available when the server will reject it.
                              disabled: row.applications_count > 0,
                              icon: <Trash2 size={15} />,
                              onClick: () => confirmDelete(row),
                            },
                          ],
                        } as MenuProps
                      }
                    >
                      <Tooltip title={`Actions for ${row.scholarship}`}>
                        <Button
                          type="text"
                          size="small"
                          aria-label={`Actions for ${row.scholarship}`}
                          icon={<MoreHorizontal size={18} />}
                        />
                      </Tooltip>
                    </Dropdown>
                  </Space>
                )}
              />
            </Table>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100 pt-5">
              <p className="text-xs text-stone-500">
                {total > 0
                  ? `Showing ${offset + 1}–${offset + rows.length} of ${total} scholarship types`
                  : filtersActive
                    ? 'No scholarships match your filters.'
                    : 'No scholarships to show yet.'}
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
                showTotal={(value, range) => `${range[0]}–${range[1]} of ${value} scholarship types`}
              />
            </div>
          </div>
        </section>
      </div>

      <ModalCreateEditScholarshipType modalOpen={open} data={editing} onClose={handleClose} refetch={loadData} />
    </>
  );
};

AdminScholarshipTypesPage.layout = (page: ReactNode) => (
  <AdminAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</AdminAuthLayout>
);

export default AdminScholarshipTypesPage;
