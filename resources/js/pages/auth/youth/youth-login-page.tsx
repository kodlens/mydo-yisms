import BrandLogo from '@/components/brand-logo';
import { Head, Link, router } from '@inertiajs/react';
import { Button, Form, Input } from 'antd';
import axios from 'axios';
import { ArrowLeft, BookOpen, CircleAlert, ClipboardList, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
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
      if (data.success) router.visit(data.redirect);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 422) {
        setErrors(error.response.data.errors ?? { login: 'Please check your login details.' });
      } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        setErrors({ login: 'Invalid email or password. Please try again.' });
      } else {
        setErrors({ login: 'Unable to sign in right now. Check your connection and try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head title="Youth Login" />

      <main className="min-h-screen bg-[#f7f9f5] text-slate-950">
        <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1fr_520px]">
          <section className="hidden bg-emerald-800 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
            <Link href={route('home')} className="inline-flex w-fit items-center gap-3">
              <BrandLogo className="h-12 w-12 rounded-md bg-white p-1" />
              <span>
                <span className="block text-sm font-bold tracking-wide text-white">eKabataan</span>
                <span className="block text-xs text-emerald-100">Youth and Scholarship Portal</span>
              </span>
            </Link>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-50">
                <ClipboardList className="h-4 w-4" />
                Youth Services Access
              </div>

              <h1 className="text-5xl leading-tight font-bold">Welcome back to your youth portal.</h1>

              <p className="mt-5 text-lg leading-8 text-emerald-50">
                Sign in to update your youth profile, apply for services, upload requirements when needed, and check notices from the
                Municipal Youth Development Office.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md bg-white/10 p-4">
                <BookOpen className="h-5 w-5 text-emerald-100" />
                <p className="mt-3 text-sm font-semibold">Application Status</p>
              </div>
              <div className="rounded-md bg-white/10 p-4">
                <ShieldCheck className="h-5 w-5 text-emerald-100" />
                <p className="mt-3 text-sm font-semibold">Secure Documents</p>
              </div>
              <div className="rounded-md bg-white/10 p-4">
                <LockKeyhole className="h-5 w-5 text-emerald-100" />
                <p className="mt-3 text-sm font-semibold">
                  <Link href={'/login'} className="font-semibold text-white hover:text-blue-300">
                    System Management
                  </Link>
                </p>
              </div>
            </div>
          </section>

          <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-12">
            <div className="flex items-center justify-between">
              <Link
                href={route('home')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to portal
              </Link>

              <Link href={route('youth-register.index')} className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                Register
              </Link>
            </div>

            <div className="flex flex-1 items-center justify-center py-10">
              <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-900/10 sm:p-8">
                <div className="mb-8 text-center">
                  <BrandLogo className="mx-auto h-16 w-16" />
                  <h2 className="mt-5 text-2xl font-bold text-slate-950">Youth Login</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Access your youth profile and available MYDO services.</p>
                </div>

                {errorMessages.length > 0 && (
                  <div
                    id="login-errors"
                    role="alert"
                    aria-atomic="true"
                    className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  >
                    <CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-red-900">Unable to sign in</h3>
                      <ul className="mt-1 list-inside list-disc space-y-1 text-sm leading-5 text-red-700">
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
                  initialValues={{
                    email: '',
                    password: '',
                  }}
                >
                  <Form.Item name="email" label={<span className="font-semibold">Username</span>}>
                    <Input
                      autoComplete="username"
                      aria-invalid={Boolean(errors.email || errors.login)}
                      aria-describedby={errorMessages.length ? 'login-errors' : undefined}
                      placeholder="email@example.com"
                      prefix={<Mail className="h-4 w-4 text-slate-400" />}
                    />
                  </Form.Item>

                  <Form.Item name="password" label={<span className="font-semibold">Password</span>}>
                    <Input.Password
                      autoComplete="current-password"
                      aria-invalid={Boolean(errors.password || errors.login)}
                      aria-describedby={errorMessages.length ? 'login-errors' : undefined}

                      placeholder="Enter your password"
                      prefix={<LockKeyhole className="h-4 w-4 text-slate-400" />}
                    />
                  </Form.Item>
                  <div className="mb-5">
                    <Link
                      href={route('password.request')}
                      className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <Button
                    loading={loading}
                    htmlType="submit"
                    type="primary"
                    className="w-full bg-emerald-700 text-white hover:bg-emerald-800"
                  >
                    Sign in
                  </Button>
                </Form>

                <div className="mt-6">
                  <p className="text-center text-sm text-slate-600">
                    New here?{' '}
                    <Link href={route('youth-register.index')} className="font-semibold text-emerald-700 hover:text-emerald-900">
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
