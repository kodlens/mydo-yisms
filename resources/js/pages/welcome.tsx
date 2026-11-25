import BrandLogo from '@/components/brand-logo';
import MydoLogo from '@/components/mydo-logo';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
  ArrowRight,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileText,
  GraduationCap,
  HandCoins,
  HeartHandshake,
  Info,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  Menu,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';

const portalServices = [
  {
    category: 'Educational Support',
    title: 'Tertiary & Senior High Scholarship',
    description:
      'Submit your application for municipal educational grants. Upload PSA, Certificate of Enrollment (COE), Certificate of Grades (COG), and student ID for evaluation.',
    icon: GraduationCap,
    badge: 'Applications Open',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-100 text-emerald-800',
    link: '#requirements',
  },
  {
    category: 'Financial Assistance',
    title: 'Academic & Honor Cash Incentives',
    description:
      'Cash grants and recognition for honor graduates, board and bar examination topnotchers, and exemplary youth achievers across the municipality.',
    icon: HandCoins,
    badge: 'Annual Grant',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-100 text-amber-800',
    link: '#requirements',
  },
  {
    category: 'Community Engagement',
    title: 'Youth Events & Activities',
    description:
      'Participate in community events/programs, tree-planting drives, leadership summits, disaster preparedness, and youth assemblies organized by MYDO.',
    icon: Users,
    badge: 'Open for Registration',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    iconBg: 'bg-teal-100 text-teal-800',
    link: '#how-it-works',
  },
  {
    category: 'Leadership & Development',
    title: 'Seminars, Camps & Skills Training',
    description:
      'Access free leadership academies, digital literacy bootcamps, technical-vocational workshops, and sports clinics organized by MYDO and partner agencies.',
    icon: CalendarDays,
    badge: 'Year-Round',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    iconBg: 'bg-indigo-100 text-indigo-800',
    link: '#how-it-works',
  },
  {
    category: 'Youth Profiling',
    title: 'Official Youth Registry (YIMS)',
    description:
      'One-time registration capturing educational status, employment, barangay residency, and demographic data compliant with the Philippine Youth Development Plan.',
    icon: Users,
    badge: 'Mandatory',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    iconBg: 'bg-sky-100 text-sky-800',
    link: '#how-it-works',
  },
  {
    category: 'Governance & SK',
    title: 'Sangguniang Kabataan Compliance',
    description:
      'Dedicated reporting channel for SK officials to submit Katipunan ng Kabataan (KK) assembly minutes, Annual Barangay Youth Investment Plans (ABYIP), and project logs.',
    icon: ShieldCheck,
    badge: 'SK Portal',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    iconBg: 'bg-teal-100 text-teal-800',
    link: '#how-it-works',
  },
];

const workflowSteps = [
  {
    step: '01',
    title: 'Create Your Profile',
    description: 'Register with your verified email and complete your personal, address, and educational background once.',
    icon: UserPlus,
  },
  {
    step: '02',
    title: 'Select Portal Service',
    description: 'Explore active scholarship programs, honor incentives, community activities, or document endorsements.',
    icon: FileText,
  },
  {
    step: '03',
    title: 'Upload Requirements',
    description: 'Submit scanned copies or clear photos of required documents (PSA, COE, COG, School ID) securely online.',
    icon: FileCheck2,
  },
  {
    step: '04',
    title: 'Track Evaluation',
    description: 'Receive real-time status updates as MYDO evaluators review your papers and process your benefits.',
    icon: ShieldCheck,
  },
];

