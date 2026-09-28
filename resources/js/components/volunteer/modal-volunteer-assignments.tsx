import { Volunteer, VolunteerAssignment, VolunteerDetail, SelectableActivity } from '@/types/volunteer';
import { Alert, App, Button, Empty, Input, InputNumber, Modal, Select, Spin, Tooltip } from 'antd';
import axios from 'axios';
import { CalendarDays, ClipboardCheck, Clock, Info, Plus, Save, Trash2, TriangleAlert, UserRound } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

type Props = {
  volunteer?: Volunteer;
  onClose: () => void;
  refetch: () => void;
  /** Endpoint prefix, so the admin and staff panels share this modal. */
  basePath?: string;
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? '—' : dateTimeFormatter.format(parsed);
};

/** ISO string -> the "YYYY-MM-DDTHH:mm" shape a datetime-local input expects, in local time. */
const toLocalInput = (value?: string | null) => {
  if (!value) return '';

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return '';

  const offsetMs = parsed.getTimezoneOffset() * 60_000;

  return new Date(parsed.getTime() - offsetMs).toISOString().slice(0, 16);
};

const formatHours = (value: number | null) =>
  value === null ? '—' : `${value.toLocaleString('en-PH', { maximumFractionDigits: 2 })} hrs`;

const ModalVolunteerAssignments = ({ volunteer, onClose, refetch, basePath = '/admin/volunteers' }: Props) => {
  const { notification, modal } = App.useApp();

  const [detail, setDetail] = useState<VolunteerDetail>();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activityId, setActivityId] = useState<number | null>(null);
  const [role, setRole] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [timeIn, setTimeIn] = useState('');
  const [timeOut, setTimeOut] = useState('');
  const [hours, setHours] = useState<number | null>(null);
  const [method, setMethod] = useState<'manual' | 'qr'>('manual');
  const [remarks, setRemarks] = useState('');
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceErrors, setAttendanceErrors] = useState<Record<string, string[]>>({});

  const loadDetail = useCallback(async () => {
    if (!volunteer) return;

    setLoading(true);
    setLoadError(null);

    try {
      const res = await axios.get<VolunteerDetail>(`${basePath}/${volunteer.id}/assignments`);

      setDetail(res.data);
    } catch {
      setLoadError('We could not load this volunteer’s assignments.');
    } finally {
      setLoading(false);
    }
  }, [volunteer]);

  useEffect(() => {
    if (!volunteer) {
      setDetail(undefined);
      return;
    }

    setActivityId(null);
    setRole('');
    setEditingAssignmentId(null);
    setAttendanceErrors({});
    loadDetail();
  }, [volunteer, loadDetail]);

  const notifyError = (title: string, err: unknown) => {
    const description = axios.isAxiosError(err)
      ? (err.response?.data?.message ?? err.message ?? 'Something went wrong. Please try again.')
      : 'Something went wrong. Please try again.';

    notification.error({ message: title, description, placement: 'topRight' });
  };

  const handleAssign = async () => {
    if (!volunteer || !activityId) return;

    setAssigning(true);

    try {
      const res = await axios.post(`${basePath}/${volunteer.id}/assignments`, {
        activity_id: activityId,
        role: role.trim() || null,
        status: 'assigned',
      });

      notification.success({
        message: res.status === 201 ? 'Volunteer assigned' : 'Assignment updated',
        description: `${detail?.available_activities.find((a) => a.id === activityId)?.title ?? 'The activity'} is now on their record.`,
        placement: 'topRight',
      });

      setActivityId(null);
      setRole('');
      await loadDetail();
      refetch();
    } catch (err) {
      notifyError('Could not assign the activity', err);
    } finally {
      setAssigning(false);
    }
  };

  const openAttendance = (assignment: VolunteerAssignment) => {
    setEditingAssignmentId(assignment.id);
    setAttendanceErrors({});
    setTimeIn(toLocalInput(assignment.attendance?.time_in));
    setTimeOut(toLocalInput(assignment.attendance?.time_out));
    setHours(assignment.attendance?.hours_rendered ?? null);
    setMethod(assignment.attendance?.method ?? 'manual');
    setRemarks(assignment.attendance?.remarks ?? '');
  };

  const closeAttendance = () => {
    setEditingAssignmentId(null);
    setAttendanceErrors({});
  };

  /** Mirrors the server's derivation so the admin sees the credited hours before saving. */
  const derivedHours = useMemo(() => {
    if (hours !== null && hours !== undefined) return null;

    if (!timeIn || !timeOut) return null;

    const start = new Date(timeIn).getTime();
    const end = new Date(timeOut).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;

    return Math.round(((end - start) / 3_600_000) * 100) / 100;
  }, [hours, timeIn, timeOut]);

  const handleSaveAttendance = async (assignment: VolunteerAssignment) => {
    if (!volunteer) return;

    setSavingAttendance(true);
    setAttendanceErrors({});

    try {
      const res = await axios.post(`${basePath}/${volunteer.id}/attendance`, {
        volunteer_activity_id: assignment.id,
        time_in: timeIn || null,
        time_out: timeOut || null,
        hours_rendered: hours,
        method,
        remarks: remarks.trim() || null,
      });

      notification.success({
        message: 'Attendance recorded',
        description: `${assignment.activity_title ?? 'The activity'} now counts toward ${formatHours(
          res.data?.data?.attendance?.hours_rendered ?? null,
        )}.`,
        placement: 'topRight',
      });

      closeAttendance();
      await loadDetail();
      refetch();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setAttendanceErrors(err.response.data.errors ?? {});
      }

      notifyError('Could not record attendance', err);
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleRemoveAssignment = (assignment: VolunteerAssignment) => {
    if (!volunteer) return;

    modal.confirm({
      title: `Remove ${assignment.activity_title ?? 'this assignment'}?`,
      icon: <TriangleAlert size={16} />,
      content: 'The volunteer will no longer be listed for this activity.',
      okText: 'Remove assignment',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`${basePath}/${volunteer.id}/assignments/${assignment.id}`);

          notification.success({ message: 'Assignment removed', placement: 'topRight' });

          await loadDetail();
          refetch();
        } catch (err) {
          notifyError('Could not remove the assignment', err);
        }
      },
    });
  };

  const availableOptions: SelectableActivity[] = detail?.available_activities ?? [];
  const assignments = detail?.assignments ?? [];
  const assignedActivityIds = new Set(assignments.map((assignment) => assignment.activity_id));
  const options = availableOptions
    .filter((activity) => !assignedActivityIds.has(activity.id) || activity.id === activityId)
    .map((activity) => ({ label: activity.title, value: activity.id }));

  return (
    <Modal
      open={!!volunteer}
      width={820}
      centered
      title={
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
            <ClipboardCheck size={17} />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold text-stone-900">Assignments & attendance</span>
            <span className="mt-0.5 block text-xs font-normal text-stone-500">
              {volunteer?.full_name} · {formatHours(detail?.volunteer.total_hours ?? 0)} of service hours
            </span>
          </span>
        </div>
      }
      footer={
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      }
      onCancel={onClose}
      destroyOnHidden
    >
      <div className="flex flex-col gap-4 pt-2">
        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
          <p className="text-sm font-semibold text-stone-800">Assign to an activity</p>
          <p className="mt-1 text-xs text-stone-500">Volunteers can only be added to activities that exist in the program calendar.</p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Select
              className="flex-1"
              placeholder={options.length ? 'Choose an activity' : 'No activities available yet'}
              value={activityId}
              onChange={setActivityId}
              options={options}
              disabled={loading || !options.length}
              showSearch
              optionFilterProp="label"
              notFoundContent="Create an activity first."
            />
            <Input
              className="sm:w-48"
              placeholder="Role (optional)"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              maxLength={100}
              disabled={loading}
            />
            <Button
              type="primary"
              icon={<Plus size={15} />}
              loading={assigning}
              disabled={!activityId || !options.length}
              onClick={handleAssign}
            >
              Assign
            </Button>
          </div>
        </div>

        {loadError && (
          <Alert type="error" showIcon icon={<TriangleAlert size={18} />} message="Assignments could not be loaded" description={loadError} />
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : assignments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div className="py-2">
                <p className="font-medium text-stone-700">No assignments yet</p>
                <p className="mt-1 text-sm text-stone-500">Assign this volunteer to an activity to start tracking service hours.</p>
              </div>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {assignments.map((assignment) => {
              const isEditingThis = editingAssignmentId === assignment.id;
              const hoursValue = assignment.attendance?.hours_rendered ?? null;

              return (
                <li key={assignment.id} className="rounded-xl border border-stone-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-semibold text-stone-900">
                        <CalendarDays size={14} className="shrink-0 text-stone-400" aria-hidden="true" />
                        {assignment.activity_title ?? 'Unknown activity'}
                      </p>
                      <p className="mt-1 text-xs text-stone-500">
                        {assignment.activity_category ? `${assignment.activity_category} · ` : ''}
                        {formatDateTime(assignment.activity_starts_at)}
                        {assignment.role ? ` · ${assignment.role}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Tooltip title={hoursValue ? `${formatHours(hoursValue)} credited` : 'No hours recorded yet'}>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            hoursValue ? 'bg-teal-100 text-teal-800' : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          <Clock size={12} aria-hidden="true" />
                          {formatHours(hoursValue)}
                        </span>
                      </Tooltip>

                      <Button
                        size="small"
                        type={isEditingThis ? 'default' : 'primary'}
                        icon={isEditingThis ? <UserRound size={14} /> : <ClipboardCheck size={14} />}
                        onClick={() => (isEditingThis ? closeAttendance() : openAttendance(assignment))}
                      >
                        {isEditingThis ? 'Close' : hoursValue ? 'Edit hours' : 'Log hours'}
                      </Button>

                      <Tooltip title={hoursValue ? 'Remove the attendance record before unassigning' : 'Remove assignment'}>
                        <Button
                          size="small"
                          type="text"
                          danger
                          disabled={!!hoursValue}
                          aria-label={`Remove assignment for ${assignment.activity_title}`}
                          icon={<Trash2 size={14} />}
                          onClick={() => handleRemoveAssignment(assignment)}
                        />
                      </Tooltip>
                    </div>
                  </div>

                  {isEditingThis && (
                    <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50 p-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1 text-xs font-medium text-stone-600">
                          Time in
                          <Input
                            type="datetime-local"
                            value={timeIn}
                            onChange={(event) => setTimeIn(event.target.value)}
                            disabled={savingAttendance}
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-stone-600">
                          Time out
                          <Input
                            type="datetime-local"
                            value={timeOut}
                            onChange={(event) => setTimeOut(event.target.value)}
                            disabled={savingAttendance}
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-stone-600">
                          Hours credited
                          <InputNumber
                            className="w-full"
                            min={0}
                            max={24}
                            step={0.5}
                            precision={2}
                            placeholder="Auto from times"
                            value={hours}
                            onChange={(value) => setHours(typeof value === 'number' ? value : null)}
                            disabled={savingAttendance}
                          />
                        </label>

                        <label className="flex flex-col gap-1 text-xs font-medium text-stone-600">
                          Method
                          <Select
                            value={method}
                            onChange={setMethod}
                            disabled={savingAttendance}
                            options={[
                              { label: 'Manual entry', value: 'manual' },
                              { label: 'QR scan', value: 'qr' },
                            ]}
                          />
                        </label>
                      </div>

                      <label className="mt-3 flex flex-col gap-1 text-xs font-medium text-stone-600">
                        Remarks
                        <Input
                          placeholder="Optional note about the session"
                          value={remarks}
                          onChange={(event) => setRemarks(event.target.value)}
                          maxLength={255}
                          disabled={savingAttendance}
                        />
                      </label>

                      {attendanceErrors.hours_rendered && (
                        <p className="mt-2 text-xs text-red-600">{attendanceErrors.hours_rendered[0]}</p>
                      )}
                      {attendanceErrors.time_out && <p className="mt-2 text-xs text-red-600">{attendanceErrors.time_out[0]}</p>}

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <p className="flex items-center gap-1.5 text-xs text-stone-500">
                          <Info size={13} aria-hidden="true" />
                          {derivedHours !== null
                            ? `Leave hours blank to credit ${formatHours(derivedHours)} from the times above.`
                            : 'Leave hours blank to derive them from the time in and time out.'}
                        </p>

                        <Button
                          type="primary"
                          size="small"
                          icon={<Save size={14} />}
                          loading={savingAttendance}
                          onClick={() => handleSaveAttendance(assignment)}
                        >
                          Save attendance
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
};

export default ModalVolunteerAssignments;
