import BrandLogo from '@/components/brand-logo';
import { Student } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Button, Tag } from 'antd';
import { ArrowLeft, Clock3, FileText, LogOut, Mail, ShieldCheck } from 'lucide-react';

type Props = {
  student: Student;
};

const PendingPage = ({ student }: Props) => {
  const { post, processing } = useForm();

  const logout = () => {
    post(route('student-logout'));
  };

  return (
    <>
      <Head title="Account Pending" />

      <main className="min-h-screen bg-[#f7f9f5] text-slate-950">
        <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-6">
          <div className="flex items-center justify-between">
            <Link href={route('home')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Back to portal
            </Link>

            <Button danger icon={<LogOut className="h-4 w-4" />} loading={processing} onClick={logout}>
              Logout
            </Button>
          </div>

          <section className="flex flex-1 items-center justify-center py-10">
            <div className="w-full overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-xl shadow-emerald-900/10">
              <div className="grid lg:grid-cols-[320px_1fr]">
                <aside className="bg-emerald-800 px-6 py-8 text-white">
                  <div className="inline-flex items-center gap-3">
                    <BrandLogo className="h-12 w-12 rounded-md bg-white p-1" />
                    <span>
                      <span className="block text-sm font-bold text-white">eKabataan</span>
                      <span className="block text-xs text-emerald-100">Student Application</span>
                    </span>
                  </div>

                  <div className="mt-10">
                    <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-50">
                      <Clock3 className="h-4 w-4" />
                      Review in progress
                    </div>

                    <h1 className="text-3xl font-bold leading-tight">Your account is pending approval.</h1>
                    <p className="mt-4 text-sm leading-6 text-emerald-50">
                      MYDO is reviewing your registration and submitted scholarship requirements.
                    </p>
                  </div>
                </aside>

                <div className="px-6 py-8 sm:px-8 lg:px-10">
                  <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase text-emerald-700">Application Status</p>
                      <h2 className="mt-2 text-2xl font-bold text-slate-950">Pending Review</h2>
                    </div>
                    <Tag color="gold" className="w-fit px-3 py-1 text-sm capitalize">
                      {student.registration_status}
                    </Tag>
                  </div>

                  <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-900">
                      {student.fname} {student.lname}
                    </p>
                    <p className="mt-1 inline-flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4" />
                      {student.email}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div className="rounded-md border border-slate-200 p-4">
                      <FileText className="h-5 w-5 text-emerald-700" />
                      <p className="mt-3 text-sm font-semibold text-slate-900">Documents submitted</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Your uploaded files are queued for checking by the office.
                      </p>
                    </div>

                    <div className="rounded-md border border-slate-200 p-4">
                      <ShieldCheck className="h-5 w-5 text-emerald-700" />
                      <p className="mt-3 text-sm font-semibold text-slate-900">Access limited</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Your dashboard will open once your account has been approved.
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <Button type="primary" danger icon={<LogOut className="h-4 w-4" />} loading={processing} onClick={logout}>
                      Logout
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default PendingPage
