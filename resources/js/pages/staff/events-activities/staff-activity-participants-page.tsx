import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData } from '@/types';
import { Activity } from '@/types/activity';
import { ActivityParticipant, ActivityParticipantSummary, ParticipantStatusFilter } from '@/types/activity-participant';
import { ArrowLeftOutlined, CheckOutlined, CloseCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { Alert, App, Button, Empty, Input, Modal, Segmented, Table, Tag, Tooltip } from 'antd';
import axios from 'axios';
import { CalendarDays, MapPin, QrCode, RefreshCw, SearchX, TriangleAlert, UserCheck, UserX } from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';

const { Column } = Table;

/**
 * Props come from the controller as Inertia props, so the header details are on first
 * paint. The sign-up list itself is fetched with TanStack Query because it changes
 * every time staff approve or reject someone.
 */
type Props = {
    activity: Pick<Activity, 'id' | 'title' | 'starts_at' | 'ends_at' | 'venue_name' | 'venue_address' | 'capacity' | 'requires_approval'>;
};

type ParticipantsResponse = {
    success: boolean;
    activity: ActivityParticipantSummary;
    participants: ActivityParticipant[];
};

/** Antd Tag colour per sign-up status. */
const PARTICIPANT_TAG: Record<ActivityParticipant['status'], string> = {
    pending: 'gold',
    approved: 'green',
    rejected: 'red',
    cancelled: 'default',
};

const STATUS_OPTIONS: { label: string; value: ParticipantStatusFilter }[] = [
    { label: 'All', value: '' },
    { label: 'Needs review', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Cancelled', value: 'cancelled' },
];

const LIST_PATH = '/staff/events-activities';

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

const formatDateTime = (value?: string | null) => {
    if (!value) return '—';

    const parsed = new Date(value);

    return Number.isNaN(parsed.getTime()) ? '—' : dateTimeFormatter.format(parsed);
};

/** Pull a readable message out of whatever the server returned. */
const messageFrom = (err: unknown, fallback: string) =>
    axios.isAxiosError(err) ? (err.response?.data?.message ?? err.message ?? fallback) : fallback;

const StaffActivityParticipantsPage = ({ activity }: Props) => {
    const { notification, modal } = App.useApp();

    const [status, setStatus] = useState<ParticipantStatusFilter>('');
    const [pendingId, setPendingId] = useState<number | null>(null);

    // Rejecting needs a reason, so it asks for one first.
    const [rejecting, setRejecting] = useState<ActivityParticipant>();
    const [reason, setReason] = useState('');
    const [reasonError, setReasonError] = useState<string | null>(null);
    const [savingReject, setSavingReject] = useState(false);

    const { data, isFetching, isError, error, refetch } = useQuery({
        queryKey: ['staff-event-participants', activity.id, status],
        queryFn: async () => {
            // /list keeps this distinct from the page route of the same name.
            const response = await axios.get<ParticipantsResponse>(`/staff/events-activities/${activity.id}/participants/list`, {
                params: { status },
            });

            return response.data;
        },
    });

    const participants = data?.participants ?? [];
    const summary = data?.activity;
    const isFull = summary?.capacity !== null && summary?.capacity !== undefined && (summary?.reserved_count ?? 0) >= summary.capacity;

    const approve = async (participant: ActivityParticipant) => {
        setPendingId(participant.id);

        try {
            await axios.patch(`/staff/events-activities/${activity.id}/participants/${participant.id}`, { status: 'approved' });

            notification.success({
                message: 'Sign-up approved',
                description: `${participant.full_name} is confirmed for this activity.`,
                placement: 'topRight',
            });

            await refetch();
        } catch (err) {
            notification.error({
                message: 'Could not approve the sign-up',
                description: messageFrom(err, 'Something went wrong. Please try again.'),
                placement: 'topRight',
            });
        } finally {
            setPendingId(null);
        }
    };

    const confirmApprove = (participant: ActivityParticipant) => {
        modal.confirm({
            title: `Approve ${participant.full_name}?`,
            icon: <QuestionCircleOutlined />,
            content: isFull
                ? 'This activity is already at capacity. Approving will fail until a slot is freed or the capacity is raised.'
                : 'They will be counted as a confirmed participant and the slot will be reserved for them.',
            okText: 'Approve sign-up',
            okButtonProps: { icon: <CheckOutlined /> },
            cancelText: 'Not yet',
            cancelButtonProps: { icon: <CloseCircleOutlined /> },
            onOk: () => approve(participant),
        });
    };

    const openReject = (participant: ActivityParticipant) => {
        setRejecting(participant);
        setReason('');
        setReasonError(null);
    };

    const closeReject = () => {
        if (savingReject) return;

        setRejecting(undefined);
        setReason('');
        setReasonError(null);
    };

    const submitReject = async () => {
        if (!rejecting) return;

        // The server requires a reason, so check it here to save a round trip.
        if (reason.trim().length < 5) {
            setReasonError('Give a short reason so the youth knows what to do next.');

            return;
        }

        setSavingReject(true);

        try {
            await axios.patch(`/staff/events-activities/${activity.id}/participants/${rejecting.id}`, {
                status: 'rejected',
                rejection_reason: reason.trim(),
            });

            notification.success({
                message: 'Sign-up rejected',
                description: `${rejecting.full_name} has been notified on their profile.`,
                placement: 'topRight',
            });

            setRejecting(undefined);
            setReason('');
            setReasonError(null);

            await refetch();
        } catch (err) {
            notification.error({
                message: 'Could not reject the sign-up',
                description: messageFrom(err, 'Something went wrong. Please try again.'),
                placement: 'topRight',
            });
        } finally {
            setSavingReject(false);
        }
    };

    const clearStatus = () => setStatus('');

    return (
        <>
            <Head title={`Sign-ups · ${activity.title}`} />

            <div className="mx-auto flex max-w-6xl flex-col gap-5">
                <div className="flex items-center justify-between">
                    <Link href={LIST_PATH} className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-950">
                        <ArrowLeftOutlined />
                        Back to events &amp; activities
                    </Link>

                    <Link
                        href={`/staff/events-activities/${activity.id}/attendance`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
                    >
                        <QrCode size={14} />
                        <span>Open Attendance Check-in</span>
                    </Link>
                </div>

                <header>
                    <p className="text-[11px] font-semibold tracking-[0.14em] text-emerald-700 uppercase">Staff Workspace</p>
                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">{activity.title}</h1>

                    <p className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-stone-500">
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={14} className="text-stone-400" aria-hidden="true" />
                            {formatDateTime(activity.starts_at)}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} className="text-stone-400" aria-hidden="true" />
                            {activity.venue_name}
                        </span>
                    </p>
                </header>

                {/* Capacity summary. Recomputed by the server on every approve/reject. */}
                <section aria-label="Sign-up summary" className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-xs font-medium text-stone-500">Slots taken</p>
                        <p className="mt-2 text-3xl leading-none font-semibold text-stone-950 tabular-nums">
                            {summary ? `${summary.reserved_count}${activity.capacity !== null ? ` / ${activity.capacity}` : ''}` : '—'}
                        </p>
                        <p className="mt-2 text-xs text-stone-400">
                            {activity.capacity === null ? 'No participant limit' : 'Pending and approved sign-ups'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-xs font-medium text-stone-500">Needs review</p>
                        <p className="mt-2 text-3xl leading-none font-semibold text-amber-600 tabular-nums">
                            {participants.filter((participant) => participant.status === 'pending').length || '—'}
                        </p>
                        <p className="mt-2 text-xs text-stone-400">
                            {activity.requires_approval ? 'This activity requires approval' : 'Approval is optional here'}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                        <p className="text-xs font-medium text-stone-500">Slots left</p>
                        <p className="mt-2 text-3xl leading-none font-semibold text-stone-950 tabular-nums">
                            {summary ? (summary.slots_left === null ? '∞' : summary.slots_left) : '—'}
                        </p>
                        <p className="mt-2 text-xs text-stone-400">{isFull ? 'This activity is full' : 'Available to approve'}</p>
                    </div>
                </section>

                {isFull && (
                    <Alert
                        type="warning"
                        showIcon
                        icon={<TriangleAlert size={18} />}
                        message="This activity is at capacity"
                        description="New sign-ups will be held as pending. Raise the capacity on the edit screen if more youth should be accepted."
                    />
                )}

                <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                    <div className="h-1.5 bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-600" />

                    <div className="p-4 sm:p-6">
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <h2 className="text-base font-semibold text-stone-900">Youth who want to join</h2>
                                <p className="mt-1 text-sm text-stone-500">Approve or reject each sign-up. Decisions are shown to the youth.</p>
                            </div>

                            <Segmented
                                size="large"
                                aria-label="Filter sign-ups by status"
                                value={status}
                                onChange={(value) => setStatus(value as ParticipantStatusFilter)}
                                options={STATUS_OPTIONS}
                            />
                        </div>

                        {isError && (
                            <Alert
                                type="error"
                                showIcon
                                icon={<TriangleAlert size={18} />}
                                className="mb-4"
                                message="Sign-ups could not be loaded"
                                description={error instanceof Error ? error.message : 'An error occurred. Please try again.'}
                                action={
                                    <Button size="small" icon={<RefreshCw size={14} />} loading={isFetching} onClick={() => refetch()}>
                                        Retry
                                    </Button>
                                }
                            />
                        )}

                        <Table<ActivityParticipant>
                            aria-label="Youth sign-ups"
                            dataSource={participants}
                            loading={isFetching}
                            rowKey="id"
                            pagination={false}
                            scroll={{ x: 900 }}
                            tableLayout="fixed"
                            size="large"
                            rowClassName={() => 'hover:bg-stone-50'}
                            locale={{
                                emptyText: isFetching ? (
                                    <span className="py-2 text-sm text-stone-500">Loading sign-ups...</span>
                                ) : status ? (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <div className="py-2">
                                                <p className="font-medium text-stone-700">No sign-ups with this status</p>
                                                <p className="mt-1 text-sm text-stone-500">Try another filter to see the rest.</p>
                                                <Button className="mt-4" icon={<SearchX size={15} />} onClick={clearStatus}>
                                                    Show all sign-ups
                                                </Button>
                                            </div>
                                        }
                                    />
                                ) : (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={
                                            <div className="py-2">
                                                <p className="font-medium text-stone-700">Nobody has signed up yet</p>
                                                <p className="mt-1 text-sm text-stone-500">
                                                    Youth who join this activity will appear here for approval.
                                                </p>
                                            </div>
                                        }
                                    />
                                ),
                            }}
                            className="overflow-hidden rounded-xl border border-stone-200 [&_.ant-table-cell]:align-middle [&_.ant-table-thead>tr>th]:bg-stone-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:tracking-wide [&_.ant-table-thead>tr>th]:text-stone-600 [&_.ant-table-thead>tr>th]:uppercase"
                        >
                            <Column<ActivityParticipant>
                                title="Youth"
                                dataIndex="full_name"
                                key="full_name"
                                width={260}
                                render={(fullName: string, row) => (
                                    <div className="flex min-w-0 items-center gap-3">
                                        <span
                                            aria-hidden="true"
                                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-stone-100 text-xs font-semibold text-stone-600"
                                        >
                                            {fullName.slice(0, 2).toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-sm leading-6 font-semibold break-words text-stone-900">{fullName}</p>
                                            <p className="mt-0.5 truncate text-xs text-stone-400">{row.email ?? 'No email on file'}</p>
                                        </div>
                                    </div>
                                )}
                            />

                            <Column<ActivityParticipant>
                                title="Contact"
                                dataIndex="mobile_number"
                                key="contact"
                                width={160}
                                render={(mobile: string | null) => (
                                    <span className="text-sm text-stone-600">{mobile ?? <span className="text-stone-400">—</span>}</span>
                                )}
                            />

                            <Column<ActivityParticipant>
                                title="Barangay"
                                dataIndex="barangay"
                                key="barangay"
                                width={140}
                                render={(barangay: string | null) => (
                                    <span className="text-sm text-stone-600">{barangay ?? <span className="text-stone-400">—</span>}</span>
                                )}
                            />

                            <Column<ActivityParticipant>
                                title="Registered"
                                dataIndex="registered_at"
                                key="registered_at"
                                width={170}
                                render={(value: string | null) => (
                                    <span className="text-sm whitespace-nowrap text-stone-600">{formatDateTime(value)}</span>
                                )}
                            />

                            <Column<ActivityParticipant>
                                title="Status"
                                dataIndex="status"
                                key="status"
                                width={130}
                                render={(rowStatus: ActivityParticipant['status'], row) => (
                                    <div className="flex flex-col items-start gap-1">
                                        <Tag color={PARTICIPANT_TAG[rowStatus]}>{rowStatus}</Tag>
                                        {row.has_attended && (
                                            <Tag color="cyan" className="font-semibold text-[10px] uppercase">Attended</Tag>
                                        )}
                                        {row.rejection_reason && (
                                            <Tooltip title={row.rejection_reason}>
                                                <span className="max-w-28 truncate text-xs text-stone-400">{row.rejection_reason}</span>
                                            </Tooltip>
                                        )}
                                    </div>
                                )}
                            />

                            <Column<ActivityParticipant>
                                title="Action"
                                key="action"
                                width={190}
                                fixed="right"
                                render={(_, row) =>
                                    row.status === 'pending' ? (
                                        <div className="flex items-center gap-2">
                                            <Button
                                                size="small"
                                                type="primary"
                                                icon={<UserCheck size={14} />}
                                                loading={pendingId === row.id}
                                                onClick={() => confirmApprove(row)}
                                            >
                                                Approve
                                            </Button>
                                            <Button size="small" danger icon={<UserX size={14} />} onClick={() => openReject(row)}>
                                                Reject
                                            </Button>
                                        </div>
                                    ) : row.status === 'approved' ? (
                                        <Tooltip title="Withdraw this sign-up and release the slot">
                                            <Button size="small" loading={pendingId === row.id} onClick={() => openReject(row)}>
                                                Withdraw
                                            </Button>
                                        </Tooltip>
                                    ) : (
                                        <span className="text-xs text-stone-400">Reviewed</span>
                                    )
                                }
                            />
                        </Table>
                    </div>
                </section>
            </div>

            {/* Reject / withdraw. A reason is required so the youth sees something useful. */}
            <Modal
                open={!!rejecting}
                width={520}
                centered
                title={rejecting?.status === 'approved' ? `Withdraw ${rejecting.full_name}?` : `Reject ${rejecting?.full_name}?`}
                okText={rejecting?.status === 'approved' ? 'Withdraw sign-up' : 'Reject sign-up'}
                cancelText="Cancel"
                onCancel={closeReject}
                okButtonProps={{ danger: true, loading: savingReject }}
                cancelButtonProps={{ disabled: savingReject }}
                maskClosable={!savingReject}
                closable={!savingReject}
                destroyOnHidden
                onOk={submitReject}
            >
                <div className="flex flex-col gap-3 pt-2">
                    <p className="text-sm leading-6 text-stone-600">
                        {rejecting?.status === 'approved'
                            ? 'This releases the reserved slot back to the activity. The youth will see that they are no longer confirmed.'
                            : 'The youth will see this reason on their activities page, so keep it clear and actionable.'}
                    </p>

                    <label className="block">
                        <span className="mb-1 block text-xs font-medium text-stone-600">Reason</span>
                        <Input.TextArea
                            rows={3}
                            value={reason}
                            maxLength={500}
                            showCount
                            status={reasonError ? 'error' : undefined}
                            onChange={(event) => {
                                setReason(event.target.value);
                                setReasonError(null);
                            }}
                            placeholder={
                                rejecting?.status === 'approved'
                                    ? 'e.g. The activity reached its participant limit.'
                                    : 'e.g. This activity is for ages 18 and above.'
                            }
                            disabled={savingReject}
                        />
                        {reasonError && <span className="mt-1 block text-xs text-red-600">{reasonError}</span>}
                    </label>
                </div>
            </Modal>
        </>
    );
};

StaffActivityParticipantsPage.layout = (page: ReactNode) => (
    <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</StaffAuthLayout>
);

export default StaffActivityParticipantsPage;
