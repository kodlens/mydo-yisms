import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData, Youth } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { App, Button,  Progress, Tag, Tooltip } from 'antd';
import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Copy,
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  IdCard,
  MapPin,
  Pencil,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  Wallet,
} from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';

type Barangay = { brgyCode: string; brgyDesc: string };
type City = { citymunCode: string; citymunDesc: string };
type Province = { provCode: string; provDesc: string };

type ExtendedYouthProfile = Youth & {
  reference_code?: string;
  suffix?: string | null;
  school_address?: string | null;
  student_id?: string | null;
  barangay?: Barangay | null;
  city?: City | null;
  province?: Province | null;
};

type AcademicYear = {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
};

type ScholarshipType = {
  id: number;
  scholarship: string;
  target_beneficiary?: string;
  benefit?: string;
  amount?: string;
};

type ScholarshipApplication = {
  id: number;
  reference?: string;
  status: 'pending' | 'approved' | 'rejected' | 'draft';
  rejection_reason?: string | null;
  created_at: string;
  scholarship_type?: ScholarshipType;
  academic_year?: AcademicYear;
};

type Activity = {
  id: number;
  title: string;
  summary?: string;
  venue_name?: string;
  starts_at?: string;
  ends_at?: string;
  category?: { id: number; name: string };
  has_joined?: boolean;
};

type Props = {
  profile: ExtendedYouthProfile;
  activeAcademicYear?: AcademicYear | null;
  scholarshipStats: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  scholarshipApplications: ScholarshipApplication[];
  registeredActivitiesCount: number;
  attendedActivitiesCount: number;
  upcomingActivities: Activity[];
  cashIncentivesCount: number;
};

function formatDate(val?: string | null): string {
  if (!val) return '—';
  const d = new Date(val);
  return Number.isNaN(d.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }).format(d);
}

