import { Youth } from '@/types';
import { EyeOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import {
  App,
  Button,
  Descriptions,
  Drawer,
  Image,
  Input,
  Modal,
  Tag
} from 'antd';
import axios from 'axios';
import {

  CheckCircle2,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';


export type ScholarshipApplicationItem = {
  id: number;
  reference?: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  created_at: string;
  scholarship_type?: {
    id: number;
    name: string;
    description?: string;
  } | null;
};

export type ExtendedYouth = Youth & {
  suffix?: string | null;
  school_address?: string | null;
  student_id?: string | null;
  school_id_path?: string | null;
  is_graduated?: boolean;
  scholarship_applications?: ScholarshipApplicationItem[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  youth: ExtendedYouth | null;
  onUpdated?: () => void;
};

function display(val: unknown): string {
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number' && Number.isFinite(val)) return String(val);
  return '';
}

function formatDate(val?: string | null): string {
  if (!val) return '—';
  const d = new Date(val.slice(0, 10) + 'T00:00:00Z');
  return Number.isNaN(d.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(d);
}

function formatCurrency(val?: number | string | null): string {
  if (!val || !Number.isFinite(Number(val))) return '—';
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(val));
}

function calculateAge(birthDate?: string | null): number | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}

export default function StaffYouthProfileDrawer({ open, onClose, youth, onUpdated }: Props) {
  const { modal, notification } = App.useApp();
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!youth) return null;

  const fullName = [youth.fname, youth.mname, youth.lname, youth.suffix].map(display).filter(Boolean).join(' ');
  const age = calculateAge(youth.birth_date);
  const educationalCategory = 'College Student';
  const regStatus = youth.status || 'pending';

  const handleApprove = () => {
    modal.confirm({
      title: 'Approve Youth Profile?',
      content: `Verify and activate the account for ${fullName}? Once approved, the youth will be granted sign-in access to the eKabataan portal.`,
      okText: 'Yes, Approve Profile',
      okType: 'primary',
      onOk: async () => {
        setActionLoading(true);
        try {
          const res = await axios.post(`/staff/youth-profiles/${youth.id}/approve`);
          if (res.data?.success) {
            notification.success({
              message: 'Account Approved',
              description: res.data.message || `${fullName}'s registration is now approved.`,
            });
            onUpdated?.();
            onClose();
          }
        } catch (err: unknown) {
          notification.error({
            message: 'Approval Failed',
            description: axios.isAxiosError(err) ? err?.response?.data?.message || 'Could not approve account. Please try again.'
              : 'Could not approved. Please try again.',
          });
        } finally {
          setActionLoading(false);
        }
      },
    });
  };

  const handleRejectConfirm = async () => {
    setActionLoading(true);
    try {
      const res = await axios.post(`/staff/youth-profiles/${youth.id}/reject`, {
        rejection_reason: rejectionReason.trim() || null,
      });
      if (res.data?.success) {
        notification.warning({
          message: 'Account Rejected',
          description: res.data.message || `${fullName}'s registration has been rejected.`,
        });
        setRejectModalOpen(false);
        setRejectionReason('');
        onUpdated?.();
        onClose();
      }
    } catch (err: unknown) {
      notification.error({
        message: 'Rejection Failed',
        description: axios.isAxiosError(err) ? err?.response?.data?.message || 'Could not reject account. Please try again.'
          : 'Could not reject account. Please try again.',
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <>
      <Drawer
        title={
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-800 ring-1 ring-teal-200">
              <UserRound size={20} />
            </div>
            <div>
              <div className="font-semibold text-slate-900 leading-tight">{fullName || 'Youth Record'}</div>
              <div className="flex items-center gap-2 mt-0.5">
                {youth.reference_code && (
                  <Tag color="cyan" className="font-mono text-xs font-semibold m-0">
                    {youth.reference_code}
                  </Tag>
                )}
                {regStatus === 'approved' && (
                  <Tag color="success" className="text-xs m-0 font-semibold">
                    Approved
                  </Tag>
                )}
                {regStatus === 'pending' && (
                  <Tag color="warning" className="text-xs m-0 font-semibold">
                    Pending Approval
                  </Tag>
                )}
                {regStatus === 'rejected' && (
                  <Tag color="error" className="text-xs m-0 font-semibold">
                    Rejected
                  </Tag>
                )}
              </div>
            </div>
          </div>
        }
        placement="right"
        size={640}
        open={open}
        onClose={onClose}
        destroyOnHidden
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button onClick={onClose} disabled={actionLoading}>
              Close
            </Button>
            <div className="flex items-center gap-2">
              {regStatus !== 'approved' && (
                <Button
                  type="primary"
                  icon={<CheckCircle2 size={16} />}
                  loading={actionLoading}
                  onClick={handleApprove}
                  className="!bg-emerald-600 hover:!bg-emerald-700 font-semibold"
                >
                  Approve Account
                </Button>
              )}
              {regStatus !== 'rejected' && (
                <Button
                  danger
                  icon={<XCircle size={16} />}
                  loading={actionLoading}
                  onClick={() => setRejectModalOpen(true)}
                  className="font-semibold"
                >
                  Reject Registration
                </Button>
              )}
            </div>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Registration Status Banner */}
          {regStatus === 'pending' && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-2xs">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-amber-950">Registration Pending Staff Review</h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    This youth registered on {formatDate(youth.created_at)}. Their account is currently blocked from signing in until a staff member reviews and approves it.
                  </p>
                  {/* <div className="mt-3 flex items-center gap-2">
                    <Button
                      type="primary"
                      size="small"
                      icon={<CheckCircle2 size={14} />}
                      onClick={handleApprove}
                      loading={actionLoading}
                      className="!bg-emerald-600 hover:!bg-emerald-700 font-semibold"
                    >
                      Approve Profile
                    </Button>
                    <Button
                      danger
                      size="small"
                      icon={<XCircle size={14} />}
                      onClick={() => setRejectModalOpen(true)}
                      loading={actionLoading}
                    >
                      Reject
                    </Button>
                  </div> */}
                </div>
              </div>
            </div>
          )}

          {regStatus === 'approved' && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5">
              <div className="flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>
                  Account verified and approved
                  {youth.approver ? ` by ${youth.approver.fname} ${youth.approver.lname}` : ''}
                  {youth.approved_at ? ` on ${formatDate(youth.approved_at)}` : ''}.
                </span>
              </div>
            </div>
          )}

          {regStatus === 'rejected' && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-rose-950">Registration Rejected</h4>
                  <p className="text-xs text-rose-800 mt-1">
                    <strong>Reason:</strong> {youth.rejection_reason || 'No specific reason provided.'}
                  </p>
                  <div className="mt-3">
                    <Button
                      type="primary"
                      size="small"
                      onClick={handleApprove}
                      loading={actionLoading}
                      className="!bg-emerald-600 hover:!bg-emerald-700 font-semibold"
                    >
                      Re-Approve Account
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick summary strip */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
            <div>
              <span className="text-xs text-slate-500">Education Status</span>
              <p className="mt-1 font-semibold text-slate-800 text-sm">{educationalCategory}</p>
            </div>
            <div>
              <span className="text-xs text-slate-500">Age</span>
              <p className="mt-1 font-semibold text-slate-800 text-sm">{age !== null ? `${age} years old` : '—'}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-xs text-slate-500">Registered GWA</span>
              <p className="mt-1 font-semibold text-slate-800 text-sm">
                {youth.previous_semester_gwa ? Number(youth.previous_semester_gwa).toFixed(2) : 'Not recorded'}
              </p>
            </div>
          </div>

          {/* Personal Details */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold">
              <UserCheck size={18} className="text-teal-700" />
              <span>Personal Information</span>
            </div>
            <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Full Name">{fullName || '—'}</Descriptions.Item>
              <Descriptions.Item label="Sex">{display(youth.sex) || '—'}</Descriptions.Item>
              <Descriptions.Item label="Date of Birth">{formatDate(youth.birth_date)}</Descriptions.Item>
              <Descriptions.Item label="Civil Status">{display(youth.civil_status) || '—'}</Descriptions.Item>
              <Descriptions.Item label="Email" span={2}>
                <div className="flex items-center gap-1.5">
                  <Mail size={14} className="text-slate-400" />
                  <span>{display(youth.email) || '—'}</span>
                </div>
              </Descriptions.Item>
              <Descriptions.Item label="Mobile Number" span={2}>
                <div className="flex items-center gap-1.5">
                  <Phone size={14} className="text-slate-400" />
                  <span>{display(youth.mobile_number) || '—'}</span>
                </div>
              </Descriptions.Item>
            </Descriptions>
          </section>

          {/* Address */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold">
              <MapPin size={18} className="text-teal-700" />
              <span>Residential Address</span>
            </div>
            <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Barangay">{display(youth.barangay?.brgyDesc) || '—'}</Descriptions.Item>
              <Descriptions.Item label="City / Municipality">{display(youth.city?.citymunDesc) || '—'}</Descriptions.Item>
              <Descriptions.Item label="Province">{display(youth.province?.provDesc) || '—'}</Descriptions.Item>
              <Descriptions.Item label="ZIP Code">{display(youth.zip_code) || '—'}</Descriptions.Item>
              <Descriptions.Item label="Street Address" span={2}>
                {display(youth.street_address) || '—'}
              </Descriptions.Item>
            </Descriptions>
          </section>

          {/* Academic Details */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold">
              <GraduationCap size={18} className="text-teal-700" />
              <span>Academic Background</span>
            </div>
            <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="School Name" span={2}>
                {display(youth.school_name) || <span className="text-slate-400">None / OSY</span>}
              </Descriptions.Item>
              <Descriptions.Item label="School Address" span={2}>
                {display(youth.school_address) || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Program / Course">{display(youth.program) || '—'}</Descriptions.Item>
              <Descriptions.Item label="Year Level">
                {youth.year ? `${youth.year}${youth.year === 1 ? 'st' : youth.year === 2 ? 'nd' : youth.year === 3 ? 'rd' : 'th'} Year` : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Student ID">{display(youth.student_id) || '—'}</Descriptions.Item>
              <Descriptions.Item label="Previous GWA">
                {youth.previous_semester_gwa ? Number(youth.previous_semester_gwa).toFixed(2) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Uploaded School ID" span={2}>
                {youth.school_id_path ? (
                  <div className="flex flex-col gap-2 py-1">
                    <Image
                      src={`/storage/${youth.school_id_path.replace(/^\/?storage\//, '')}`}
                      alt={`${fullName} School ID`}
                      className="max-h-48 w-auto rounded-lg border border-slate-200 object-contain"
                      height={140}
                    />
                    <a
                      href={`/storage/${youth.school_id_path.replace(/^\/?storage\//, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-teal-700 hover:underline"
                    >
                      Open full image in new tab ↗
                    </a>
                  </div>
                ) : (
                  <span className="text-xs italic text-slate-400">No ID image uploaded</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </section>

          {/* Family & Guardian */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold">
              <Users size={18} className="text-teal-700" />
              <span>Family & Guardian</span>
            </div>
            <Descriptions size="small" bordered column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Guardian Name" span={2}>
                {display(youth.guardian_name) || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Guardian Contact" span={2}>
                {display(youth.guardian_contact_number) || '—'}
              </Descriptions.Item>
              <Descriptions.Item label="Monthly Family Income" span={2}>
                {formatCurrency(youth.monthly_family_income)}
              </Descriptions.Item>
            </Descriptions>
          </section>

          {/* Scholarship Applications History */}
          <section>
            <div className="flex items-center gap-2 mb-3 text-slate-900 font-semibold">
              <ShieldCheck size={18} className="text-teal-700" />
              <span>Scholarship Applications ({youth.scholarship_applications?.length ?? 0})</span>
            </div>

            {youth.scholarship_applications && youth.scholarship_applications.length > 0 ? (
              <div className="space-y-2">
                {youth.scholarship_applications.map((app) => (
                  <div
                    key={app.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3.5 hover:border-slate-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">
                          {app.scholarship_type?.name ?? `Scholarship #${app.id}`}
                        </span>
                        <Tag color={app.status === 'approved' ? 'green' : app.status === 'rejected' ? 'red' : 'gold'}>
                          {app.status.toUpperCase()}
                        </Tag>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        Tracking: <span className="font-mono text-slate-700">{app.reference || `#${app.id}`}</span>
                        {' · '}
                        Applied on {formatDate(app.created_at)}
                      </div>
                    </div>

                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => {
                        onClose();
                        router.visit(`/staff/applicants/${app.id}`);
                      }}
                      className="self-start sm:self-center"
                    >
                      View Application
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
                No scholarship applications submitted yet.
              </div>
            )}
          </section>
        </div>
      </Drawer>

      {/* Reject Reason Modal */}
      <Modal
        title="Reject Youth Registration"
        open={rejectModalOpen}
        onCancel={() => {
          setRejectModalOpen(false);
          setRejectionReason('');
        }}
        onOk={handleRejectConfirm}
        confirmLoading={actionLoading}
        okText="Confirm Rejection"
        okType="danger"
      >
        <p className="text-xs text-slate-600 mb-3">
          Please provide a reason for rejecting <strong>{fullName}</strong>'s registration. This will be shown to the youth when they attempt to sign in.
        </p>
        <Input.TextArea
          rows={3}
          placeholder="e.g. Incomplete address documentation, invalid school credentials, or out of municipality resident."
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
        />
      </Modal>
    </>
  );
}
