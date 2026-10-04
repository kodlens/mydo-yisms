import ModalCreateEditVolunteer from '@/components/volunteer/modal-create-edit-volunteer';
import ModalVolunteerAssignments from '@/components/volunteer/modal-volunteer-assignments';
import { Volunteer, VolunteerStatusFilter } from '@/types/volunteer';
import { CheckOutlined, CloseCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { Alert, App, Button, Dropdown, Empty, Input, MenuProps, Pagination, Segmented, Space, Table, Tooltip } from 'antd';
import axios from 'axios';
import {
  ClipboardCheck,
  Clock,
  Info,
  MoreHorizontal,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  SearchX,
  Trash2,
  TriangleAlert,
  UserRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type PaginatedResponse<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
};

type Props = {
  /** Endpoint prefix for the volunteer record actions, e.g. `/admin/volunteers`. */
  basePath: string;
  /** Listing endpoint, e.g. `/admin/get-volunteers`. */
  dataPath: string;
  workspaceLabel: string;
  /** Admin can register a volunteer; staff only review and record work. */
  canRegister?: boolean;
  /** Deleting a volunteer record is reserved for admin. */
  canRemove?: boolean;
  heading: string;
  description: string;
};

const { Column } = Table;
const { Search } = Input;

const SEARCH_DEBOUNCE_MS = 350;

const dateFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' });

const formatDate = (value?: string | null) => {
  if (!value) return null;

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : dateFormatter.format(parsed);
};

const formatHours = (value: number) =>
  `${value.toLocaleString('en-PH', { minimumFractionDigits: value % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })} hrs`;

const initialsOf = (name?: string | null) => {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();
};

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-800',
  inactive: 'bg-stone-100 text-stone-600',
};

/**
 * The volunteer directory, shared by the admin and staff panels. Both roles work the
 * same records, so the table, filters, and modals live here and each page only sets
 * its endpoints and the actions that role is allowed to perform.
 */
