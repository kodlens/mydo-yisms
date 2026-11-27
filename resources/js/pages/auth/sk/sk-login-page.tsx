import BrandLogo from '@/components/brand-logo';
import MydoLogo from '@/components/mydo-logo';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Form, Input } from 'antd';
import axios from 'axios';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

type LoginProps = {
  email: string;
  password: string;
};

export default function SkLoginPage() {
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const errorMessages = [...new Set(Object.values(errors).flat().filter(Boolean))];

  const submit = async (values: LoginProps) => {
    setErrors({});
    setErrorStatus(null);
    setLoading(true);
    try {
      const { data } = await axios.post('/sk-login', values, {
        headers: { Accept: 'application/json' },
      });
      if (data.success) {
        router.visit(data.redirect);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? { login: 'Please check your login credentials.' });
      } else if (axios.isAxiosError(error) && error.response?.status === 403) {
        const msg = error.response.data?.message || 'Access denied.';
        setErrorStatus(error.response.data?.status || 'denied');
        setErrors({ login: msg });
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrors({ login: 'Invalid email or password. Please verify and try again.' });
      } else {
        setErrors({ login: 'Unable to connect to the SK portal. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="SK Official Sign In - eKabataan MYDO" />

      <main className="min-h-screen bg-[#f8fafc] text-slate-900 antialiased selection:bg-indigo-600 selection:text-white">
        <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.1fr_510px]">
          {/* Left Institutional Branding Section */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-400/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative z-10">
              <Link href={route('home')} className="group inline-flex items-center gap-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-full bg-white p-1 shadow-md ring-2 ring-indigo-400/30 transition group-hover:ring-indigo-400">
                    <MydoLogo className="h-12 w-12 rounded-full" label="Municipal Youth Development Office Seal" />
                  </div>
                  <div className="h-7 w-px bg-white/20" />
                  <div className="rounded-xl bg-white/10 p-2 backdrop-blur-sm transition group-hover:bg-white/20">
                    <BrandLogo className="h-8 w-8" label="eKabataan Portal" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xl font-black tracking-tight text-white">eKabataan</span>
                    <span className="rounded-sm bg-amber-400 px-1.5 py-0.2 text-[10px] font-extrabold text-indigo-950 uppercase">
                      SK PORTAL
                    </span>
                  </div>
                  <p className="text-xs font-medium text-indigo-200">Sangguniang Kabataan Governance Desk</p>
                </div>
              </Link>
            </div>

            <div className="relative z-10 my-auto max-w-xl py-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-950/70 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-amber-200 backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4 text-amber-300" />
                <span>SANGGUNIANG KABATAAN OFFICIAL ACCESS</span>
              </div>

              <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-white xl:text-5xl">
                Barangay SK Activity & Evidence Portal.
              </h1>

              <p className="mt-5 text-base leading-relaxed text-indigo-100/90">
                Sign in with your verified SK Official account to view municipal and barangay youth events, upload event
                pictures and accomplishment descriptions, and submit compliance records to MYDO.
              </p>

              <div className="mt-8 space-y-3.5">
                <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-400/20 text-amber-300">
                    <Camera className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white">Event Pictures & Evidence Submission</h2>
                    <p className="text-xs text-indigo-200">
                      Upload photo documentation and narrative descriptions for events and activities
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-400/20 text-indigo-300">
                    <Award className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white">Direct MYDO Staff Verification</h2>
                    <p className="text-xs text-indigo-200">
                      Uploaded SK event evidence is immediately visible to MYDO evaluators
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-indigo-200/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-amber-400" />
                <span>Republic of the Philippines • MYDO</span>
              </div>
              <Link href={route('youth-login.index')} className="font-semibold text-indigo-200 transition hover:text-white">
                Youth / Student Login &rarr;
              </Link>
            </div>
          </section>

          {/* Right Login Form Section */}
          <section className="flex min-h-screen flex-col justify-between bg-white px-6 py-8 sm:px-10 lg:px-12">
            <div>
              <div className="flex items-center justify-between">
                <Link
                  href={route('home')}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-indigo-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to portal</span>
                </Link>

                <Link
                  href={route('sk-register.index')}
                  className="rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-1.5 text-xs font-bold text-indigo-800 transition hover:bg-indigo-100"
                >
                  Register as SK Official
                </Link>
              </div>
            </div>

            <div className="mx-auto w-full max-w-sm py-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 shadow-2xs">
                  <div className="rounded-full bg-white p-0.5 shadow-2xs">
                    <MydoLogo className="h-10 w-10 rounded-full" label="MYDO Seal" />
                  </div>
                  <div className="h-7 w-px bg-slate-200" />
                  <div className="rounded-lg bg-indigo-50 p-1">
                    <BrandLogo className="h-8 w-8" label="eKabataan" />
                  </div>
                </div>

                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Sangguniang Kabataan Portal
                </div>

                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">SK Official Sign In</h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Access your barangay SK dashboard and upload event documentation.
                </p>
              </div>

              {errorMessages.length > 0 && (
                <div
                  role="alert"
                  className={`mt-6 flex items-start gap-3 rounded-xl border p-4 ${
                    errorStatus === 'pending' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  {errorStatus === 'pending' ? (
                    <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  ) : (
                    <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  )}
                  <div className="min-w-0">
                    <h3
                      className={`text-xs font-bold tracking-wide uppercase ${
                        errorStatus === 'pending' ? 'text-amber-900' : 'text-red-900'
                      }`}
                    >
                      {errorStatus === 'pending' ? 'SK Account Pending Approval' : 'Sign In Notice'}
                    </h3>
                    <ul
                      className={`mt-1 list-inside list-disc space-y-1 text-xs ${
                        errorStatus === 'pending' ? 'text-amber-800' : 'text-red-700'
                      }`}
                    >
                      {errorMessages.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <Form
                onFinish={submit}
                layout="vertical"
                className="mt-6"
                initialValues={{
                  email: '',
                  password: '',
                }}
              >
                <Form.Item
                  name="email"
                  label={<span className="text-xs font-bold text-slate-700">Registered SK Email Address</span>}
                  rules={[
                    { required: true, message: 'Please enter your registered email' },
                    { type: 'email', message: 'Please enter a valid email address' },
                  ]}
                  className="mb-4"
                >
                  <Input
                    size="large"
                    autoComplete="email"
                    placeholder="sk.official@example.com"
                    prefix={<Mail className="mr-2 h-4 w-4 text-slate-400" />}
                    className="!h-11 rounded-lg border-slate-300 text-sm"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={<span className="text-xs font-bold text-slate-700">Password</span>}
                  rules={[{ required: true, message: 'Please enter your password' }]}
                  className="mb-5"
                >
                  <Input.Password
                    size="large"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    prefix={<LockKeyhole className="mr-2 h-4 w-4 text-slate-400" />}
                    className="!h-11 rounded-lg border-slate-300 text-sm"
                  />
                </Form.Item>

                <Button
                  loading={loading}
                  htmlType="submit"
                  type="primary"
                  size="large"
                  className="group flex !h-11 w-full items-center justify-center gap-2 rounded-lg !bg-indigo-700 font-bold !text-white shadow-sm transition hover:!bg-indigo-800"
                >
                  <span>Sign In to SK Portal</span>
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </Button>
              </Form>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 text-center">
                  <p className="text-xs text-slate-600">Not yet registered as a Barangay SK Official?</p>
                  <Link
                    href={route('sk-register.index')}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-900"
                  >
                    <span>Register SK Official Account</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="text-center">
                  <Link
                    href={route('youth-login.index')}
                    className="text-xs font-semibold text-slate-500 hover:text-emerald-700"
                  >
                    Are you a College Youth / Student? Sign in here &rarr;
                  </Link>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 text-center">
              <p className="text-[11px] text-slate-500">
                Official System of the Municipal Youth Development Office (MYDO) • RA 10742 & RA 10173
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
