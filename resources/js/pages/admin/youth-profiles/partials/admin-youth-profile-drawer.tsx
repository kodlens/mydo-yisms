import { Youth } from '@/types';
import { EyeOutlined, LockOutlined } from '@ant-design/icons';
import { router } from '@inertiajs/react';
import { Badge, Button, Descriptions, Drawer, Empty, Space, Tag, Typography } from 'antd';
import ChangeYouthPassword from './change-youth-password';
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

export default function AdminYouthProfileDrawer({ open, onClose, youth }: Props) {
  if (!youth) return null;

  const fullName = [youth.fname, youth.mname, youth.lname, youth.suffix].filter(Boolean).join(' ');

  const fullAddress = [
    youth.street_address,
    youth.barangay?.brgyDesc,
    youth.city?.citymunDesc,
    youth.province?.provDesc,
    youth.zip_code,
  ]
    .filter(Boolean)
    .join(', ');

  const isEnrolled = Boolean(youth.school_name && !youth.is_graduated);
  const isOsy = Boolean(!youth.school_name && !youth.is_graduated);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      title={
        <div className="flex items-center justify-between pr-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-amber-200 font-bold text-sm shadow-xs">
              {youth.fname?.[0] ?? 'Y'}
              {youth.lname?.[0] ?? ''}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">{fullName}</h2>
              <p className="text-xs font-mono text-slate-500">{youth.reference_code || `ID #${youth.id}`}</p>
            </div>
          </div>
          <Space>
            <ChangeYouthPassword
              youth={youth}
              trigger={(openPasswordModal) => (
                <Button
                  size="small"
                  icon={<LockOutlined />}
                  onClick={openPasswordModal}
                  className="text-xs font-medium"
                >
                  Change Password
                </Button>
              )}
            />
            <Tag color={youth.is_active ? 'green' : 'default'} className="font-semibold uppercase text-xs">
              {youth.is_active ? 'Active Profile' : 'Inactive'}
            </Tag>
          </Space>
        </div>
      }
      styles={{
        body: { padding: '24px', background: '#fafaf9' },
      }}
    >
      <div className="space-y-6">
        {/* Quick Highlights Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Category</span>
            <span className="mt-1 text-xs font-bold text-slate-800 block">
              {youth.is_graduated ? '🎓 Graduated' : isEnrolled ? '📚 Enrolled (ISY)' : isOsy ? '🌱 OSY' : 'Youth'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Year Level</span>
            <span className="mt-1 text-xs font-bold text-slate-800 block">
              {youth.year ? `Year ${youth.year}` : 'N/A'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Barangay</span>
            <span className="mt-1 text-xs font-bold text-slate-800 truncate block">
              {youth.barangay?.brgyDesc || 'N/A'}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-2xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">Family Income</span>
            <span className="mt-1 text-xs font-bold text-slate-800 block">
              {youth.monthly_family_income ? `₱${Number(youth.monthly_family_income).toLocaleString()}` : '—'}
            </span>
          </div>
        </div>

        {/* Section: Personal Demographics */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <UserRound size={16} className="text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">Demographic Information</h3>
          </div>

          <Descriptions size="small" column={{ xs: 1, sm: 2 }} className="text-xs">
            <Descriptions.Item label="Full Name">{display(fullName) || '—'}</Descriptions.Item>
            <Descriptions.Item label="Sex">{display(youth.sex) || '—'}</Descriptions.Item>
            <Descriptions.Item label="Date of Birth">{formatDate(youth.birth_date)}</Descriptions.Item>
            <Descriptions.Item label="Civil Status">{display(youth.civil_status) || '—'}</Descriptions.Item>
            <Descriptions.Item label="Guardian Name">{display(youth.guardian_name) || '—'}</Descriptions.Item>
            <Descriptions.Item label="Guardian Contact">{display(youth.guardian_contact_number) || '—'}</Descriptions.Item>
          </Descriptions>
        </section>

        {/* Section: Contact & Location */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <MapPin size={16} className="text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">Contact & Address</h3>
          </div>

          <Descriptions size="small" column={{ xs: 1, sm: 2 }} className="text-xs">
            <Descriptions.Item label="Email Address">
              <span className="text-slate-700">{display(youth.email) || '—'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Mobile Number">
              <span className="font-mono">{display(youth.mobile_number) || '—'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Complete Address" span={2}>
              {display(fullAddress) || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Barangay">{display(youth.barangay?.brgyDesc) || '—'}</Descriptions.Item>
            <Descriptions.Item label="City / Municipality">{display(youth.city?.citymunDesc) || '—'}</Descriptions.Item>
            <Descriptions.Item label="Province">{display(youth.province?.provDesc) || '—'}</Descriptions.Item>
            <Descriptions.Item label="ZIP Code">{display(youth.zip_code) || '—'}</Descriptions.Item>
          </Descriptions>
        </section>

        {/* Section: Academic Background */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
            <GraduationCap size={16} className="text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">Academic & Educational Background</h3>
          </div>

          <Descriptions size="small" column={{ xs: 1, sm: 2 }} className="text-xs">
            <Descriptions.Item label="School / University" span={2}>
              <span className="font-semibold text-slate-800">{display(youth.school_name) || 'Not Enrolled / None'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Program / Degree / Strand">
              {display(youth.program) || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Student ID / LRN">
              <span className="font-mono">{display(youth.student_id) || '—'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Current Year Level">
              {youth.year ? `Year ${youth.year}` : '—'}
            </Descriptions.Item>
            <Descriptions.Item label="Previous Semester GWA">
              {display(youth.previous_semester_gWA) || '—'}
            </Descriptions.Item>
            <Descriptions.Item label="School Address" span={2}>
              {display(youth.school_address) || '—'}
            </Descriptions.Item>
          </Descriptions>
        </section>

        {/* Section: Linked Scholarship History */}
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-800">Scholarship Applications History</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {youth.scholarship_applications?.length ?? 0} application(s)
            </span>
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
                      router.visit(`/admin/applicants/${app.id}`);
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
