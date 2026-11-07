import { Modal, Table, Tag, Input, Select, Button, Space, App } from 'antd';
import { Clock, Download, MapPin, QrCode, RefreshCw, Search, Trash2, UserCheck } from 'lucide-react';
import { useState } from 'react';

export type AttendeeRecord = {
  id: number;
  youth_profile_id: number;
  reference_code?: string;
  student_id?: string;
  full_name: string;
  email?: string;
  mobile_number?: string;
  barangay?: string;
  method: 'qr' | 'manual';
  attended_at: string;
  remarks?: string;
  recorded_by_name: string;
};

type Props = {
  attendees: AttendeeRecord[];
  loading?: boolean;
  total?: number;
  onRefresh: () => void;
  onSearchChange: (query: string) => void;
  onMethodChange: (method: string) => void;
  onRemove: (attendanceId: number, reason: string) => Promise<void>;
};

export default function AttendanceHistoryTable({
  attendees,
  loading = false,
  total = 0,
  onRefresh,
  onSearchChange,
  onMethodChange,
  onRemove,
}: Props) {
  const { modal, notification } = App.useApp();
  const [removingId, setRemovingId] = useState<number | null>(null);

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Manila',
      });
    } catch {
      return isoString;
    }
  };

  const confirmRemove = (record: AttendeeRecord) => {
    let reasonText = '';

    modal.confirm({
      centered: true,
      title: 'Remove Attendance Record?',
      content: (
        <div className="py-2 text-xs space-y-3">
          <p className="text-slate-600">
            You are about to remove the attendance record for{' '}
            <strong className="text-slate-900">{record.full_name}</strong>. This administrative
            action will generate an audit log entry.
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Reason for Removal (Required)
            </label>
            <Input.TextArea
              rows={3}
              placeholder="e.g. Scanned wrong attendee by mistake / accidental entry"
              onChange={(e) => {
                reasonText = e.target.value;
              }}
              className="text-xs"
            />
          </div>
        </div>
      ),
      okText: 'Confirm Removal',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        if (!reasonText || reasonText.trim().length < 5) {
          notification.error({
            message: 'Reason Required',
            description: 'Please provide a valid explanation (minimum 5 characters).',
          });
          return Promise.reject();
        }

        setRemovingId(record.id);
        try {
          await onRemove(record.id, reasonText.trim());
          notification.success({
            message: 'Attendance Removed',
            description: `Attendance record for ${record.full_name} has been cancelled.`,
          });
        } finally {
          setRemovingId(null);
        }
      },
    });
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
      {/* Header and Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Attendance Log ({total})
          </h3>
          <p className="text-xs text-slate-500">
            Chronological record of verified attendees for this activity
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Input.Search
            placeholder="Search attendee or code..."
            allowClear
            size="middle"
            onSearch={onSearchChange}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-56"
          />

          <Select
            defaultValue=""
            size="middle"
            onChange={onMethodChange}
            className="w-32"
            options={[
              { value: '', label: 'All Methods' },
              { value: 'qr', label: 'QR Scan' },
              { value: 'manual', label: 'Manual' },
            ]}
          />

          <Button
            icon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
            onClick={onRefresh}
            title="Refresh Log"
          />
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-x-auto">
        <Table
          dataSource={attendees}
          rowKey="id"
          loading={loading}
          pagination={false}
          size="middle"
          className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-bold"
        >
          <Table.Column
            title="Attendee"
            key="full_name"
            render={(_, record: AttendeeRecord) => (
              <div>
                <p className="font-bold text-slate-900">{record.full_name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                  {record.reference_code && (
                    <code className="rounded bg-slate-100 px-1 py-0.5 text-[11px] font-mono text-emerald-800">
                      {record.reference_code}
                    </code>
                  )}
                  {record.email && <span>{record.email}</span>}
                </div>
              </div>
            )}
          />

          <Table.Column
            title="Barangay"
            dataIndex="barangay"
            key="barangay"
            render={(barangay?: string) => (
              <span className="text-xs text-slate-600">
                {barangay ? `Brgy. ${barangay}` : '—'}
              </span>
            )}
          />

          <Table.Column
            title="Method"
            dataIndex="method"
            key="method"
            render={(method: string) =>
              method === 'qr' ? (
                <Tag color="cyan" className="font-semibold uppercase text-[10px]">
                  QR Scan
                </Tag>
              ) : (
                <Tag color="orange" className="font-semibold uppercase text-[10px]">
                  Manual Entry
                </Tag>
              )
            }
          />

          <Table.Column
            title="Attended At"
            dataIndex="attended_at"
            key="attended_at"
            render={(val: string) => (
              <div className="text-xs text-slate-600">
                <p>{formatDateTime(val)}</p>
              </div>
            )}
          />

          <Table.Column
            title="Verified By"
            dataIndex="recorded_by_name"
            key="recorded_by_name"
            render={(name: string) => (
              <span className="text-xs text-slate-600 font-medium">{name}</span>
            )}
          />

          <Table.Column
            title="Action"
            key="action"
            align="right"
            render={(_, record: AttendeeRecord) => (
              <Button
                danger
                type="text"
                size="small"
                icon={<Trash2 className="h-3.5 w-3.5" />}
                onClick={() => confirmRemove(record)}
                title="Remove attendance (generates audit log)"
              />
            )}
          />
        </Table>
      </div>
    </div>
  );
}
