import AttendanceConfirmationCard, {
  ConfirmationData,
} from '@/components/events-activities/staff/partials/attendance-confirmation-card';
import AttendanceHistoryTable, {
  AttendeeRecord,
} from '@/components/events-activities/staff/partials/attendance-history-table';
import AttendanceStatsBar, {
  AttendanceSummary,
} from '@/components/events-activities/staff/partials/attendance-stats-bar';
import ManualCodeEntry from '@/components/events-activities/staff/partials/manual-code-entry';
import QrScanner from '@/components/events-activities/staff/partials/qr-scanner';
import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useQuery } from '@tanstack/react-query';
import { App, Button, Segmented, Space, Tag } from 'antd';
import axios from 'axios';
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Keyboard,
  MapPin,
  RefreshCw,
  Users,
} from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';

type ActivityProps = {
  id: number;
  title: string;
  slug: string;
  status: string;
  starts_at?: string | null;
  ends_at?: string | null;
  venue_name: string;
  venue_address?: string | null;
  capacity?: number | null;
  category_name?: string;
};

type Props = {
  activity: ActivityProps;
  initialSummary: AttendanceSummary;
};

const StaffActivityAttendancePage = ({ activity, initialSummary }: Props) => {
  const { notification } = App.useApp();

  const [inputMode, setInputMode] = useState<'qr' | 'manual'>('qr');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [confirmation, setConfirmation] = useState<ConfirmationData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Table filters
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  // Fetch real-time attendance log and summary with TanStack Query
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['staff-activity-attendance', activity.id, searchQuery, methodFilter],
    queryFn: async () => {
      const response = await axios.get(
        `/staff/events-activities/${activity.id}/attendance/data`,
        {
          params: {
            search: searchQuery,
            method: methodFilter,
          },
        }
      );
      return response.data;
    },
    initialData: {
      summary: initialSummary,
      attendances: { data: [], total: 0 },
    },
    refetchInterval: 12000, // Background poll every 12 seconds for multi-device check-in desks
  });

  const summary = data?.summary ?? initialSummary;
  const attendees: AttendeeRecord[] = data?.attendances?.data ?? [];
  const totalAttendees: number = data?.attendances?.total ?? 0;

  // Handle Recording Attendance (Shared for both QR scan & Manual entry)
  const handleRecordAttendance = async (code: string, remarks?: string, methodOverride?: 'qr' | 'manual') => {
    if (submitting) return;

    setSubmitting(true);
    setErrorMessage(null);

    const method = methodOverride || inputMode;

    try {
      const response = await axios.post(
        `/staff/events-activities/${activity.id}/attendance`,
        {
          reference_code: code,
          method: method,
          remarks: remarks,
        }
      );

      if (response.data.success) {
        setConfirmation(response.data.data);
        refetch();
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.errors?.duplicate?.[0] ||
        err.response?.data?.errors?.reference_code?.[0] ||
        err.response?.data?.errors?.activity?.[0] ||
        err.response?.data?.message ||
        'Unable to record attendance. Please check the code and try again.';

      setErrorMessage(msg);
      setConfirmation(null);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Removal of an attendance record with reason
  const handleRemoveAttendance = async (attendanceId: number, reason: string) => {
    await axios.delete(
      `/staff/events-activities/${activity.id}/attendance/${attendanceId}`,
      {
        data: { reason },
      }
    );
    refetch();
  };

  const formatSchedule = (startsAt?: string | null, endsAt?: string | null) => {
    if (!startsAt) return '—';
    try {
      const start = new Date(startsAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Manila',
      });
      const end = endsAt
        ? new Date(endsAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
            timeZone: 'Asia/Manila',
          })
        : '';
      return `${start} - ${end}`;
    } catch {
      return startsAt;
    }
  };

  return (
    <>
      <Head title={`Attendance: ${activity.title}`} />

      <div className="space-y-6">
        {/* Top Header & Navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/staff/events-activities"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              title="Back to Activities"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  {activity.category_name || 'Event'} Attendance
                </span>
                <Tag color={activity.status === 'published' ? 'green' : 'default'} className="uppercase text-[10px]">
                  {activity.status}
                </Tag>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                {activity.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/staff/events-activities/${activity.id}/participants`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Users className="h-4 w-4 text-slate-500" />
              <span>Manage Sign-ups</span>
            </Link>

            <Button
              icon={<RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />}
              onClick={() => refetch()}
              className="text-xs"
            >
              Sync
            </Button>
          </div>
        </div>

        {/* Activity Quick Info Bar */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 rounded-xl bg-slate-100/70 px-4 py-2.5 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-emerald-700" />
            <span>{formatSchedule(activity.starts_at, activity.ends_at)}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-emerald-700" />
            <span>{activity.venue_name}</span>
          </span>
          {activity.capacity && (
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-700" />
              <span>Capacity: {activity.capacity} seats</span>
            </span>
          )}
        </div>

        {/* Live Metrics Bar */}
        <AttendanceStatsBar summary={summary} />

        {/* Main Attendance Check-in Station */}
        <div className="grid gap-6 lg:grid-cols-[1.05fr_1fr]">
          {/* Left Column: Check-in Workstation */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Check-in Terminal
                  </h2>
                  <p className="text-xs text-slate-500">
                    Scan youth QR event pass or enter reference code
                  </p>
                </div>

                <Segmented
                  value={inputMode}
                  onChange={(val) => setInputMode(val as 'qr' | 'manual')}
                  options={[
                    {
                      label: (
                        <div className="flex items-center gap-1.5 px-1 py-0.5">
                          <Camera className="h-3.5 w-3.5" />
                          <span>QR Scanner</span>
                        </div>
                      ),
                      value: 'qr',
                    },
                    {
                      label: (
                        <div className="flex items-center gap-1.5 px-1 py-0.5">
                          <Keyboard className="h-3.5 w-3.5" />
                          <span>Manual Code</span>
                        </div>
                      ),
                      value: 'manual',
                    },
                  ]}
                />
              </div>

              {/* Feedback Confirmation / Error Notification */}
              <div className="mb-4">
                <AttendanceConfirmationCard
                  data={confirmation}
                  error={errorMessage}
                  onClear={() => {
                    setConfirmation(null);
                    setErrorMessage(null);
                  }}
                />
              </div>

              {/* Check-in Input Modes */}
              {inputMode === 'qr' ? (
                <QrScanner
                  disabled={submitting}
                  onScan={(code) => handleRecordAttendance(code, undefined, 'qr')}
                />
              ) : (
                <ManualCodeEntry
                  loading={submitting}
                  onSubmit={(code, remarks) => handleRecordAttendance(code, remarks, 'manual')}
                />
              )}
            </div>
          </div>

          {/* Right Column: Real-time Attendee Log */}
          <div>
            <AttendanceHistoryTable
              attendees={attendees}
              total={totalAttendees}
              loading={isFetching}
              onRefresh={() => refetch()}
              onSearchChange={(q) => setSearchQuery(q)}
              onMethodChange={(m) => setMethodFilter(m)}
              onRemove={handleRemoveAttendance}
            />
          </div>
        </div>
      </div>
    </>
  );
};

StaffActivityAttendancePage.layout = (page: ReactNode) => (
  <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>
    {page}
  </StaffAuthLayout>
);

export default StaffActivityAttendancePage;
