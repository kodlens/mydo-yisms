import SkAuthLayout, { SkUser } from '@/layouts/sk-auth-layout';
import { SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { App, Button, Empty, Image, Tag, Tooltip } from 'antd';
import {
  ArrowRight,
  Award,
  CalendarDays,
  Camera,
  CheckCircle2,
  Copy,
  FileImage,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';

type RecentEvidence = {
  id: number;
  activity_id: number;
  activity_title: string;
  activity_category: string;
  description: string;
  photos: string[];
  created_at: string | null;
};

type UpcomingActivity = {
  id: number;
  title: string;
  venue_name: string;
  starts_at: string;
  category?: { id: number; name: string };
  my_evidence_count?: number;
};

type Props = {
  profile: SkUser;
  activeAcademicYear?: { id: number; name: string; code: string } | null;
  stats: {
    barangayYouthCount: number;
    barangaySkCount: number;
    publishedEventsCount: number;
    myEvidenceCount: number;
  };
  recentEvidences: RecentEvidence[];
  upcomingActivities: UpcomingActivity[];
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

const SkDashboardPage = ({
  profile,
  activeAcademicYear,
  stats,
  recentEvidences = [],
  upcomingActivities = [],
}: Props) => {
  const { message } = App.useApp();
  const [copied, setCopied] = useState(false);

  const fullName = [profile.fname, profile.mname, profile.lname, profile.suffix].filter(Boolean).join(' ');
  const initials = `${profile.fname?.[0] ?? ''}${profile.lname?.[0] ?? ''}`.toUpperCase();
  const barangayName = profile.barangay?.brgyDesc || 'Assigned Barangay';
  const skPosition = profile.sk_position || 'SK Official';

  const handleCopyRef = () => {
    if (!profile.reference_code) return;
    navigator.clipboard.writeText(profile.reference_code);
    setCopied(true);
    message.success('SK reference code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <>
      <Head title="SK Official Dashboard" />

      <div className="mx-auto max-w-7xl space-y-6">
        {/* HERO BANNER */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 p-6 text-white shadow-md sm:p-8">
          <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-amber-300 ring-2 ring-amber-400/30 backdrop-blur-md">
                {initials || 'SK'}
              </div>

              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/30">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    {skPosition}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-indigo-200 ring-1 ring-white/15">
                    <MapPin className="h-3 w-3" />
                    Barangay {barangayName}
                  </span>

                  {activeAcademicYear && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-indigo-200 ring-1 ring-white/15">
                      A.Y. {activeAcademicYear.name}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Welcome, {profile.fname || fullName}!
                </h1>

                <p className="text-sm leading-relaxed text-indigo-100/90">
                  Sangguniang Kabataan Governance & Activity Evidence Portal • Barangay {barangayName}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-end">
              <div className="rounded-xl bg-black/30 px-4 py-2.5 ring-1 ring-white/15 backdrop-blur-sm">
                <span className="block text-[11px] font-semibold tracking-wider text-amber-300 uppercase">
                  SK Official Reference Code
                </span>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="font-mono text-base font-bold text-white">
                    {profile.reference_code || 'SK-OFFICIAL'}
                  </span>
                  <Tooltip title={copied ? 'Copied!' : 'Copy Code'}>
                    <button
                      type="button"
                      onClick={handleCopyRef}
                      className="rounded p-1 text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
                      aria-label="Copy reference code"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>
              </div>

              <Link href={route('sk.events-activities.index')}>
                <Button
                  type="primary"
                  icon={<Camera className="h-4 w-4" />}
                  className="!border-amber-400 !bg-amber-400 !font-bold !text-indigo-950 hover:!bg-amber-300"
                >
                  Upload Event Evidence
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* METRIC STAT CARDS */}
        <section aria-label="SK Metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href={route('sk.events-activities.index')}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-indigo-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-indigo-50 p-2.5 text-indigo-700 transition-colors group-hover:bg-indigo-700 group-hover:text-white">
                <CalendarDays className="h-5 w-5" />
              </span>
              <Tag color="geekblue" className="m-0 text-xs font-semibold">
                Published
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Events & Activities
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.publishedEventsCount}{' '}
                <span className="text-xs font-normal text-slate-500">events</span>
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-indigo-700 font-medium">
                <span>Browse & upload pictures</span>
                <ArrowRight className="ml-auto h-3 w-3" />
              </p>
            </div>
          </Link>

          <Link
            href={route('sk.events-activities.index')}
            className="group rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-emerald-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-emerald-50 p-2.5 text-emerald-700 transition-colors group-hover:bg-emerald-700 group-hover:text-white">
                <FileImage className="h-5 w-5" />
              </span>
              <Tag color="green" className="m-0 text-xs font-semibold">
                Submitted to MYDO
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                My Evidence Uploads
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.myEvidenceCount}{' '}
                <span className="text-xs font-normal text-slate-500">submissions</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Shared with MYDO Staff</p>
            </div>
          </Link>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-cyan-50 p-2.5 text-cyan-700">
                <Users className="h-5 w-5" />
              </span>
              <Tag color="cyan" className="m-0 text-xs">
                Brgy. {barangayName}
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Verified Youth in Barangay
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.barangayYouthCount}{' '}
                <span className="text-xs font-normal text-slate-500">registered youth</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Approved profiles in {barangayName}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="rounded-lg bg-amber-50 p-2.5 text-amber-700">
                <Award className="h-5 w-5" />
              </span>
              <Tag color="gold" className="m-0 text-xs font-semibold">
                SK Council
              </Tag>
            </div>
            <div className="mt-4">
              <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                Barangay SK Officials
              </span>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {stats.barangaySkCount}{' '}
                <span className="text-xs font-normal text-slate-500">verified officials</span>
              </p>
              <p className="mt-1 text-xs text-slate-500">Active SK accounts in {barangayName}</p>
            </div>
          </div>
        </section>

        {/* MAIN CONTENT GRID */}
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          {/* LEFT: EVENTS FOR EVIDENCE UPLOAD */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-indigo-50 p-2 text-indigo-700">
                  <Camera className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Events & Activities — Upload Evidence</h2>
                  <p className="text-xs text-slate-500">
                    Select an event to upload pictures and descriptions for MYDO Staff review.
                  </p>
                </div>
              </div>

              <Link href={route('sk.events-activities.index')}>
                <Button size="small" type="link" className="!font-semibold !text-indigo-700">
                  View All Events &rarr;
                </Button>
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {upcomingActivities.length > 0 ? (
                upcomingActivities.map((activity) => {
                  const hasUploaded = (activity.my_evidence_count ?? 0) > 0;
                  return (
                    <div
                      key={activity.id}
                      className="flex flex-col justify-between gap-3 rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition-colors hover:border-indigo-300 sm:flex-row sm:items-center"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{activity.title}</h3>
                          {activity.category && (
                            <Tag color="geekblue" className="m-0 text-xs">
                              {activity.category.name}
                            </Tag>
                          )}
                          {hasUploaded && (
                            <Tag color="green" className="m-0 text-xs font-semibold">
                              <CheckCircle2 className="mr-1 inline h-3 w-3" />
                              Evidence Uploaded ({activity.my_evidence_count})
                            </Tag>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3.5 w-3.5 text-indigo-600" />
                            {formatDate(activity.starts_at)}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {activity.venue_name}
                          </span>
                        </div>
                      </div>

                      <Link href={route('sk.events-activities.index')}>
                        <Button
                          size="small"
                          type={hasUploaded ? 'default' : 'primary'}
                          icon={<Camera className="h-3.5 w-3.5" />}
                          className={hasUploaded ? 'font-semibold' : '!bg-indigo-700 hover:!bg-indigo-800 font-semibold'}
                        >
                          {hasUploaded ? 'Add / View Evidence' : 'Upload Pictures'}
                        </Button>
                      </Link>
                    </div>
                  );
                })
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span className="text-xs text-slate-500">No published events yet.</span>}
                  />
                </div>
              )}
            </div>
          </section>

          {/* RIGHT: RECENTLY UPLOADED EVIDENCE */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <span className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
                  <FileImage className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recent Evidence Submitted</h2>
                  <p className="text-xs text-slate-500">Visible to MYDO Staff on the Events page.</p>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              {recentEvidences.length > 0 ? (
                recentEvidences.map((ev) => (
                  <div key={ev.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[11px] font-bold tracking-wider text-indigo-700 uppercase">
                          {ev.activity_category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">{ev.activity_title}</h3>
                      </div>
                      <span className="text-[11px] text-slate-400">{formatDate(ev.created_at)}</span>
                    </div>

                    <p className="text-xs leading-relaxed text-slate-600 line-clamp-2">{ev.description}</p>

                    {ev.photos.length > 0 && (
                      <Image.PreviewGroup>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {ev.photos.map((url, idx) => (
                            <Image
                              key={idx}
                              src={url}
                              alt="Event evidence"
                              width={64}
                              height={64}
                              className="rounded-lg border border-slate-200 object-cover"
                            />
                          ))}
                        </div>
                      </Image.PreviewGroup>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center">
                  <Camera className="mx-auto h-9 w-9 text-slate-300" />
                  <p className="mt-2 text-sm font-semibold text-slate-700">No evidence uploaded yet</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Open any event in Events & Evidence Upload to attach event photos and descriptions.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

SkDashboardPage.layout = (page: ReactNode) => (
  <SkAuthLayout user={(page as ReactElement<SharedData>).props.auth.user as SkUser} header="SK Official Dashboard">
    {page}
  </SkAuthLayout>
);

export default SkDashboardPage;