const requirementsData = {
  scholarship: {
    title: 'Scholarship & Educational Assistance',
    subtitle: 'For college and senior high school applicants',
    items: [
      { name: 'PSA / NSO Certified Birth Certificate', note: 'Must be clearly readable and valid' },
      { name: 'Certificate of Enrollment (COE) / Registration', note: 'Current semester or academic year' },
      { name: 'Certificate of Grades (COG) / Official Transcript', note: 'Previous semester with general weighted average' },
      { name: 'Valid School ID or Government-Issued ID', note: 'Front and back with signature' },
      { name: 'Barangay Certificate of Residency or Indigency', note: 'Issued within the last 6 months' },
      { name: 'Guardian / Parent Contact Details & Proof of Income', note: 'ITR, Certificate of Low Income, or 4Ps ID if applicable' },
    ],
  },
  incentive: {
    title: 'Academic & Honor Cash Incentives',
    subtitle: 'For honor graduates & professional licensure topnotchers',
    items: [
      { name: 'Official Diploma & Transcript of Records (TOR)', note: 'Must state Latin Honors or Dean’s List distinction' },
      { name: 'PRC / Supreme Court Licensure Rating Card', note: 'For professional board or bar examinees' },
      { name: 'Barangay Certificate of Residency', note: 'Showing minimum 1 year continuous residence' },
      { name: 'Valid Government-Issued ID', note: 'Showing birth date and permanent address' },
    ],
  },
};

