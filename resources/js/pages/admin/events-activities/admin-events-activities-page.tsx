import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { PaginatedResponse, SharedData } from '@/types';
import { Activity, ActivityStatus } from '@/types/activity';
import { CheckOutlined, CloseCircleOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { Head, router } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { Alert, App, Button, Dropdown, Empty, Image, Input, MenuProps, Modal, Pagination, Segmented, Skeleton, Space, Table, Tag, Tooltip } from 'antd';
import axios from 'axios';
import { CalendarDays, Camera, Copy, MapPin, MoreHorizontal, Pencil, Plus, QrCode, RefreshCw, SearchX, ShieldCheck, Star, Trash2, TriangleAlert, Users } from 'lucide-react';
import { ReactElement, ReactNode, useEffect, useMemo, useState } from 'react';

type SkEvidenceSubmission = {
    id: number;
    description: string;
    photos: string[];
    created_at: string | null;
    sk_official: {
        id: number | null;
        full_name: string;
        reference_code?: string | null;
        sk_position: string;
        barangay: string;
        city: string;
        email?: string | null;
        mobile_number?: string | null;
    };
};

const { Column } = Table;
const { Search } = Input;

const SEARCH_DEBOUNCE_MS = 350;

type StatusFilter = '' | ActivityStatus;

const STATUS_OPTIONS: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Cancelled', value: 'cancelled' },
    { label: 'Archived', value: 'archived' },
];

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

const formatDate = (value?: string | null, withTime = false) => {
    if (!value) return null;

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) return null;

    return withTime ? dateTimeFormatter.format(parsed) : dateFormatter.format(parsed);
};

