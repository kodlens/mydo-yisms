import BrandLogo from '@/components/brand-logo';
import MydoLogo from '@/components/mydo-logo';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Form, Input } from 'antd';
import axios from 'axios';
import {
  ArrowLeft,
  ArrowRight,
  CircleAlert,
  GraduationCap,
  HeartHandshake,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

type LoginProps = {
  email: string;
  password: string;
};

export default function YouthLoginPage() {
  const [errors, setErrors] = useState<Record<string, string | string[]>>({});
  const [loading, setLoading] = useState<boolean>(false);

  const errorMessages = [...new Set(Object.values(errors).flat().filter(Boolean))];

  const submit = async (values: LoginProps) => {
    setErrors({});
    setLoading(true);
    try {
      const { data } = await axios.post('/youth-login', values, {
        headers: { Accept: 'application/json' },
      });
      if (data.success) {
        router.visit(data.redirect);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? { login: 'Please check your login credentials.' });
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrors({ login: 'Invalid email or password. Please verify and try again.' });
      } else {
        setErrors({ login: 'Unable to connect to the portal. Please check your internet connection and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="Youth Portal Sign In - eKabataan MYDO" />

      <main className="min-h-screen bg-[#f8faf8] text-slate-900 antialiased selection:bg-emerald-600 selection:text-white">
        <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1.1fr_490px]">
          {/* Left Institutional Branding & Features Section */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#063b2c] via-[#094735] to-[#04281e] p-12 text-white lg:flex lg:flex-col lg:justify-between">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />

            {/* Top Brand Lockup */}
            <div className="relative z-10">
              <Link href={route('home')} className="inline-flex items-center gap-3 group">
                <div className="flex items-center gap-2.5">
                  <div className="rounded-full bg-white p-1 shadow-sm ring-1 ring-white/30 transition group-hover:ring-emerald-400">
                    <MydoLogo className="h-11 w-11 rounded-full" label="Municipal Youth Development Office Seal" />
                  </div>
                  <div className="h-7 w-px bg-white/20" />
                  <div className="rounded-lg bg-white/10 p-1.5 backdrop-blur-sm transition group-hover:bg-white/20">
                    <BrandLogo className="h-8 w-8" label="eKabataan Portal" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg font-extrabold tracking-tight text-white">eKabataan</span>
                    <span className="rounded-sm bg-emerald-400 px-1.5 py-0.2 text-[10px] font-bold text-emerald-950 uppercase">
                      YIMS
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200">Municipal Youth Development Office</p>
                </div>
              </Link>
            </div>

            {/* Core Message & Value Props */}
            <div className="relative z-10 my-auto max-w-xl py-10">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/60 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-emerald-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                <span>OFFICIAL YOUTH PORTAL ACCESS</span>
              </div>

              <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white xl:text-5xl">
                Welcome back to your municipal youth window.
              </h1>

              <p className="mt-5 text-base leading-relaxed text-emerald-100/90">
                Sign in to manage your unified youth profile, submit scholarship requirements, track educational cash assistance releases, and register for community civic activities.
              </p>

              {/* Feature Cards */}
              <div className="mt-8 space-y-3">
                <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
                    <GraduationCap className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white">Scholarships & Educational Aid</h2>
                    <p className="text-xs text-emerald-200">Track review stages, evaluator remarks, and approved grants</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-400/20 text-teal-300">
                    <HeartHandshake className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white">Youth Volunteer Corps</h2>
                    <p className="text-xs text-emerald-200">Log verified community hours and download certificates</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-sm">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-400/20 text-sky-300">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-white">Protected & Encrypted Portal</h2>
                    <p className="text-xs text-emerald-200">Data Privacy Act of 2012 (RA 10173) compliant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Institutional Info */}
            <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-6 text-xs text-emerald-200/80">
              <span>Republic of the Philippines • MYDO</span>
              <Link href={route('login')} className="font-semibold text-emerald-200 transition hover:text-white">
                Staff / Admin Login &rarr;
              </Link>
            </div>
          </section>

          {/* Right Login Form Section */}
          <section className="flex min-h-screen flex-col justify-between bg-white px-6 py-8 sm:px-10 lg:px-12">
            {/* Top Navigation */}
            <div className="flex items-center justify-between">
              <Link
                href={route('home')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 transition hover:text-emerald-700"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to portal</span>
              </Link>

              <Link
                href={route('youth-register.index')}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-50 hover:border-emerald-300"
              >
                Create Account
              </Link>
            </div>

            {/* Login Box */}
            <div className="mx-auto w-full max-w-sm py-8 sm:py-12">
              {/* Form Header with Dual Logo */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-[#fbfdfa] p-2.5 shadow-2xs">
                  <MydoLogo className="h-10 w-10 rounded-full" label="MYDO Seal" />
                  <div className="h-6 w-px bg-slate-200" />
                  <BrandLogo className="h-8 w-8" label="eKabataan" />
                </div>

                <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-900">
                  Youth Portal Sign In
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                  Enter your registered youth email and password to access your dashboard.
                </p>
              </div>

              {/* Error Notice */}
              {errorMessages.length > 0 && (
                <div
                  id="login-errors"
                  role="alert"
                  aria-atomic="true"
                  className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                >
                  <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold uppercase tracking-wide text-red-900">Sign In Failed</h3>
                    <ul className="mt-1 list-inside list-disc space-y-1 text-xs text-red-700">
                      {errorMessages.map((message) => (
                        <li key={message}>{message}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Ant Design Form with Refined UI */}
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
                  label={<span className="text-xs font-bold text-slate-700">Email Address</span>}
                  rules={[
                    { required: true, message: 'Please enter your registered email' },
                    { type: 'email', message: 'Please enter a valid email address' },
                  ]}
                >
                  <Input
                    size="large"
                    autoComplete="email"
                    placeholder="student@example.com"
                    prefix={<Mail className="h-4 w-4 text-slate-400 mr-1" />}
                    className="rounded-lg border-slate-300 hover:border-emerald-600 focus:border-emerald-600"
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  label={
                    <div className="flex w-full items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Password</span>
                      <Link
                        href={route('password.request')}
                        className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  }
                  rules={[{ required: true, message: 'Please enter your password' }]}
                >
                  <Input.Password
                    size="large"
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    prefix={<LockKeyhole className="h-4 w-4 text-slate-400 mr-1" />}
                    className="rounded-lg border-slate-300 hover:border-emerald-600 focus:border-emerald-600"
                  />
                </Form.Item>

                <div className="mt-6">
                  <Button
                    loading={loading}
                    htmlType="submit"
                    type="primary"
                    size="large"
                    className="flex w-full items-center justify-center gap-2 rounded-lg !bg-emerald-700 font-bold !text-white shadow-sm transition hover:!bg-emerald-800 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
                  >
                    <span>Sign In to Portal</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </Form>

              {/* Register Prompt */}
              <div className="mt-8 rounded-xl border border-slate-200 bg-[#fbfdfa] p-4 text-center">
                <p className="text-xs text-slate-600">
                  Don't have a registered youth profile yet?
                </p>
                <Link
                  href={route('youth-register.index')}
                  className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900"
                >
                  <span>Register your profile in 3 minutes</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>

            {/* Bottom Security Disclaimer */}
            <div className="border-t border-slate-100 pt-4 text-center">
              <p className="text-[11px] text-slate-500">
                Official System of the Municipal Youth Development Office (MYDO).
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
