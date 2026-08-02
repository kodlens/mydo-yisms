import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, Eye, EyeOff, GraduationCap, LockKeyhole, Mail, ShieldCheck } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StudentLogin() {
  const [showPassword, setShowPassword] = useState(false);

  const submit: FormEventHandler = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Head title="Student Login" />

      <main className="min-h-screen bg-[#f7f9f5] text-slate-950">
        <div className="mx-auto grid min-h-screen w-full max-w-7xl lg:grid-cols-[1fr_520px]">
          <section className="hidden bg-emerald-800 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
            <Link href={route('home')} className="inline-flex w-fit items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-sm font-bold text-emerald-800">
                MY
              </span>
              <span>
                <span className="block text-sm font-bold tracking-wide">MYDO-YISMS</span>
                <span className="block text-xs text-emerald-100">Youth and Scholarship Portal</span>
              </span>
            </Link>

            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-50">
                <GraduationCap className="h-4 w-4" />
                Scholarship Applicant Access
              </div>

              <h1 className="text-5xl font-bold leading-tight">Welcome back, scholar applicant.</h1>

              <p className="mt-5 text-lg leading-8 text-emerald-50">
                Sign in to continue your scholarship application, update your youth profile, upload requirements,
                and check notices from the Municipal Youth Development Office.
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
                <p className="mt-3 text-sm font-semibold">Private Account</p>
              </div>
            </div>
          </section>

          <section className="flex min-h-screen flex-col px-6 py-6 sm:px-10 lg:px-12">
            <div className="flex items-center justify-between">
              <Link href={route('home')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
                <ArrowLeft className="h-4 w-4" />
                Back to portal
              </Link>

              <Link href={route('student-register')} className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                Register
              </Link>
            </div>

            <div className="flex flex-1 items-center justify-center py-10">
              <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl shadow-emerald-900/10 sm:p-8">
                <div className="mb-8 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
                    <GraduationCap className="h-7 w-7" />
                  </span>
                  <h2 className="mt-5 text-2xl font-bold text-slate-950">Student Login</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Access your scholarship application and youth profile.
                  </p>
                </div>

                <form className="space-y-5" onSubmit={submit}>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="student@example.com"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link href={route('password.request')} className="text-sm font-medium text-emerald-700 hover:text-emerald-900">
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        className="px-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((visible) => !visible)}
                        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-900"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        aria-pressed={showPassword}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* <div className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-3">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-emerald-700" />
                      Remember me
                    </label>
                    <span className="text-xs font-medium text-slate-500">Design only</span>
                  </div> */}

                  <Button type="submit" className="w-full bg-emerald-700 hover:bg-emerald-800">
                    Sign in
                  </Button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                  New applicant?{' '}
                  <Link href={route('student-register')} className="font-semibold text-emerald-700 hover:text-emerald-900">
                    Create an account
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
