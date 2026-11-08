import { Youth } from '@/types';
import { EyeOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Badge, Button, Descriptions, Drawer, Empty, Space, Tag, Typography } from 'antd';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  UserRound,
  Users,
  Wallet,
} from 'lucide-react';

const { Text } = Typography;

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
  is_graduated?: boolean;
  scholarship_applications?: ScholarshipApplicationItem[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  youth: ExtendedYouth | null;
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

const statusBadgeColor: Record<string, string> = {
  approved: 'success',
  pending: 'warning',
  rejected: 'error',
  draft: 'default',
};

export default function StaffYouthProfileDrawer({ open, onClose, youth }: Props) {
  if (!youth) return null;

  const fullName = [youth.fname, youth.mname, youth.lname, youth.suffix].map(display).filter(Boolean).join(' ');
  const age = calculateAge(youth.birth_date);
  const location = [youth.barangay?.brgyDesc, youth.city?.citymunDesc, youth.province?.provDesc]
    .map(display)
    .filter(Boolean)
    .join(', ');

  const educationalCategory = youth.is_graduated
    ? 'Graduated'
    : youth.school_name
    ? 'Currently Enrolled'
    : 'Out-of-School Youth (OSY)';

  return (
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
              <Tag color={youth.is_active ? 'green' : 'default'} className="text-xs m-0">
                {youth.is_active ? 'Active' : 'Inactive'}
              </Tag>
            </div>
          </div>
        </div>
      }
      placement="right"
      width={640}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <div className="space-y-6">
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
  );
}
