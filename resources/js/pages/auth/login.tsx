import BrandLogo from '@/components/brand-logo';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { LockOutlined, SafetyCertificateOutlined, UserOutlined } from '@ant-design/icons';
import { Head, useForm } from '@inertiajs/react';
import { Alert, Button, Input } from 'antd';
import { FormEventHandler } from 'react';

type LoginForm = {
  username: string;
  password: string;
  remember: boolean;
};

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const { data, setData, post, processing, errors } = useForm<LoginForm>({
    username: '',
    password: '',
    remember: false,
  });


  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), {
      onFinish: () => {

      },
      onError: () => {
        if (errors) {
          errors.username = "An error occurred. Please try again.";
        }
      },
    });
  };

  return (
    <>
      <Head title="Log in" />

      <div className="min-h-svh bg-[#eef1ee]">
        <div className="grid min-h-svh lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative hidden overflow-hidden bg-[#1f2933] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(245,158,11,0.22),transparent_28%),radial-gradient(circle_at_84%_78%,rgba(22,101,52,0.34),transparent_34%),linear-gradient(135deg,#1f2933_0%,#263238_48%,#17212b_100%)]" />
            <div className="relative flex items-center gap-3">
              <BrandLogo className="h-12 w-12 rounded bg-white p-1" />
              <div>
                <p className="text-lg font-semibold">E-Kabataan</p>
                <p className="text-sm text-amber-100/80">MYDO management portal</p>
              </div>
            </div>

            <div className="relative max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-100/25 bg-white/10 px-3 py-1 text-sm text-amber-50">
                <SafetyCertificateOutlined />
                Authorized personnel
              </div>
              <h1 className="text-4xl font-semibold leading-tight">Review youth applications with a focused workspace.</h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-stone-100/78">
                Staff and administrators can manage applicant records, verify documents, and monitor review progress from one secured account.
              </p>
            </div>

            <div className="relative grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                <p className="text-2xl font-semibold">24</p>
                <p className="mt-1 text-stone-100/72">Pending</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                <p className="text-2xl font-semibold">12</p>
                <p className="mt-1 text-stone-100/72">For checking</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/10 p-3">
                <p className="text-2xl font-semibold">108</p>
                <p className="mt-1 text-stone-100/72">Approved</p>
              </div>
            </div>
          </section>

          <main className="flex min-h-svh items-center justify-center px-4 py-8 sm:px-6">
            <div className="w-full max-w-md">
              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <BrandLogo className="h-11 w-11" />
                <div>
                  <p className="text-lg font-semibold text-stone-900">E-Kabataan</p>
                  <p className="text-sm text-stone-500">MYDO management portal</p>
                </div>
              </div>

              <div className="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.12em] text-green-700">Web Guard Login</p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-950">Sign in to your account</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-500">For MYDO staff and admin accounts only.</p>
                </div>

                {status && <Alert className="mt-5" type="success" showIcon message={status} />}

                <form className="mt-6 flex flex-col gap-5" onSubmit={submit}>
                  <div className="grid gap-2">
                    <label htmlFor="username" className="text-sm font-medium text-stone-700">
                      Username
                    </label>
                <Input
                  id="username"
                  type="text"
                  required
                  autoFocus
                  tabIndex={1}
                      autoComplete="username"
                  value={data.username}
                  onChange={(e) => setData('username', e.target.value)}
                      placeholder="Enter your username"
                      prefix={<UserOutlined className="text-stone-400" />}
                      size="large"
                />
                <InputError message={errors.username} />
              </div>

                  <div className="grid gap-2">
                    <div className="flex items-center gap-3">
                      <label htmlFor="password" className="text-sm font-medium text-stone-700">
                        Password
                      </label>
                  {canResetPassword && (
                        <TextLink href={route('password.request')} className="ml-auto text-sm text-green-700" tabIndex={5}>
                      Forgot password?
                    </TextLink>
                  )}
                </div>
                <Input.Password
                  id="password"
                  required
                  tabIndex={2}
                  autoComplete="current-password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="Password"
                      prefix={<LockOutlined className="text-stone-400" />}
                      size="large"
                />
                <InputError message={errors.password} />
              </div>

              <Button
                htmlType="submit"
                type="primary"
                loading={processing}
                    className="mt-2 h-11 w-full font-medium"
                tabIndex={4}
                disabled={processing}>
                    Sign in
              </Button>
                </form>
              </div>

              <p className="mt-5 text-center text-xs text-stone-500">
                Youth applicants should use the youth login page.
              </p>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
