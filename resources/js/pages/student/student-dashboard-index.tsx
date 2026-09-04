import StudentAuthLayout from '@/layouts/student-auth-layout';
import { SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button } from 'antd';
import { LayoutGrid, UserRound } from 'lucide-react';
import { ReactElement, ReactNode } from 'react';



const StudentDashboardIndex = () => {
  return (
    <>
      <Head title="Youth Dashboard" />
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-teal-700">Youth Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Welcome to your youth portal</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Your profile is the base record for MYDO services. Apply for scholarship, cash incentives, activities, and other programs from the services menu.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={route('youth.services.index')}>
              <Button type="primary" icon={<LayoutGrid className="h-4 w-4" />}>
                Browse Services
              </Button>
            </Link>
            <Link href={route('youth.my-account.index')}>
              <Button icon={<UserRound className="h-4 w-4" />}>
                View Profile
              </Button>
            </Link>
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Next Step</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Open Services, choose the assistance you need, then submit the requirements for that specific program.
          </p>
        </section>
      </div>
    </>
  );
};


StudentDashboardIndex.layout = (page: ReactNode) =>
  <StudentAuthLayout
    user={(page as ReactElement<SharedData>).props.auth.user}
  >
    {page}
  </StudentAuthLayout>

export default StudentDashboardIndex