const VolunteerDirectory = ({
  basePath,
  dataPath,
  workspaceLabel,
  canRegister = false,
  canRemove = false,
  heading,
  description,
}: Props) => {
  const { notification, modal } = App.useApp();

  const [data, setData] = useState<PaginatedResponse<Volunteer>>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [perPage, setPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<VolunteerStatusFilter>('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Volunteer | undefined>();
  const [assignmentsFor, setAssignmentsFor] = useState<Volunteer | undefined>();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const requestId = useRef(0);

  const loadData = useCallback(async () => {
    const currentRequest = ++requestId.current;

    setLoading(true);
    setLoadError(null);

    try {
      const res = await axios.get<PaginatedResponse<Volunteer>>(dataPath, {
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

      // Removing the last row of a page would otherwise leave the user on a blank page.
      if (res.data.data.length === 0 && page > 1) {
        setPage(page - 1);
      }
    } catch {
      if (currentRequest !== requestId.current) return;

      setLoadError('We could not load volunteers. Check your connection and try again.');
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
      }
    }
  }, [dataPath, page, perPage, search, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debounced search so users get results while typing, without a request per keystroke.
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

  const handleStatusFilter = (next: VolunteerStatusFilter) => {
    setStatus(next);
    setPage(1);
  };

  const handleCreate = () => {
    setEditing(undefined);
    setOpen(true);
  };

  const handleEdit = (row: Volunteer) => {
    setEditing(row);
    setOpen(true);
  };

  const handleSetStatus = async (row: Volunteer, nextStatus: Volunteer['status']) => {
    setPendingId(row.id);

    // Optimistically flip the badge so the toggle feels instant.
    setData((current) =>
      current ? { ...current, data: current.data.map((item) => (item.id === row.id ? { ...item, status: nextStatus } : item)) } : current,
    );

    try {
      const res = await axios.post(`${basePath}/${row.id}/status`, { status: nextStatus });

      if (!res.data?.success) {
        throw new Error('The server did not confirm the status change.');
      }

      notification.success({
        message: 'Status updated',
        description: `“${row.full_name}” is now ${nextStatus}.`,
        placement: 'topRight',
      });
    } catch (err: unknown) {
      const description = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message ?? 'Something went wrong. Please try again.')
        : 'Something went wrong. Please try again.';

      // Roll the optimistic update back so the badge matches the server.
      setData((current) =>
        current ? { ...current, data: current.data.map((item) => (item.id === row.id ? { ...item, status: row.status } : item)) } : current,
      );

      notification.error({ message: 'Could not update status', description, placement: 'topRight' });
    } finally {
      setPendingId(null);
      loadData();
    }
  };

  const handleDelete = async (row: Volunteer) => {
    try {
      const res = await axios.delete(`${basePath}/${row.id}`);

      if (!res.data?.success) {
        throw new Error('The server did not confirm the deletion.');
      }

      notification.success({
        message: 'Volunteer removed',
        description: `${row.full_name || 'The volunteer'} was removed from the program.`,
        placement: 'topRight',
      });
    } catch (err: unknown) {
      const description = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? err.message ?? 'Something went wrong. Please try again.')
        : 'Something went wrong. Please try again.';

      notification.error({ message: 'Could not remove volunteer', description, placement: 'topRight' });
    } finally {
      loadData();
    }
  };

  const confirmDelete = (row: Volunteer) => {
    // Mirror the server rule up front: service history blocks the delete.
    const isBlocked = row.assignments_count > 0;

    modal.confirm({
      title: `Remove ${row.full_name || 'this volunteer'}?`,
      icon: <QuestionCircleOutlined />,
      content: isBlocked ? (
        <div className="flex items-start gap-2">
          <Info size={15} className="mt-0.5 shrink-0 text-amber-600" />
          <span>
            This volunteer has {row.assignments_count === 1 ? 'an assignment' : 'assignments'} and {formatHours(row.total_hours)} of service
            records. Set them to inactive instead so the history is kept.
          </span>
        </div>
      ) : (
        'This removes the volunteer record. No service hours are affected because none have been recorded.'
      ),
      okText: isBlocked ? 'Set inactive' : 'Remove volunteer',
      okButtonProps: { danger: !isBlocked, icon: isBlocked ? <RefreshCw size={15} /> : <CheckOutlined /> },
      cancelText: 'Cancel',
      cancelButtonProps: { icon: <CloseCircleOutlined /> },
      onOk: isBlocked ? () => handleSetStatus(row, 'inactive') : () => handleDelete(row),
    });
  };

  const rows = useMemo(() => data?.data ?? [], [data]);
  const total = data?.total ?? 0;
  const activeOnPage = useMemo(() => rows.filter((row) => row.status === 'active').length, [rows]);
  const pendingOnPage = useMemo(() => rows.filter((row) => row.status === 'pending').length, [rows]);
  const hoursOnPage = useMemo(() => rows.reduce((sum, row) => sum + (row.total_hours ?? 0), 0), [rows]);

  const stats = [
    {
      key: 'total',
      label: search || status !== 'all' ? 'Matching volunteers' : 'Total volunteers',
      value: total,
      tone: 'text-stone-950',
      format: (value: number) => value.toLocaleString(),
    },
    {
      key: 'active',
      label: 'Active on this page',
      value: activeOnPage,
      tone: 'text-emerald-700',
      format: (value: number) => value.toLocaleString(),
    },
    { key: 'hours', label: 'Service hours here', value: hoursOnPage, tone: 'text-teal-700', format: formatHours },
  ];

  const filtersActive = Boolean(search) || status !== 'all';
  const offset = ((data?.current_page ?? page) - 1) * (data?.per_page ?? perPage);

  return (
    <>
      <Head title={heading} />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-700 uppercase">{workspaceLabel}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">{heading}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">{description}</p>
          </div>

          {canRegister && (
            <Button size="large" type="primary" icon={<Plus size={16} />} onClick={handleCreate} className="w-full sm:w-auto">
              Register volunteer
            </Button>
          )}
        </header>

        <section aria-label="Volunteer overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.key} className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
              <p className="text-xs font-medium text-stone-500">{stat.label}</p>
              <p className={`mt-2 text-3xl leading-none font-semibold tabular-nums ${stat.tone}`}>
                {loading && !data ? '—' : stat.format(stat.value)}
              </p>
              {stat.key === 'hours' && (
                <p className="mt-2 text-xs text-stone-400">
                  {pendingOnPage === 0 ? 'All volunteers reviewed' : `${pendingOnPage} awaiting review`}
                </p>
              )}
            </div>
          ))}
        </section>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600" />

          <div className="p-4 sm:p-6">
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-base font-semibold text-stone-900">Volunteer directory</h2>
                <p className="mt-1 text-sm text-stone-500">Search, review, assign, and record attendance.</p>
              </div>

              <div className="w-full lg:max-w-md">
                <label htmlFor="volunteer-search" className="mb-2 block text-xs font-medium text-stone-600">
                  Find a volunteer
                </label>
                <Search
                  id="volunteer-search"
                  placeholder="Search by name, email, school, or skills"
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

            <div className="mb-5 flex flex-wrap items-center gap-3">
              <Segmented<VolunteerStatusFilter>
                value={status}
                onChange={handleStatusFilter}
                aria-label="Filter by status"
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Active', value: 'active' },
                  { label: 'Pending', value: 'pending' },
                  { label: 'Inactive', value: 'inactive' },
                ]}
              />

              {pendingOnPage > 0 && status !== 'pending' && (
                <Button size="small" type="link" onClick={() => handleStatusFilter('pending')}>
                  Review {pendingOnPage} pending
                </Button>
              )}
            </div>

            {loadError && (
              <Alert
                type="error"
                showIcon
                icon={<TriangleAlert size={18} />}
                className="mb-4"
                message="Volunteers could not be loaded"
                description={loadError}
                action={
                  <Button size="small" icon={<RefreshCw size={14} />} loading={loading} onClick={loadData}>
                    Retry
                  </Button>
                }
              />
            )}

            <Table<Volunteer>
              aria-label="Volunteers"
              dataSource={rows}
              loading={loading}
              rowKey="id"
              pagination={false}
              scroll={{ x: 1150 }}
              tableLayout="fixed"
              size="large"
              rowClassName={() => 'hover:bg-stone-50'}
              locale={{
                emptyText: loading ? (
                  <span className="py-2 text-sm text-stone-500">Loading volunteers...</span>
                ) : filtersActive ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      <div className="py-2">
                        <p className="font-medium text-stone-700">No volunteers match your filters</p>
                        <p className="mt-1 text-sm text-stone-500">Try another search term or show all volunteers again.</p>
                        <Button
                          className="mt-4"
                          icon={<SearchX size={15} />}
                          onClick={() => {
                            clearSearch();
                            handleStatusFilter('all');
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
                        <p className="font-medium text-stone-700">No volunteers yet</p>
                        <p className="mt-1 text-sm text-stone-500">
                          {canRegister
                            ? 'Youth can also sign up themselves from their portal.'
                            : 'Youth sign up themselves from their portal. New applications appear here for review.'}
                        </p>
                        {canRegister && (
                          <Button className="mt-4" type="primary" icon={<Plus size={15} />} onClick={handleCreate}>
                            Register volunteer
                          </Button>
                        )}
                      </div>
                    }
                  />
                ),
              }}
              className="overflow-hidden rounded-xl border border-stone-200 [&_.ant-table-cell]:align-middle [&_.ant-table-thead>tr>th]:bg-stone-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-stone-600 [&_.ant-table-thead>tr>th]:tracking-wide [&_.ant-table-thead>tr>th]:uppercase"
            >
              <Column<Volunteer>
                title="Volunteer"
                key="full_name"
                width={260}
                render={(_, row) => (
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-inset ${
                        row.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-100' : 'bg-stone-100 text-stone-500 ring-stone-200'
                      }`}
                    >
                      {initialsOf(row.full_name) || <UserRound size={16} />}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-6 font-semibold break-words text-stone-900">{row.full_name || 'Unnamed volunteer'}</p>
                      <p className="mt-1 truncate text-xs text-stone-400">{row.email || 'No email on record'}</p>
                    </div>
                  </div>
                )}
              />

              <Column<Volunteer>
                title="Contact"
                key="contact"
                width={180}
                render={(_, row) => (
                  <div className="min-w-0 text-xs leading-5 text-stone-600">
                    {row.mobile_number ? (
                      <p className="flex items-center gap-1.5">
                        <Phone size={12} className="shrink-0 text-stone-300" aria-hidden="true" />
                        <span className="truncate tabular-nums">{row.mobile_number}</span>
                      </p>
                    ) : (
                      <p className="text-stone-400">No mobile number</p>
                    )}
                    {row.school_name && <p className="truncate text-stone-400">{row.school_name}</p>}
                  </div>
                )}
              />

              <Column<Volunteer>
                title="Skills"
                dataIndex="skills"
                key="skills"
                width={220}
                render={(value: string | null) => (
                  <Tooltip title={value || undefined}>
                    <span className="block truncate text-sm text-stone-600">
                      {value || <span className="text-stone-400">Not specified</span>}
                    </span>
                  </Tooltip>
                )}
              />

              <Column<Volunteer>
                title="Service hours"
                dataIndex="total_hours"
                key="total_hours"
                width={130}
                align="right"
                render={(value: number) => (
                  <span className={`text-sm font-semibold tabular-nums ${value > 0 ? 'text-teal-800' : 'text-stone-400'}`}>
                    {formatHours(value ?? 0)}
                  </span>
                )}
              />

              <Column<Volunteer>
                title="Assignments"
                dataIndex="assignments_count"
                key="assignments_count"
                width={125}
                align="center"
                render={(count: number, row) => (
                  <Button
                    type="link"
                    size="small"
                    className="!px-0"
                    onClick={() => setAssignmentsFor(row)}
                    icon={<ClipboardCheck size={14} />}
                  >
                    {count === 0 ? 'Assign' : `${count} assigned`}
                  </Button>
                )}
              />

              <Column<Volunteer>
                title="Status"
                dataIndex="status"
                key="status"
                width={120}
                render={(rowStatus: Volunteer['status'], row) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                      statusStyles[rowStatus] ?? statusStyles.inactive
                    } ${pendingId === row.id ? 'opacity-60' : ''}`}
                  >
                    {rowStatus}
                  </span>
                )}
              />

              <Column<Volunteer>
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
                              label: 'Edit details',
                              key: `volunteers.edit.${row.id}`,
                              icon: <Pencil size={15} />,
                              onClick: () => handleEdit(row),
                            },
                            {
                              label: 'Assignments & attendance',
                              key: `volunteers.assignments.${row.id}`,
                              icon: <ClipboardCheck size={15} />,
                              onClick: () => setAssignmentsFor(row),
                            },
                            { type: 'divider' },
                            {
                              label: row.status === 'active' ? 'Set pending' : 'Set active',
                              key: `volunteers.status.${row.id}`,
                              icon: <RefreshCw size={15} />,
                              onClick: () => handleSetStatus(row, row.status === 'active' ? 'pending' : 'active'),
                            },
                            {
                              label: row.status === 'inactive' ? 'Set active' : 'Set inactive',
                              key: `volunteers.inactive.${row.id}`,
                              icon: <Clock size={15} />,
                              onClick: () => handleSetStatus(row, row.status === 'inactive' ? 'active' : 'inactive'),
                            },
                            ...(canRemove
                              ? [
                                  { type: 'divider' as const },
                                  {
                                    label:
                                      row.assignments_count > 0
                                        ? 'Cannot remove (has service records)'
                                        : 'Remove from program',
                                    key: `volunteers.delete.${row.id}`,
                                    danger: true,
                                    // Blocking here keeps the destructive action from looking available when the server will reject it.
                                    disabled: row.assignments_count > 0,
                                    icon: <Trash2 size={15} />,
                                    onClick: () => confirmDelete(row),
                                  },
                                ]
                              : []),
                          ],
                        } as MenuProps
                      }
                    >
                      <Tooltip title={`Actions for ${row.full_name}`}>
                        <Button
                          type="text"
                          size="small"
                          aria-label={`Actions for ${row.full_name}`}
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
                  ? `Showing ${offset + 1}–${offset + rows.length} of ${total} volunteers`
                  : filtersActive
                    ? 'No volunteers match your filters.'
                    : 'No volunteers to show yet.'}
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
                showTotal={(value, range) => `${range[0]}–${range[1]} of ${value} volunteers`}
              />
            </div>
          </div>
        </section>
      </div>

      <ModalCreateEditVolunteer
        modalOpen={open}
        data={editing}
        onClose={() => setOpen(false)}
        refetch={loadData}
        basePath={basePath}
      />

      <ModalVolunteerAssignments
        volunteer={assignmentsFor}
        onClose={() => setAssignmentsFor(undefined)}
        refetch={loadData}
        basePath={basePath}
      />
    </>
  );
};

export default VolunteerDirectory;