export default function Welcome() {
  const { auth } = usePage<SharedData>().props;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    workflow: false,
    scholarship: false,
    incentive: false,
    guidelines: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isYouth = auth.user && auth.user.role === 'youth';
  //const isAdminOrStaff = auth.user && auth.user.role !== 'youth';

  const dashboardRoute = isYouth
    ? route('youth.youth-dashboard.index')
    : route('admin.dashboard.index');

  return (
    <>
      <Head title="eKabataan - Municipal Youth Development Office (MYDO) Portal">
        <meta
          name="description"
          content="Official Public Youth Information and Services Portal of the Municipal Youth Development Office. Access scholarships, cash incentives, and youth development programs."
        />
      </Head>

      <div className="min-h-screen bg-[#f8faf8] text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
        {/* Top Institutional Bar */}
        <div className="border-b border-emerald-950/10 bg-emerald-950 text-xs text-emerald-100">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400"></span>
              <span className="font-semibold tracking-wide uppercase text-white">Republic of the Philippines</span>
              <span className="hidden text-emerald-300/60 md:inline">•</span>
              <span className="hidden text-emerald-200/90 md:inline">Municipal Youth Development Office (MYDO)</span>
            </div>
            <div className="flex items-center gap-4 text-emerald-300/80">
              <span className="hidden sm:inline">Office Hours: Mon–Fri, 8:00 AM – 5:00 PM</span>
              <span className="hidden text-emerald-700 sm:inline">|</span>
              <Link
                href={route('login')}
                className="font-medium text-emerald-200 transition hover:text-white"
                title="Employee and Staff Access"
              >
                Staff Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Sticky Main Navigation */}
        <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
          <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Dual Institutional Branding */}
            <Link href={route('home')} className="group flex items-center gap-3">
              <div className="relative flex items-center gap-2.5">
                {/* Official MYDO Seal */}
                <div className="relative rounded-full bg-white p-0.5 shadow-sm ring-1 ring-slate-200 transition group-hover:ring-emerald-500">
                  <MydoLogo className="h-12 w-12 rounded-full" label="Municipal Youth Development Office Seal" />
                </div>

                <div className="h-8 w-px bg-slate-200"></div>

                {/* eKabataan Brand Emblem */}
                <div className="rounded-lg bg-emerald-50 p-1.5 transition group-hover:bg-emerald-100">
                  <BrandLogo className="h-9 w-9" label="eKabataan Portal Logo" />
                </div>
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-emerald-700">
                    eKabataan
                  </span>
                  <span className="rounded-sm bg-emerald-700 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                    YIMS
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-600">
                  Municipal Youth Development Office
                </p>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden items-center gap-7 lg:flex">
              <a href="#services" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">
                Portal Services
              </a>
              <a href="#how-to-access" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">
                How to Access Services
              </a>
              <a href="#requirements" className="text-sm font-semibold text-slate-600 transition hover:text-emerald-700">
                Document Requirements
              </a>
            </nav>

            {/* Desktop Auth Controls */}
            <div className="hidden items-center gap-3 lg:flex">
              {auth.user ? (
                <Link
                  href={dashboardRoute}
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <>
                  <Link
                    href={route('youth-login.index')}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-emerald-800"
                  >
                    <LockKeyhole className="h-4 w-4 text-emerald-700" />
                    <span>Youth Sign In</span>
                  </Link>
                  <Link
                    href={route('youth-register.index')}
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Register Profile</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle button */}
            <div className="flex items-center lg:hidden">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-slate-100 focus:outline-hidden"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="border-b border-slate-200 bg-white px-4 pb-6 pt-3 lg:hidden">
              <div className="space-y-1">
                <a
                  href="#services"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Portal Services
                </a>
                <a
                  href="#how-to-access"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  How to Access Services
                </a>
                <a
                  href="#requirements"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block rounded-md px-3 py-2 text-base font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
                >
                  Document Requirements
                </a>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4">
                {auth.user ? (
                  <Link
                    href={dashboardRoute}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Go to Dashboard</span>
                  </Link>
                ) : (
                  <div className="grid gap-2">
                    <Link
                      href={route('youth-login.index')}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
                    >
                      <LockKeyhole className="h-4 w-4" />
                      <span>Youth Sign In</span>
                    </Link>
                    <Link
                      href={route('youth-register.index')}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Register Profile</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#093527] via-[#0b4231] to-[#0d4f3b] text-white">
          {/* Subtle Ambient Background Grids & Ornaments */}
          <div className="pointer-events-none absolute inset-0 opacity-15">
            <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-emerald-400 blur-3xl"></div>
            <div className="absolute -bottom-40 -left-40 h-[600px] w-[600px] rounded-full bg-teal-400 blur-3xl"></div>
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
            <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
              {/* Left Column: Government Value Proposition */}
              <div>
                <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-emerald-200 backdrop-blur-md">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400"></span>
                  </span>
                  <span>OFFICIAL PUBLIC YOUTH SERVICES PORTAL</span>
                </div>

                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  Empowering Every Youth in Our Municipality.
                </h1>

                <p className="mt-6 max-w-2xl text-base leading-relaxed text-emerald-100 sm:text-lg">
                  Welcome to <strong className="font-semibold text-white">eKabataan</strong>, the integrated Youth Information Management System managed by the{' '}
                  <strong className="font-semibold text-white">Municipal Youth Development Office (MYDO)</strong>. Apply for scholarships, access academic incentives, and connect with local youth programs online.
                </p>

                {/* Primary Actions */}
                <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
                  <Link
                    href={auth.user ? dashboardRoute : route('youth-register.index')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-400 px-6 py-3.5 text-sm font-bold text-emerald-950 shadow-lg shadow-emerald-950/30 transition hover:bg-white hover:text-emerald-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-300"
                  >
                    <span>{auth.user ? 'Access Youth Dashboard' : 'Register Youth Profile'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href="#services"
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                  >
                    <Search className="h-4 w-4" />
                    <span>Explore Available Services</span>
                  </a>
                </div>

                {/* Institutional Highlights Bar */}
                <div className="mt-12 grid grid-cols-3 gap-4 border-t border-emerald-700/60 pt-8">
                  <div>
                    <div className="text-2xl font-black text-white sm:text-3xl">100%</div>
                    <div className="mt-1 text-xs font-medium text-emerald-200">Paperless Submission</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white sm:text-3xl">Direct</div>
                    <div className="mt-1 text-xs font-medium text-emerald-200">MYDO Evaluation</div>
                  </div>
                  <div>
                    <div className="text-2xl font-black text-white sm:text-3xl">Active</div>
                    <div className="mt-1 text-xs font-medium text-emerald-200">SK & Youth Council</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Official Agency Card featuring the MYDO Logo */}
              <div className="relative">
                <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                  {/* Decorative badge */}
                  <div className="flex items-center justify-between border-b border-white/15 pb-6">
                    <div className="flex items-center gap-3">
                      {/* MYDO Seal Featured */}
                      <div className="rounded-full bg-white p-2 shadow-md ring-2 ring-emerald-400/40">
                        <MydoLogo className="h-14 w-14 rounded-full" label="Municipal Youth Development Office" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold tracking-wider uppercase text-emerald-300">
                          Republic of the Philippines
                        </div>
                        <h2 className="text-base font-bold text-white">
                          Municipal Youth Development Office
                        </h2>
                        <p className="text-xs text-emerald-100">Official Portal Desk</p>
                      </div>
                    </div>
                    <span className="hidden rounded-full bg-emerald-500/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-400/30 sm:inline-block">
                      AY 2026–2027
                    </span>
                  </div>

                  {/* Portal Status Feed */}
                  <div className="mt-6 space-y-3">
                    <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                            <GraduationCap className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-white">Tertiary Scholarship Program</p>
                            <p className="text-[11px] text-emerald-200">Digital application & requirements</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                          ACTIVE
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                            <HandCoins className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-white">Honor Graduate Cash Grant</p>
                            <p className="text-[11px] text-emerald-200">Incentive filing for achievers</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-200">
                          OPEN
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/10 p-3.5 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-400/20 text-teal-300">
                            <HeartHandshake className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="text-xs font-semibold text-white">Community Youth Programs</p>
                            <p className="text-[11px] text-emerald-200">Events, camps & workshops</p>
                          </div>
                        </div>
                        <span className="rounded-md bg-teal-400/20 px-2 py-0.5 text-[10px] font-bold text-teal-200">
                          ONGOING
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trust Footer */}
                  <div className="mt-6 flex items-center justify-between rounded-lg bg-black/20 px-4 py-3 text-xs text-emerald-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-400" />
                      <span>Data Privacy Act of 2012 Compliant</span>
                    </div>
                    <span className="font-semibold text-white">No Middlemen</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK PILLARS BANNER */}
        <section className="relative -mt-6 z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-lg md:grid-cols-4">
            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                <UserCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-wide uppercase text-slate-500">Registry</p>
                <p className="text-sm font-bold text-slate-900">One Youth Profile</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
                <FileCheck2 className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-wide uppercase text-slate-500">Fast & Paperless</p>
                <p className="text-sm font-bold text-slate-900">Online Documents</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 border-b border-slate-100 pb-3 md:border-b-0 md:border-r md:pb-0 md:pr-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-wide uppercase text-slate-500">Fair Assistance</p>
                <p className="text-sm font-bold text-slate-900">Merit & Need Based</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs font-bold tracking-wide uppercase text-slate-500">Accountability</p>
                <p className="text-sm font-bold text-slate-900">MYDO Verified</p>
              </div>
            </div>
          </div>
        </section>

        {/* PORTAL SERVICES MATRIX */}
        <section id="services" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-bold tracking-wider uppercase text-emerald-700">
                <Sparkles className="h-4 w-4" />
                <span>Municipal Youth Catalog</span>
              </div>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Official Portal Services
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
                All programs are administered by the Municipal Youth Development Office under the Local Youth Development Plan (LYDP).
              </p>
            </div>

            <Link
              href={auth.user ? dashboardRoute : route('youth-register.index')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              <span>{auth.user ? 'Open Services Menu' : 'Get Started Now'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {portalServices.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.title}
                  className="group relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-6 shadow-xs transition duration-200 hover:-translate-y-1 hover:border-emerald-500/50 hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`flex h-12 w-12 items-center justify-center rounded-lg ${service.iconBg}`}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${service.badgeColor}`}>
                        {service.badge}
                      </span>
                    </div>

                    <p className="mt-4 text-xs font-bold tracking-wide uppercase text-slate-500">
                      {service.category}
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-slate-900 group-hover:text-emerald-700">
                      {service.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {service.description}
                    </p>
                  </div>

                  <div className="mt-6 border-t border-slate-100 pt-4">
                    <a
                      href={service.link}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 transition group-hover:text-emerald-800"
                    >
                      <span>View details & requirements</span>
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HOW TO ACCESS SERVICES & DOCUMENT PREPARATION ACCORDION */}
        <section id="how-to-access" className="border-y border-slate-200 bg-[#f1f5ee] py-20">
          <div id="requirements" className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <span className="text-xs font-bold tracking-wider uppercase text-emerald-700">
                Application Guide & Document Checklist
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                How to Access Services Online & What to Prepare
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
                Follow our official municipal workflow and prepare all required documentary attachments for fast evaluation.
              </p>
            </div>

            <div className="mt-12 space-y-4">
              {/* Accordion 1: How to Access Services Online */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300">
                <button
                  type="button"
                  onClick={() => toggleAccordion('workflow')}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition hover:bg-slate-50/80"
                  aria-expanded={openAccordions.workflow}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs">
                      <UserPlus className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                          How to Access Services Online
                        </h3>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          4 Steps
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        Step-by-step workflow to register, select programs, and track results
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      openAccordions.workflow ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>

                {openAccordions.workflow && (
                  <div className="border-t border-slate-100 bg-[#fbfcfb] p-5 sm:p-7">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                      {workflowSteps.map((step) => {
                        const Icon = step.icon;

                        return (
                          <div
                            key={step.step}
                            className="relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs transition hover:border-emerald-300"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-800">
                                  <Icon className="h-5 w-5" />
                                </span>
                                <span className="text-xl font-black text-slate-300">
                                  {step.step}
                                </span>
                              </div>

                              <h4 className="mt-3 text-sm font-bold text-slate-900">
                                {step.title}
                              </h4>
                              <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                                {step.description}
                              </p>
                            </div>

                            <div className="mt-4 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>Step {step.step}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-xl border border-emerald-200/70 bg-emerald-50/50 p-4 sm:flex-row sm:px-5">
                      <div className="flex items-center gap-2.5 text-xs text-emerald-950">
                        <Sparkles className="h-4 w-4 text-emerald-700 shrink-0" />
                        <span>Ready to establish your record? Registration takes only 3 minutes.</span>
                      </div>
                      <Link
                        href={auth.user ? dashboardRoute : route('youth-register.index')}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-800"
                      >
                        <span>{auth.user ? 'Open Dashboard' : 'Register Profile'}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 2: What to Prepare: Scholarship & Educational Assistance */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300">
                <button
                  type="button"
                  onClick={() => toggleAccordion('scholarship')}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition hover:bg-slate-50/80"
                  aria-expanded={openAccordions.scholarship}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-2xs">
                      <GraduationCap className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                          What to Prepare: Scholarship & Educational Assistance
                        </h3>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                          6 Documents
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        Required documents for tertiary and senior high school applicants
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      openAccordions.scholarship ? 'rotate-180 text-emerald-700' : ''
                    }`}
                  />
                </button>

                {openAccordions.scholarship && (
                  <div className="border-t border-slate-100 bg-[#fbfcfb] p-5 sm:p-7">
                    <p className="mb-4 text-xs text-slate-600 sm:text-sm">
                      Prepare clear scanned copies or readable photos of these 6 attachments before starting your scholarship application:
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {requirementsData.scholarship.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-start gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition hover:border-emerald-300 hover:bg-emerald-50/20"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 sm:text-sm">{item.name}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{item.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 3: What to Prepare: Academic & Honor Cash Grants */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300">
                <button
                  type="button"
                  onClick={() => toggleAccordion('incentive')}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition hover:bg-slate-50/80"
                  aria-expanded={openAccordions.incentive}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800 shadow-2xs">
                      <Award className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                          What to Prepare: Academic & Honor Cash Incentives
                        </h3>
                        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 border border-amber-200">
                          4 Documents
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        Required documents for honor graduates and licensure examination topnotchers
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      openAccordions.incentive ? 'rotate-180 text-amber-700' : ''
                    }`}
                  />
                </button>

                {openAccordions.incentive && (
                  <div className="border-t border-slate-100 bg-[#fbfcfb] p-5 sm:p-7">
                    <p className="mb-4 text-xs text-slate-600 sm:text-sm">
                      Attach certified proof of your academic distinction or board / bar examination rating:
                    </p>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {requirementsData.incentive.items.map((item) => (
                        <div
                          key={item.name}
                          className="flex items-start gap-3 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs transition hover:border-amber-300 hover:bg-amber-50/20"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 sm:text-sm">{item.name}</p>
                            <p className="mt-0.5 text-[11px] text-slate-500 sm:text-xs">{item.note}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Accordion 4: Document Upload Standards & Fast Approval Tips */}
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:border-slate-300">
                <button
                  type="button"
                  onClick={() => toggleAccordion('guidelines')}
                  className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 text-left transition hover:bg-slate-50/80"
                  aria-expanded={openAccordions.guidelines}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800 shadow-2xs">
                      <FileCheck2 className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900 sm:text-lg">
                          Document Upload Standards & Tips for Fast Approval
                        </h3>
                        <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700 border border-teal-200">
                          Guidelines
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                        File format guidelines, resolution standards, and scanning assistance
                      </p>
                    </div>
                  </div>

                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
                      openAccordions.guidelines ? 'rotate-180 text-teal-700' : ''
                    }`}
                  />
                </button>

                {openAccordions.guidelines && (
                  <div className="border-t border-slate-100 bg-[#fbfcfb] p-5 sm:p-7">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">File Formats</p>
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                          Accepted formats are <strong>PDF, JPG, or PNG</strong>. Keep each file under <strong>5MB</strong> in size.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Legibility</p>
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                          Ensure dry seals, registrar signatures, and grades are clearly visible and uncropped to avoid review delays.
                        </p>
                      </div>

                      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Avoid Rejection</p>
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                          Avoid blurry camera shots, dark shadows, or cropped margins. Evaluators may ask for resubmission if text is unreadable.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 flex items-start gap-3 shadow-2xs">
                      <Info className="h-4 w-4 text-emerald-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-900">Need free scanning assistance?</span> You may visit the MYDO counter at the Municipal Hall during regular office hours (Mon–Fri, 8:00 AM – 5:00 PM) for free document scanning and submission assistance.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Registration Callout Banner */}
            {/* <div className="mt-12 rounded-2xl bg-emerald-800 p-8 text-white shadow-xl shadow-emerald-950/10 sm:p-10">
              <div className="flex flex-col items-center justify-between gap-6 lg:flex-row">
                <div className="max-w-2xl text-center lg:text-left">
                  <div className="flex items-center justify-center gap-2 lg:justify-start">
                    <MydoLogo className="h-8 w-8 rounded-full bg-white p-0.5" />
                    <span className="text-xs font-bold tracking-wider uppercase text-emerald-200">
                      Municipal Youth Development Office
                    </span>
                  </div>
                  <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                    Ready to submit your youth scholarship or profile?
                  </h3>
                  <p className="mt-2 text-sm text-emerald-100">
                    Registration takes only 3 minutes. Your youth account remains valid for all subsequent semesters and programs.
                  </p>
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                  <Link
                    href={auth.user ? dashboardRoute : route('youth-register.index')}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3.5 text-sm font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
                  >
                    <span>{auth.user ? 'Open Portal Dashboard' : 'Register Profile Now'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  {!auth.user && (
                    <Link
                      href={route('youth-login.index')}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/40 bg-emerald-900/50 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900"
                    >
                      <LockKeyhole className="h-4 w-4" />
                      <span>Sign In</span>
                    </Link>
                  )}
                </div>
              </div>
            </div> */}

            {/* Assistance Contact Bar */}
            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Phone className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">Need assistance or have inquiries?</p>
                  <p className="text-sm font-bold text-slate-900">Contact the MYDO Youth Helpdesk</p>
                </div>
              </div>
              <div className="text-xs text-slate-600 sm:text-right">
                <p className="font-semibold text-slate-900">Email: mydo@municipality.gov.ph</p>
                <p>Municipal Hall Ground Floor • Youth Development Office</p>
              </div>
            </div>
          </div>
        </section>

        {/* COMPREHENSIVE GOVERNMENT FOOTER */}
        <footer className="border-t border-slate-300/80 bg-slate-950 text-slate-300">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
              {/* Institutional Column with both logos */}
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white p-1 shadow-xs">
                    <MydoLogo className="h-12 w-12 rounded-full" label="Municipal Youth Development Office Seal" />
                  </div>
                  <div className="h-8 w-px bg-slate-700"></div>
                  <div className="rounded-md bg-white p-1">
                    <BrandLogo className="h-10 w-10" label="eKabataan Portal" />
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-base font-bold text-white">
                    Municipal Youth Development Office
                  </p>
                  <p className="text-xs text-emerald-400">
                    Republic of the Philippines
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    The official digital portal for municipal youth profiling, scholarship distribution, leadership training, and Sangguniang Kabataan coordination.
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
                  <MapPin className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>Municipal Youth Development Office, Municipal Hall Complex</span>
                </div>
              </div>

              {/* Portal Links */}
              <div>
                <p className="text-xs font-bold tracking-wider uppercase text-white">
                  Portal Services
                </p>
                <ul className="mt-4 space-y-2.5 text-xs">
                  <li>
                    <a href="#services" className="transition hover:text-emerald-400">
                      Tertiary Scholarship
                    </a>
                  </li>
                  <li>
                    <a href="#services" className="transition hover:text-emerald-400">
                      Honor Cash Grants
                    </a>
                  </li>
                  <li>
                    <a href="#services" className="transition hover:text-emerald-400">
                      Youth Programs & Events
                    </a>
                  </li>
                  <li>
                    <a href="#services" className="transition hover:text-emerald-400">
                      Youth Leadership Training
                    </a>
                  </li>
                  <li>
                    <a href="#services" className="transition hover:text-emerald-400">
                      SK Compliance Hub
                    </a>
                  </li>
                </ul>
              </div>

              {/* Quick Navigation */}
              <div>
                <p className="text-xs font-bold tracking-wider uppercase text-white">
                  Quick Access
                </p>
                <ul className="mt-4 space-y-2.5 text-xs">
                  <li>
                    <Link href={route('youth-login.index')} className="transition hover:text-emerald-400">
                      Youth Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href={route('youth-register.index')} className="transition hover:text-emerald-400">
                      Create Youth Account
                    </Link>
                  </li>
                  <li>
                    <a href="#how-to-access" className="transition hover:text-emerald-400">
                      How to Access Services
                    </a>
                  </li>
                  <li>
                    <a href="#requirements" className="transition hover:text-emerald-400">
                      Document Requirements
                    </a>
                  </li>
                  <li>
                    <Link href={route('login')} className="transition hover:text-emerald-400">
                      Staff / Administrator Login
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Government Transparency & Compliance */}
              <div>
                <p className="text-xs font-bold tracking-wider uppercase text-white">
                  Legal & Compliance
                </p>
                <div className="mt-4 space-y-2.5 text-xs text-slate-400">
                  <p>Republic Act No. 10742 (Sangguniang Kabataan Reform Act)</p>
                  <p>Republic Act No. 10173 (Data Privacy Act of 2012)</p>
                  <p>Republic Act No. 11032 (Ease of Doing Business)</p>
                  <div className="pt-2">
                    <span className="inline-block rounded-md bg-emerald-950 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 ring-1 ring-emerald-800">
                      Philippine Transparency Seal
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Disclaimer */}
            <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-center text-xs text-slate-400 sm:flex-row sm:text-left">
              <p>
                © {new Date().getFullYear()} Municipal Youth Development Office (MYDO). All rights reserved.
              </p>
              <div className="flex items-center gap-3">
                <span className="text-emerald-400">eKabataan YIMS v2.0</span>
                <span>•</span>
                <span>An Official Local Government Unit System</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