function formatDateTime(val?: string | null): string {
  if (!val) return '—';
  const d = new Date(val);
  return Number.isNaN(d.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(d);
}

const statusBadgeConfig: Record<string, { color: string; label: string }> = {
  pending: { color: 'gold', label: 'Pending Review' },
  approved: { color: 'green', label: 'Approved' },
  rejected: { color: 'red', label: 'Needs Attention' },
  draft: { color: 'default', label: 'Draft' },
};

const YouthDashboardPage = ({
  profile,
  activeAcademicYear,
  scholarshipStats,
  scholarshipApplications = [],
  registeredActivitiesCount = 0,
  attendedActivitiesCount = 0,
  upcomingActivities = [],
  cashIncentivesCount = 0,
}: Props) => {
  const { message } = App.useApp();
  const [copied, setCopied] = useState(false);

  const fullName = [profile.fname, profile.mname, profile.lname, profile.suffix].filter(Boolean).join(' ');
  const initials = `${profile.fname?.[0] ?? ''}${profile.lname?.[0] ?? ''}`.toUpperCase();
  // const location = [profile.barangay?.brgyDesc, profile.city?.citymunDesc, profile.province?.provDesc]
  //   .filter(Boolean)
  //   .join(', ');

  const handleCopyRef = () => {
    if (!profile.reference_code) return;
    navigator.clipboard.writeText(profile.reference_code);
    setCopied(true);
    message.success('Reference code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Profile completeness check
  const profileItems = [
    Boolean(profile.fname && profile.lname),
    Boolean(profile.email),
    Boolean(profile.mobile_number),
    Boolean(profile.school_name),
    Boolean(profile.program),
    Boolean(profile.year),
    Boolean(profile.guardian_name && profile.guardian_contact_number),
  ];
  const completedFields = profileItems.filter(Boolean).length;
  const completenessPercentage = Math.round((completedFields / profileItems.length) * 100);

  return (
    <>
      <Head title="Youth Portal Dashboard" />

      <div className="mx-auto max-w-7xl space-y-6">
        {/* ================= HERO GREETING BANNER ================= */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-950 p-6 text-white shadow-md sm:p-8">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-teal-200 ring-2 ring-white/20 backdrop-blur-md">
                {initials || <UserRound className="h-8 w-8" />}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
                    <Sparkles className="h-3 w-3" />
                    Verified College Youth
                  </span>

                  {activeAcademicYear && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-cyan-200 ring-1 ring-white/15">
                      A.Y. {activeAcademicYear.name}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Welcome back, {profile.fname || 'Student'}!
                </h1>

                <p className="text-sm text-teal-100/90 leading-relaxed">
                  {profile.program ? `${profile.program}` : 'College Student'}
                  {profile.year ? ` · ${profile.year === 1 ? '1st' : profile.year === 2 ? '2nd' : profile.year === 3 ? '3rd' : `${profile.year}th`} Year College` : ''}
                  {profile.school_name ? ` at ${profile.school_name}` : ''}
                </p>
              </div>
            </div>

            {/* Quick Reference Code Pill */}
            <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
              <div className="rounded-xl bg-black/25 px-4 py-2.5 ring-1 ring-white/15 backdrop-blur-sm">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-300 block">
                  Youth Reference Code
                </span>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-white">
                    {profile.reference_code || 'YD-RECORD'}
                  </span>
                  <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="rounded p-1 text-teal-200 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Copy reference code"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <Link href={route('youth.youth-my-profile.index')}>
                <Button
                  size="small"
                  icon={<Pencil className="h-3.5 w-3.5" />}
                  className="!border-white/30 !bg-white/10 !text-xs !font-medium !text-white hover:!bg-white/20"
                >
                  Edit Records
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ================= ROW 1: KEY METRIC STAT CARDS ================= */}
        <section aria-label="Portal Metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card 1: Scholarships */}
          <Link
            href={route('youth.services.youth-scholarships.index')}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-teal-50 p-2.5 text-teal-700 transition-colors group-hover:bg-teal-700 group-hover:text-white">
                <GraduationCap className="h-5 w-5" />
              </span>
              {scholarshipStats.pending > 0 ? (
                <Tag color="gold" className="m-0 text-xs font-semibold">
                  {scholarshipStats.pending} Pending
                </Tag>
              ) : (
                <Tag color="cyan" className="m-0 text-xs">
                  Active
                </Tag>
              )}
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Scholarships
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {scholarshipStats.total}{' '}
                <span className="text-xs font-normal text-slate-500">applied</span>
              </p>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                {scholarshipStats.approved > 0 ? (
                  <span className="font-semibold text-emerald-600">
                    ✓ {scholarshipStats.approved} approved
                  </span>
                ) : (
                  <span>Explore municipal programs</span>
                )}
                <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 ml-auto text-teal-700" />
              </p>
            </div>
          </Link>

          {/* Card 2: Activities & Workshops */}
          <Link
            href={route('youth.youth-services.events-activities.index')}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-indigo-50 p-2.5 text-indigo-700 transition-colors group-hover:bg-indigo-700 group-hover:text-white">
                <CalendarDays className="h-5 w-5" />
              </span>
              <Tag color="blue" className="m-0 text-xs">
                Community
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Events & Activities
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {registeredActivitiesCount}{' '}
                <span className="text-xs font-normal text-slate-500">joined</span>
              </p>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                <span>{attendedActivitiesCount} sessions recorded</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 ml-auto text-indigo-700" />
              </p>
            </div>
          </Link>

          {/* Card 3: Cash Grants & Incentives */}
          <Link
            href={route('youth.youth-cash-incentives.index')}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
                <Wallet className="h-5 w-5" />
              </span>
              <Tag color="green" className="m-0 text-xs">
                Beneficiary
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Cash Incentives
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {cashIncentivesCount}{' '}
                <span className="text-xs font-normal text-slate-500">grants recorded</span>
              </p>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-1">
                <span>View records by year</span>
                <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 ml-auto text-emerald-700" />
              </p>
            </div>
          </Link>

          {/* Card 4: Profile Status */}
          <Link
            href={route('youth.youth-my-profile.index')}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-cyan-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-cyan-50 p-2.5 text-cyan-700 transition-colors group-hover:bg-cyan-700 group-hover:text-white">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <Tag color="cyan" className="m-0 text-xs">
                {completenessPercentage}% Complete
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Resident Profile
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {profile.is_active ? 'Active' : 'Pending'}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <Progress
                  percent={completenessPercentage}
                  size="small"
                  showInfo={false}
                  strokeColor="#0e7490"
                  className="!m-0"
                />
                <ArrowRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100 text-cyan-700 shrink-0" />
              </div>
            </div>
          </Link>
        </section>

        {/* ================= ROW 2: QUICK ACTION SHORTCUT LAUNCHER ================= */}
        <section aria-label="Quick Actions" className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Services & Quick Actions</h2>
              <p className="text-xs text-slate-500">Access municipal services and resources available to college students.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Shortcut 1 */}
            <Link
              href={route('youth.services.youth-scholarships.index')}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-teal-400 hover:bg-teal-50/40 hover:shadow-xs group"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-800 group-hover:bg-teal-700 group-hover:text-white transition-colors">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-teal-900">
                  Apply for Scholarship
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Browse open educational assistance, submit requirements, and track status.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-teal-700 group-hover:underline">
                Explore Grants <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            {/* Shortcut 2 */}
            <Link
              href={route('youth.youth-services.events-activities.index')}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-indigo-400 hover:bg-indigo-50/40 hover:shadow-xs group"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800 group-hover:bg-indigo-700 group-hover:text-white transition-colors">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-900">
                  Youth Activities & Summits
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Join municipal youth leadership camps, skills workshops, and seminars.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 group-hover:underline">
                Browse Events <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            {/* Shortcut 3 */}
            <Link
              href={route('youth.youth-my-profile.index')}
              className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 transition-all hover:border-cyan-400 hover:bg-cyan-50/40 hover:shadow-xs group"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-100 text-cyan-800 group-hover:bg-cyan-700 group-hover:text-white transition-colors">
                  <UserRound className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-cyan-900">
                  My Profile & Records
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Update your college year level, course, guardian contact, and residential address.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-cyan-700 group-hover:underline">
                View Profile <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>

            {/* Shortcut 4 */}
            <div className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <FileText className="h-5 w-5" />
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900">
                  Application Guidelines
                </h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                  Keep your Certificate of Enrollment (COE), Grades (COG), and Valid ID ready.
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-amber-800">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Digital Submissions
              </span>
            </div>
          </div>
        </section>

        {/* ================= MAIN SPLIT CONTENT AREA (70% / 30%) ================= */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* LEFT 70%: ACTIVE SCHOLARSHIPS & UPCOMING ACTIVITIES */}
          <div className="space-y-6">
            {/* --- SECTION: MY SCHOLARSHIP APPLICATIONS TRACKER --- */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg bg-teal-50 p-2 text-teal-700">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">My Scholarship Applications</h2>
                    <p className="text-xs text-slate-500">Track the real-time review status of your grant requests.</p>
                  </div>
                </div>

                <Link href={route('youth.services.youth-scholarships.index')}>
                  <Button size="small" type="link" className="!text-teal-700 !font-semibold">
                    View All Grants →
                  </Button>
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {scholarshipApplications.length > 0 ? (
                  scholarshipApplications.map((app) => {
                    const badge = statusBadgeConfig[app.status] ?? { color: 'default', label: app.status };
                    return (
                      <div
                        key={app.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-slate-900">
                              {app.scholarship_type?.scholarship ?? 'Municipal Scholarship Program'}
                            </h3>
                            <Tag color={badge.color} className="m-0 font-semibold text-xs">
                              {badge.label}
                            </Tag>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            {app.reference && (
                              <span className="font-mono text-slate-700">
                                Tracking: <strong>{app.reference}</strong>
                              </span>
                            )}
                            {app.academic_year && (
                              <span>A.Y. {app.academic_year.name}</span>
                            )}
                            <span>Applied: {formatDate(app.created_at)}</span>
                          </div>

                          {app.status === 'rejected' && app.rejection_reason && (
                            <p className="mt-1 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-100">
                              Note: {app.rejection_reason}
                            </p>
                          )}
                        </div>

                        <Link href={route('youth.services.youth-scholarships.index')}>
                          <Button size="small" className="self-start sm:self-auto font-medium text-xs">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                    <GraduationCap className="mx-auto h-10 w-10 text-slate-400" />
                    <h3 className="mt-3 text-sm font-bold text-slate-800">No Scholarship Applications Yet</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      You haven't submitted an application for educational assistance this semester. Check out open municipal programs and apply online.
                    </p>
                    <Link href={route('youth.services.youth-scholarships.index')} className="mt-4 inline-block">
                      <Button type="primary" className="!bg-teal-700 hover:!bg-teal-800 !font-semibold">
                        Browse Scholarships
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* --- SECTION: UPCOMING ACTIVITIES & WORKSHOPS --- */}
            <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
                    <CalendarDays className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Upcoming Events & Activities</h2>
                    <p className="text-xs text-slate-500">Participate in youth development programs and community summits.</p>
                  </div>
                </div>

                <Link href={route('youth.youth-services.events-activities.index')}>
                  <Button size="small" type="link" className="!text-indigo-700 !font-semibold">
                    View All →
                  </Button>
                </Link>
              </div>

              <div className="mt-5 space-y-3">
                {upcomingActivities.length > 0 ? (
                  upcomingActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors hover:border-slate-300"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{activity.title}</h3>
                          {activity.category && (
                            <Tag color="cyan" className="m-0 text-xs">
                              {activity.category.name}
                            </Tag>
                          )}
                          {activity.has_joined && (
                            <Tag color="green" className="m-0 text-xs font-semibold">
                              ✓ Joined
                            </Tag>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          {activity.starts_at && (
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <Clock className="h-3 w-3 text-slate-400" />
                              {formatDateTime(activity.starts_at)}
                            </span>
                          )}
                          {activity.venue_name && (
                            <span className="inline-flex items-center gap-1 text-slate-600">
                              <MapPin className="h-3 w-3 text-slate-400" />
                              {activity.venue_name}
                            </span>
                          )}
                        </div>
                      </div>

                      <Link href={route('youth.youth-services.events-activities.index')}>
                        <Button
                          size="small"
                          type={activity.has_joined ? 'default' : 'primary'}
                          className={activity.has_joined ? '' : '!bg-indigo-700 hover:!bg-indigo-800'}
                        >
                          {activity.has_joined ? 'View Event' : 'Join Activity'}
                        </Button>
                      </Link>
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                    No upcoming events scheduled right now. Check back soon for announcements!
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT 30%: DIGITAL RESIDENT CARD + PRE-FLIGHT CHECKLIST + HELPDESK */}
          <div className="space-y-6">
            {/* DIGITAL STUDENT / RESIDENT CARD */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              <div className="bg-gradient-to-r from-teal-800 to-cyan-900 p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IdCard className="h-5 w-5 text-teal-200" />
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-100">
                      eKabataan Resident Card
                    </span>
                  </div>
                  <Tag color="cyan" className="m-0 text-[10px] font-mono uppercase">
                    MYDO Official
                  </Tag>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-xl font-bold text-teal-800 ring-1 ring-teal-200">
                    {initials}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 truncate">{fullName}</h3>
                    <p className="font-mono text-xs font-semibold text-teal-700">
                      {profile.reference_code || 'YD-RECORD'}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {profile.school_name || 'College Student'}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 space-y-2 text-xs border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Program / Degree:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">
                      {profile.program || 'Not specified'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Year Level:</span>
                    <span className="font-medium text-slate-800">
                      {profile.year ? `${profile.year}th Year College` : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Barangay:</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">
                      {profile.barangay?.brgyDesc || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact Number:</span>
                    <span className="font-mono font-medium text-slate-800">
                      {profile.mobile_number || '—'}
                    </span>
                  </div>
                </div>

                <Link href={route('youth.youth-my-profile.index')} className="block">
                  <Button block icon={<Pencil className="h-3.5 w-3.5" />} className="font-medium text-xs">
                    Edit Profile Details
                  </Button>
                </Link>
              </div>
            </div>

            {/* PRE-APPLICATION REQUIREMENTS CHECKLIST */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
                <FileCheck className="h-4 w-4 text-teal-700" />
                <span>Scholarship Readiness Checklist</span>
              </div>

              <p className="mt-2.5 text-xs text-slate-500 leading-relaxed">
                Ensure you have clear digital scans or photos of these documents when applying:
              </p>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Certificate of Enrollment (COE) / Registration Form</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Certificate of Grades (COG) / Transcript of Records</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Valid School Student ID or Valid Government ID</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Barangay Certificate of Residency or Indigency</span>
                </div>
              </div>
            </div>

            {/* MYDO HELPDESK & SUPPORT */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 shadow-xs">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <HelpCircle className="h-4 w-4 text-teal-700" />
                <span>MYDO Office Support</span>
              </div>

              <div className="mt-3 space-y-2.5 text-xs text-slate-600">
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>Municipal Youth Development Office, 2nd Floor Municipal Hall</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>Monday – Friday · 8:00 AM to 5:00 PM</span>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>Assistance Hotline: (088) 123-4567</span>
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-teal-50 p-2.5 text-[11px] text-teal-900 border border-teal-100">
                For urgent inquiries regarding scholarship releases or documentary submissions, visit the youth desk at the municipal hall.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

YouthDashboardPage.layout = (page: ReactNode) => (
  <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user} header="Dashboard">
    {page}
  </YouthAuthLayout>
);

export default YouthDashboardPage;
