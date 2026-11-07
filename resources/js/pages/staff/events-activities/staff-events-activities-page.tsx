import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { PaginatedResponse, SharedData } from '@/types';
import { Activity, ActivityStatus } from '@/types/activity';
import { CheckOutlined, CloseCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { Alert, App, Button, Dropdown, Empty, Input, MenuProps, Pagination, Segmented, Space, Table, Tag, Tooltip } from 'antd';
import axios from 'axios';
import { CalendarDays, Copy, MapPin, MoreHorizontal, Pencil, Plus, QrCode, RefreshCw, SearchX, Trash2, TriangleAlert, Users } from 'lucide-react';
import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';

const { Column } = Table;
const { Search } = Input;

/** Wait this long after the last keystroke before asking the server for results. */
const SEARCH_DEBOUNCE_MS = 350;

/** '' means "no filter", otherwise it is one of the ActivityStatus values. */
type StatusFilter = '' | ActivityStatus;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Archived', value: 'archived' },
];

/** Antd Tag colour per status, so the table reads at a glance. */
const STATUS_TAG: Record<ActivityStatus, string> = {
    draft: 'default',
    published: 'green',
    cancelled: 'red',
    archived: 'gold',
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short',
});

const dateFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium' });

/** Returns a formatted date, or null when the value is missing or unparsable. */
const formatDate = (value?: string | null, withTime = false) => {
    if (!value) return null;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return null;

    return withTime ? dateTimeFormatter.format(parsed) : dateFormatter.format(parsed);
};