const AdminEventsActivitiesPage = () => {
    const { notification, modal } = App.useApp();

    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState<StatusFilter>('');

    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingFeaturedId, setTogglingFeaturedId] = useState<number | null>(null);
    const [evidenceActivity, setEvidenceActivity] = useState<Activity | null>(null);
    const [evidenceList, setEvidenceList] = useState<SkEvidenceSubmission[]>([]);
    const [evidenceLoading, setEvidenceLoading] = useState(false);

    const handleViewSkEvidence = async (row: Activity) => {
        setEvidenceActivity(row);
        setEvidenceList([]);
        setEvidenceLoading(true);

        try {
            const response = await axios.get<{
                success: boolean;
                evidences: SkEvidenceSubmission[];
            }>(`/admin/events-activities/${row.id}/sk-evidences`);

            if (response.data?.success) {
                setEvidenceList(response.data.evidences ?? []);
            }
        } catch {
            notification.error({
                message: 'Could not load SK event evidence',
                description: 'Please try again.',
                placement: 'topRight',
            });
        } finally {
            setEvidenceLoading(false);
        }
    };

    const { data, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['admin-events-activities', perPage, page, search, status],
        queryFn: async () => {
            const response = await axios.get<PaginatedResponse<Activity>>('/admin/events-activities/data', {
                params: { perpage: perPage, page, search, status },
            });

            return response.data;
        },
    });

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

    const handleCreate = () => router.visit('/admin/events-activities/create');
    const handleEdit = (row: Activity) => router.visit(`/admin/events-activities/${row.id}/edit`);
    const handleViewParticipants = (row: Activity) => router.visit(`/admin/events-activities/${row.id}/participants`);
    const handleViewAttendance = (row: Activity) => router.visit(`/admin/events-activities/${row.id}/attendance`);

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

    const handleToggleFeatured = async (row: Activity) => {
        setTogglingFeaturedId(row.id);

        try {
            const response = await axios.post(`/admin/events-activities/${row.id}/toggle-featured`);

            if (!response.data?.success) {
                throw new Error(response.data?.message ?? 'Failed to update featured status.');
            }

            notification.success({
                message: 'Featured status updated',
                description: response.data?.message,
                placement: 'topRight',
            });

            refetch();
        } catch (err) {
            const description = axios.isAxiosError(err)
                ? (err.response?.data?.message ?? err.message)
                : 'Could not update featured status.';

            notification.error({
                message: 'Could not update featured status',
                description,
                placement: 'topRight',
            });
        } finally {
            setTogglingFeaturedId(null);
        }
    };

    const handleDelete = async (row: Activity) => {
        setDeletingId(row.id);

        try {
            const response = await axios.delete(`/admin/events-activities/${row.id}`);

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

    const stats = [
        { key: 'total', label: isFiltered ? 'Matching activities' : 'Total activities', value: total, tone: 'text-stone-950' },
        {
            key: 'attended',
            label: 'Checked-in on this page',
            value: rows.reduce((sum, row) => sum + (row.attendances_count ?? 0), 0),
            tone: 'text-emerald-700',
        },
        { key: 'featured', label: 'Featured on this page', value: rows.filter((row) => row.is_featured).length, tone: 'text-amber-600' },
    ];

    return (
        <>
            <Head title="Events & Activities" />

            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <header className="flex flex-wrap items-end justify-between gap-4">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold tracking-[0.14em] text-amber-700 uppercase">Admin Workspace</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">Events &amp; Activities</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                            Manage municipal youth events, review participant sign-ups, inspect SK photo evidence, and operate QR/manual attendance check-in.
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
                    <div className="h-1.5 bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-600" />

                    <div className="p-4 sm:p-6">
                        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-stone-900">Activity directory</h2>
                                <p className="mt-1 text-sm text-stone-500">Search by title or slug, filter by status, or open Attendance Check-in directly.</p>
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
                            scroll={{ x: 1160 }}
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
                                                <p className="mt-1 text-sm text-stone-500">Click "New event/activity" above to schedule one.</p>
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
                                width={280}
                                render={(title: string, row) => (
                                    <div className="min-w-0">
                                        <p className="text-sm leading-6 font-semibold break-words text-stone-900">{title || 'Untitled activity'}</p>
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            <code className="rounded-md bg-stone-100 px-2 py-0.5 text-xs text-stone-600">{row.slug}</code>
                                            {row.is_featured && (
                                                <Tag color="gold" className="inline-flex items-center gap-1 font-semibold">
                                                    <Star size={11} className="fill-amber-500 text-amber-500" /> Featured
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                )}
                            />

                            <Column<Activity>
                                title="Category"
                                dataIndex={['category', 'name']}
                                key="category"
                                width={160}
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
                                width={230}
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
                                width={200}
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
                                title="Status"
                                dataIndex="status"
                                key="status"
                                width={115}
                                render={(rowStatus: ActivityStatus) => <Tag color={STATUS_TAG[rowStatus] ?? 'default'}>{rowStatus}</Tag>}
                            />

                            <Column<Activity>
                                title="Sign-ups"
                                dataIndex="approved_registrations_count"
                                key="signups"
                                width={160}
                                render={(_: number | undefined, row) => {
                                    const pending = row.pending_registrations_count ?? 0;
                                    const reserved = row.approved_registrations_count ?? 0;

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
                                title="Attendance"
                                dataIndex="attendances_count"
                                key="attendance"
                                width={165}
                                render={(_: number | undefined, row) => {
                                    const count = row.attendances_count ?? 0;
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => handleViewAttendance(row)}
                                            aria-label={`Manage attendance for ${row.title}`}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
                                        >
                                            <QrCode size={13} className="text-emerald-700" />
                                            <span>{count} attended</span>
                                        </button>
                                    );
                                }}
                            />

                            <Column<Activity>
                                title="SK Evidence"
                                dataIndex="sk_evidences_count"
                                key="sk_evidences"
                                width={160}
                                render={(_: number | undefined, row) => {
                                    const count = row.sk_evidences_count ?? 0;
                                    return (
                                        <button
                                            type="button"
                                            onClick={() => handleViewSkEvidence(row)}
                                            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 px-2.5 py-1 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100"
                                        >
                                            <Camera size={13} className="text-indigo-700" />
                                            <span>{count} {count === 1 ? 'submission' : 'submissions'}</span>
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
                                                            key: `admin.events-activities.attendance.${row.id}`,
                                                            icon: <QrCode size={15} />,
                                                            onClick: () => handleViewAttendance(row),
                                                        },
                                                        {
                                                            label: row.pending_registrations_count
                                                                ? `Manage sign-ups (${row.pending_registrations_count} to review)`
                                                                : 'Manage sign-ups',
                                                            key: `admin.events-activities.participants.${row.id}`,
                                                            icon: <Users size={15} />,
                                                            onClick: () => handleViewParticipants(row),
                                                        },
                                                        {
                                                            label: `View SK Event Evidence (${row.sk_evidences_count ?? 0})`,
                                                            key: `admin.events-activities.sk-evidence.${row.id}`,
                                                            icon: <Camera size={15} />,
                                                            onClick: () => handleViewSkEvidence(row),
                                                        },
                                                        {
                                                            label: 'Edit',
                                                            key: `admin.events-activities.edit.${row.id}`,
                                                            icon: <Pencil size={15} />,
                                                            onClick: () => handleEdit(row),
                                                        },
                                                        {
                                                            label: row.is_featured ? 'Remove from Featured' : 'Set as Featured Event',
                                                            key: `admin.events-activities.feature.${row.id}`,
                                                            icon: <Star size={15} className={row.is_featured ? 'fill-amber-500 text-amber-500' : ''} />,
                                                            disabled: togglingFeaturedId === row.id,
                                                            onClick: () => handleToggleFeatured(row),
                                                        },
                                                        {
                                                            label: 'Copy slug',
                                                            key: `admin.events-activities.copy-slug.${row.id}`,
                                                            icon: <Copy size={15} />,
                                                            disabled: !row.slug,
                                                            onClick: () => handleCopySlug(row),
                                                        },
                                                        { type: 'divider' },
                                                        {
                                                            label: 'Delete',
                                                            key: `admin.events-activities.delete.${row.id}`,
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

            <Modal
                centered
                open={evidenceActivity !== null}
                onCancel={() => setEvidenceActivity(null)}
                footer={
                    <div className="flex justify-end">
                        <Button onClick={() => setEvidenceActivity(null)}>Close</Button>
                    </div>
                }
                title={
                    <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                            <Camera size={18} />
                        </span>
                        <div>
                            <p className="text-sm font-bold text-stone-900">
                                SK Event Pictures &amp; Evidence — {evidenceActivity?.title}
                            </p>
                            <p className="text-xs font-normal text-stone-500">
                                Photos and descriptions uploaded by Sangguniang Kabataan (SK) Officials
                            </p>
                        </div>
                    </div>
                }
                width={760}
                destroyOnHidden
            >
                <div className="max-h-[70vh] space-y-4 overflow-y-auto pt-3 pr-1">
                    {evidenceLoading ? (
                        <div className="space-y-3">
                            <Skeleton active paragraph={{ rows: 3 }} />
                            <Skeleton active paragraph={{ rows: 3 }} />
                        </div>
                    ) : evidenceList.length > 0 ? (
                        evidenceList.map((ev) => (
                            <div
                                key={ev.id}
                                className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-4"
                            >
                                <div className="flex flex-wrap items-start justify-between gap-2 border-b border-stone-200/80 pb-3">
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-bold text-stone-900">
                                                {ev.sk_official.full_name}
                                            </span>
                                            <Tag color="geekblue" className="m-0 text-xs font-semibold">
                                                <ShieldCheck className="mr-1 inline h-3 w-3" />
                                                {ev.sk_official.sk_position}
                                            </Tag>
                                            <Tag color="cyan" className="m-0 text-xs font-semibold">
                                                Brgy. {ev.sk_official.barangay}
                                            </Tag>
                                            {ev.sk_official.reference_code && (
                                                <span className="font-mono text-xs text-stone-500">
                                                    ({ev.sk_official.reference_code})
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-0.5 text-xs text-stone-500">
                                            {ev.sk_official.email}
                                            {ev.sk_official.mobile_number ? ` • ${ev.sk_official.mobile_number}` : ''}
                                        </p>
                                    </div>
                                    <span className="text-xs text-stone-400">
                                        {formatDate(ev.created_at, true) ?? '—'}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold tracking-wider text-stone-500 uppercase">
                                        Event Description / Narrative
                                    </p>
                                    <p className="mt-1 text-sm leading-relaxed whitespace-pre-line text-stone-800">
                                        {ev.description}
                                    </p>
                                </div>

                                {ev.photos.length > 0 && (
                                    <div>
                                        <p className="mb-2 text-xs font-semibold tracking-wider text-stone-500 uppercase">
                                            Uploaded Event Pictures ({ev.photos.length})
                                        </p>
                                        <Image.PreviewGroup>
                                            <div className="flex flex-wrap gap-2.5">
                                                {ev.photos.map((url, index) => (
                                                    <Image
                                                        key={index}
                                                        src={url}
                                                        alt={`SK Evidence Photo ${index + 1}`}
                                                        width={110}
                                                        height={110}
                                                        className="rounded-xl border border-stone-200 object-cover shadow-2xs"
                                                    />
                                                ))}
                                            </div>
                                        </Image.PreviewGroup>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="rounded-2xl border border-dashed border-stone-200 p-10 text-center">
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description={
                                    <div>
                                        <p className="font-semibold text-stone-700">No SK evidence uploaded yet</p>
                                        <p className="mt-1 text-xs text-stone-500">
                                            When SK Officials upload pictures and descriptions for this event, they will appear here.
                                        </p>
                                    </div>
                                }
                            />
                        </div>
                    )}
                </div>
            </Modal>
        </>
    );
};

AdminEventsActivitiesPage.layout = (page: ReactNode) => (
    <AdminAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</AdminAuthLayout>
);

export default AdminEventsActivitiesPage;
