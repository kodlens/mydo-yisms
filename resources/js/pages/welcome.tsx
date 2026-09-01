import BrandLogo from '@/components/brand-logo';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  FileText,
  GraduationCap,
  HandCoins,
  LockKeyhole,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';

const systemModules = [
  {
    title: 'Create Your Youth Profile',
    description: 'Register your basic information, school details, barangay, and current youth status.',
    icon: Users,
    accent: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Apply for Scholarship',
    description: 'Submit your application and upload requirements such as PSA, COG, COE, and school ID.',
    icon: GraduationCap,
    accent: 'bg-sky-100 text-sky-700',
  },
  {
    title: 'Track Cash Incentives',
    description: 'View assistance release updates once you become an approved beneficiary.',
    icon: HandCoins,
    accent: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Join Volunteer Activities',
    description: 'Sign up for youth activities and keep a record of your attendance and service hours.',
    icon: ClipboardCheck,
    accent: 'bg-rose-100 text-rose-700',
  },
  {
    title: 'Discover Youth Programs',
    description: 'Stay updated on seminars, trainings, youth camps, and community programs.',
    icon: CalendarDays,
    accent: 'bg-indigo-100 text-indigo-700',
  },
  {
    title: 'Submit SK Reports',
    description: 'SK officials can upload activity reports, documents, and KK Assembly updates.',
    icon: ShieldCheck,
    accent: 'bg-teal-100 text-teal-700',
  },
];

const workflowItems = [
  { label: 'Register and complete your profile', description: 'Create your applicant account, then add personal, address, and guardian details.', icon: Users },
  { label: 'Add your education details', description: 'Provide your school, course or program, and current year level.', icon: FileText },
  { label: 'Upload required documents', description: 'Attach clear copies of your registration certificate and PSA birth certificate.', icon: GraduationCap },
  { label: 'Submit for MYDO review', description: 'MYDO staff will review your application and update your status after checking.', icon: ShieldCheck },
];

const requirements = [
  'PSA birth certificate',
  'Certificate of Registration',
  'Active email address',
  'Guardian contact information',
];

export default function Welcome() {
  const { auth } = usePage<SharedData>().props;

  return (
    <>
      <Head title="eKabataan">
        {/* <link rel="preconnect" href="https://fonts.bunny.net" />
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" /> */}
      </Head>

      <main className="min-h-screen bg-[#f7f9f5] text-slate-950">
        <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href={route('home')} className="flex items-center gap-3">
            <BrandLogo className="h-12 w-12" />
            <span>
              <span className="block text-sm font-bold tracking-wide text-slate-950">eKabataan</span>
              <span className="block text-xs text-slate-600">Youth and Scholarship Portal</span>
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {auth.user ? (
              <Link
                href={route('dashboard')}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
              >
                <BarChart3 className="h-4 w-4" />
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href={route('student-login')}
                  className="inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
                >
                  <LockKeyhole className="h-4 w-4" />
                  Log in
                </Link>
                <Link
                  href={route('student-register')}
                  className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 sm:inline-flex"
                >
                  Apply Now
                </Link>
              </>
            )}
          </nav>
        </header>

        <section className="mx-auto w-full max-w-7xl px-6 pb-10 pt-6 lg:px-8 lg:pb-16">
          <div className="grid overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-xl shadow-emerald-900/10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-emerald-800 px-6 py-10 text-white sm:px-10 lg:px-12 lg:py-16">
              <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-50">
                <MapPin className="h-4 w-4" />
                Municipal Youth Development Office
              </div>

              <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Start your scholarship application here.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-emerald-50 sm:text-lg">
                Create your applicant account, complete your youth profile, upload your scholarship requirements, and
                receive MYDO updates through your account.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Link
                  href={auth.user ? route('dashboard') : route('student-register')}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-bold text-emerald-900 shadow-sm transition hover:bg-emerald-50"
                >
                  {auth.user ? 'Continue Application' : 'Apply for Scholarship'}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#how-to-apply"
                  className="inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:bg-white/10"
                >
                  <ClipboardList className="h-4 w-4" />
                  View requirements first
                </a>
              </div>

              <p className="mt-3 text-sm text-emerald-100">Takes around 5-10 minutes if your documents are ready.</p>

              <div className="mt-10 grid gap-3 sm:grid-cols-3">
                <div className="rounded-md bg-white/10 p-4">
                  <p className="text-2xl font-bold">1</p>
                  <p className="mt-1 text-sm text-emerald-50">Youth profile for all services</p>
                </div>
                <div className="rounded-md bg-white/10 p-4">
                  <p className="text-2xl font-bold">Online</p>
                  <p className="mt-1 text-sm text-emerald-50">Document submission</p>
                </div>
                <div className="rounded-md bg-white/10 p-4">
                  <p className="text-2xl font-bold">MYDO</p>
                  <p className="mt-1 text-sm text-emerald-50">Application review</p>
                </div>
              </div>
            </div>

            <aside className="flex flex-col justify-center bg-[#fbfcf8] px-6 py-8 sm:px-10 lg:px-12">
              <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-md bg-sky-100 text-sky-700">
                    <GraduationCap className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold uppercase text-sky-700">Scholarship Registration</p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-950">Prepare your documents</h2>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {requirements.map((requirement) => (
                    <div key={requirement} className="flex items-center gap-3 text-sm text-slate-700">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{requirement}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-md bg-amber-50 p-4 text-sm leading-6 text-amber-900">
                  Make sure your uploaded files are clear and readable before submitting your application.
                </div>

                <a href="#how-to-apply" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  See application steps
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </aside>
          </div>
        </section>

        <section id="how-to-apply" className="mx-auto w-full max-w-7xl px-6 pb-14 lg:px-8">
          <div className="mb-6 flex flex-col justify-between gap-3 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase text-emerald-700">How To Apply</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Prepare first, then submit once.</h2>
            </div>
            <Link
              href={auth.user ? route('dashboard') : route('student-register')}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
            >
              {auth.user ? 'Continue Application' : 'Start Application'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {workflowItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <article key={item.label} className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-sm font-bold text-slate-400">0{index + 1}</span>
                  </div>
                  <h2 className="mt-4 text-lg font-semibold text-slate-950">{item.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section id="modules" className="border-y border-slate-200 bg-white py-14">
          <div className="mx-auto w-full max-w-7xl px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase text-emerald-700">Portal Services</p>
              <h2 className="mt-2 text-3xl font-bold text-slate-950">Everything starts with one youth profile.</h2>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {systemModules.map((module) => {
                const Icon = module.icon;

                return (
                  <article key={module.title} className="rounded-lg border border-slate-200 bg-[#fbfcf8] p-5">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-md ${module.accent}`}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{module.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