const StaffEventsActivitiesPage = () => {
    const { notification, modal } = App.useApp();

    // --- Filters: `searchInput` is what the user types, `search` is what we send to the server.
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('');

    // Only the delete confirmation lives on this page; the form and the participant
    // list each have their own route.
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // TanStack Query owns the request: fetching, caching, and error state.
    const { data, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['staff-events-activities', perPage, page, search, status],
        queryFn: async () => {
            const response = await axios.get<PaginatedResponse<Activity>>('/staff/events-activities/data', {
                params: { perpage: perPage, page, search, status },
            });

            return response.data;
        },
    });

    // Debounce so typing does not fire a request on every keystroke.
    useEffect(() => {
        const timer = window.setTimeout(() => {
            setSearch(searchInput.trim());
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);

        return () => window.clearTimeout(timer);
    }, [searchInput]);

    const clearSearch = () => {
        setSearchInput('');
        setSearch('');
        setPage(1);
    };

    const handleStatusChange = (value: string | number) => {
        setStatus(STATUS_OPTIONS.some((option) => option.value === value) ? (value as StatusFilter) : '');
        setPage(1);
    };

    const handleRetry = () => {
        notification.info({ message: 'Reloading activities...', placement: 'topRight' });
        refetch();
    };

    // The create/edit form is its own page, so these just navigate there.
    const handleCreate = () => router.visit('/staff/events-activities/create');

    const handleEdit = (row: Activity) => router.visit(`/staff/events-activities/${row.id}/edit`);

    const handleViewParticipants = (row: Activity) => router.visit(`/staff/events-activities/${row.id}/participants`);

    const handleCopySlug = async (row: Activity) => {
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

    const handleDelete = async (row: Activity) => {
        setDeletingId(row.id);

        try {
            const response = await axios.delete(`/staff/events-activities/${row.id}`);

            if (!response.data?.success) {
                throw new Error(response.data?.message ?? 'The server did not confirm the deletion.');
            }

            notification.success({
                message: 'Activity deleted',
                description: `“${row.title}” was removed successfully.`,
                placement: 'topRight',
            });

            refetch();
        } catch (err) {
            const description = axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message) : 'Something went wrong. Please try again.';

            notification.error({
                message: 'Could not delete activity',
                description,
                placement: 'topRight',
            });
        } finally {
            setDeletingId(null);
        }
    };

    // Ask first, because deleting an activity removes its sign-ups too.
    const confirmDelete = (row: Activity) => {
        const reservations = row.approved_registrations_count ?? 0;

        modal.confirm({
            title: `Delete “${row.title}”?`,
            icon: <QuestionCircleOutlined />,
            content:
                reservations > 0
                    ? `${reservations} youth registration(s) still point to this activity, so the server will block the delete. Consider setting the status to archived instead.`
                    : 'This also removes any cancelled or rejected sign-ups. This action cannot be undone.',
            okText: 'Delete activity',
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

    const rows = useMemo(() => data?.data ?? [], [data]);
    const total = data?.total ?? 0;
    const currentPage = data?.current_page ?? page;
    const pageSize = data?.per_page ?? perPage;
    const isFiltered = Boolean(search) || Boolean(status);
    const isFirstRowOfPage = rows.length > 0;
    const firstRowNumber = isFirstRowOfPage ? (currentPage - 1) * pageSize + 1 : 0;
    const lastRowNumber = firstRowNumber + rows.length - 1;

    // Small header cards. Counted from the rows on the current page only.
    const stats = [
        { key: 'total', label: isFiltered ? 'Matching activities' : 'Total activities', value: total, tone: 'text-stone-950' },
        { key: 'page', label: 'Shown on this page', value: rows.length, tone: 'text-stone-950' },
        { key: 'featured', label: 'Featured on this page', value: rows.filter((row) => row.is_featured).length, tone: 'text-amber-600' },
    ];

    return (
        <>
            <Head title="Events & Activities" />

            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-700 uppercase">Staff Workspace</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">Events & Activities</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                            Browse every scheduled event and activity. Drafts stay hidden from the public site until they are published.
                        </p>
                    </div>

                    <Button size="large" type="primary" icon={<Plus size={16} />} onClick={handleCreate} className="w-full sm:w-auto">
                        New event/activity
                    </Button>
                </header>

                <section aria-label="Activity overview" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {stats.map((stat) => (
                        <div key={stat.key} className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                            <p className="text-xs font-medium text-stone-500">{stat.label}</p>
                            <p className={`mt-2 text-3xl leading-none font-semibold tabular-nums ${stat.tone}`}>
                                {isFetching && !data ? '—' : stat.value.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </section>

                <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600" />

                    <div className="p-4 sm:p-6">
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-stone-900">Activity directory</h2>
                                <p className="mt-1 text-sm text-stone-500">Search by title or slug, or filter the list by status.</p>
                            </div>

                            <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-2xl lg:items-end">
                                <div className="w-full lg:max-w-md">
                                    <label htmlFor="activity-search" className="mb-2 block text-xs font-medium text-stone-600">
                                        Find an activity
                                    </label>
                                    <Search
                                        id="activity-search"
                                        placeholder="Search by title or slug"
                                        size="large"
                                        autoComplete="off"
                                        allowClear
                                        enterButton={
                                            <>
                                                <SearchOutlined /> Search
                                            </>
                                        }
                                        value={searchInput}
                                        loading={isFetching}
                                        onChange={(event) => setSearchInput(event.target.value)}
                                        onSearch={setSearchInput}
                                        onClear={clearSearch}
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <span className="mb-2 block text-xs font-medium text-stone-600">Status</span>
                                    <Segmented
                                        block
                                        size="large"
                                        aria-label="Filter by status"
                                        value={status}
                                        onChange={handleStatusChange}
                                        options={STATUS_OPTIONS}
                                    />
                                </div>
                            </div>
                        </div>

                        {isError && (
                            <Alert
                                type="error"
                                showIcon
                                icon={<TriangleAlert size={18} />}
                                className="mb-4"
                                message="Activities could not be loaded"
                                description={error instanceof Error ? error.message : 'An error occurred. Please try again.'}
                                action={
                                    <Button size="small" icon={<RefreshCw size={14} />} loading={isFetching} onClick={handleRetry}>
                                        Retry
                                    </Button>
                                }
                            />
                        )}

                        <Table<Activity>
                            aria-label="Events and activities"
                            dataSource={rows}
                            loading={isFetching}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 1000 }}
                            tableLayout="fixed"
                            size="large"
                            rowClassName={() => 'hover:bg-stone-50'}
                            locale={{
                                emptyText: isFetching ? (
                                    <span className="py-2 text-sm text-stone-500">Loading activities...</span>
                                ) : isFiltered ? (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <div className="py-2">
                                                <p className="font-medium text-stone-700">No activities match these filters</p>
                                                <p className="mt-1 text-sm text-stone-500">
                                                    Try another keyword, or reset the filters to see everything.
                                                </p>
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
                                                <p className="font-medium text-stone-700">No activities yet</p>
                                                <p className="mt-1 text-sm text-stone-500">Activities created by an admin will appear here.</p>
                                            </div>
                                        }
                                    />
                                ),
                            }}
                            className="overflow-hidden rounded-xl border border-stone-200 [&_.ant-table-cell]:align-middle [&_.ant-table-thead>tr>th]:bg-stone-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:tracking-wide [&_.ant-table-thead>tr>th]:text-stone-600 [&_.ant-table-thead>tr>th]:uppercase"
                        >
                            <Column<Activity>
                                title="Activity"
                                dataIndex="title"
                                key="title"
                                width={300}
                                render={(title: string, row) => (
                                    <div className="min-w-0">
                                        <p className="text-sm leading-6 font-semibold break-words text-stone-900">{title || 'Untitled activity'}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <code className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{row.slug}</code>
                                            {row.is_featured && <Tag color="gold">Featured</Tag>}
                                        </div>
                                    </div>
                                )}
                            />

                            <Column<Activity>
                                title="Category"
                                dataIndex={['category', 'name']}
                                key="category"
                                width={180}
                                render={(_: string | undefined, row) =>
                                    row.category?.name ? (
                                        <span className="text-sm text-stone-700">{row.category.name}</span>
                                    ) : (
                                        <span className="text-sm text-stone-400">Uncategorised</span>
                                    )
                                }
                            />

                            <Column<Activity>
                                title="Schedule"
                                dataIndex="starts_at"
                                key="schedule"
                                width={240}
                                render={(_: string, row) => (
                                    <div className="flex items-start gap-2 text-sm text-stone-700">
                                        <CalendarDays size={15} className="mt-0.5 shrink-0 text-stone-400" />
                                        <div className="min-w-0">
                                            <p className="whitespace-nowrap">{formatDate(row.starts_at, true) ?? '—'}</p>
                                            <p className="mt-0.5 text-xs whitespace-nowrap text-stone-400">
                                                Ends {formatDate(row.ends_at, true) ?? '—'}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            />

                            <Column<Activity>
                                title="Venue"
                                dataIndex="venue_name"
                                key="venue_name"
                                width={220}
                                ellipsis={{ showTitle: false }}
                                render={(venueName: string, row) => (
                                    <Tooltip title={row.venue_address || venueName || undefined}>
                                        <div className="flex min-w-0 items-start gap-2 text-sm text-stone-600">
                                            <MapPin size={15} className="mt-0.5 shrink-0 text-stone-400" />
                                            <span className="truncate">{venueName || <span className="text-stone-400">No venue</span>}</span>
                                        </div>
                                    </Tooltip>
                                )}
                            />

                            <Column<Activity>
                                title="Capacity"
                                dataIndex="capacity"
                                key="capacity"
                                width={130}
                                render={(capacity: number | null, row) => (
                                    <div className="flex items-center gap-2 text-sm text-stone-600">
                                        <Users size={15} className="shrink-0 text-stone-400" />
                                        <span className="tabular-nums">{capacity ?? 'Unlimited'}</span>
                                        {row.requires_registration && <Tag>Register</Tag>}
                                    </div>
                                )}
                            />

                            <Column<Activity>
                                title="Status"
                                dataIndex="status"
                                key="status"
                                width={120}
                                render={(rowStatus: ActivityStatus) => <Tag color={STATUS_TAG[rowStatus] ?? 'default'}>{rowStatus}</Tag>}
                            />

                            <Column<Activity>
                                title="Updated"
                                dataIndex="updated_at"
                                key="updated_at"
                                width={130}
                                render={(value: string | null) => (
                                    <span className="text-sm whitespace-nowrap text-stone-500">{formatDate(value) ?? '—'}</span>
                                )}
                            />

                            <Column<Activity>
                                title="Sign-ups"
                                dataIndex="approved_registrations_count"
                                key="signups"
                                width={170}
                                render={(_: number | undefined, row) => {
                                    const pending = row.pending_registrations_count ?? 0;
                                    const reserved = row.approved_registrations_count ?? 0;

                                    // The whole cell is a link into the participant list for this activity.
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => handleViewParticipants(row)}
                                            aria-label={`Manage sign-ups for ${row.title}`}
                                            className="inline-flex items-center gap-2 rounded-md text-sm text-stone-600 tabular-nums hover:text-emerald-700 hover:underline"
                                        >
                                            {reserved}
                                            {(row.registrations_count ?? 0) > reserved && (
                                                <span className="text-xs text-stone-400">/ {row.registrations_count}</span>
                                            )}
                                            {pending > 0 && <Tag color="gold">{pending} to review</Tag>}
                                        </button>
                                    );
                                }}
                            />

                            <Column<Activity>
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
                                                            label: 'Attendance & Check-in',
                                                            key: `staff.events-activities.attendance.${row.id}`,
                                                            icon: <QrCode size={15} />,
                                                            onClick: () => router.visit(`/staff/events-activities/${row.id}/attendance`),
                                                        },
                                                        {
                                                            label: row.pending_registrations_count
                                                                ? `Manage sign-ups (${row.pending_registrations_count} to review)`
                                                                : 'Manage sign-ups',
                                                            key: `staff.events-activities.participants.${row.id}`,
                                                            icon: <Users size={15} />,
                                                            onClick: () => handleViewParticipants(row),
                                                        },
                                                        {
                                                            label: 'Edit',
                                                            key: `staff.events-activities.edit.${row.id}`,
                                                            icon: <Pencil size={15} />,
                                                            onClick: () => handleEdit(row),
                                                        },
                                                        {
                                                            label: 'Copy slug',
                                                            key: `staff.events-activities.copy-slug.${row.id}`,
                                                            icon: <Copy size={15} />,
                                                            disabled: !row.slug,
                                                            onClick: () => handleCopySlug(row),
                                                        },
                                                        { type: 'divider' },
                                                        {
                                                            label: 'Delete',
                                                            key: `staff.events-activities.delete.${row.id}`,
                                                            danger: true,
                                                            icon: deletingId === row.id ? <RefreshCw size={15} /> : <Trash2 size={15} />,
                                                            onClick: () => confirmDelete(row),
                                                        },
                                                    ],
                                                } as MenuProps
                                            }
                                        >
                                            <Tooltip title={`Actions for ${row.title}`}>
                                                <Button
                                                    type="text"
                                                    size="small"
                                                    aria-label={`Actions for ${row.title}`}
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
                                {total > 0 ? `Showing ${firstRowNumber}–${lastRowNumber} of ${total} activities` : 'No activities to show yet.'}
                            </p>

                            <Pagination
                                onChange={(nextPage, nextPerPage) => {
                                    setPage(nextPage);
                                    setPerPage(nextPerPage);
                                }}
                                current={currentPage}
                                pageSize={pageSize}
                                showSizeChanger
                                pageSizeOptions={[10, 20, 50]}
                                responsive
                                total={total}
                                hideOnSinglePage={false}
                                showTotal={(value, range) => `${range[0]}–${range[1]} of ${value} activities`}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
};

StaffEventsActivitiesPage.layout = (page: ReactNode) => (
    <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</StaffAuthLayout>
);

export default StaffEventsActivitiesPage;
