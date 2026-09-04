import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData, Student } from '@/types';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileSearchOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import { Head, Link, router } from '@inertiajs/react';
import { Empty, Progress, Tag } from 'antd';
import { ReactElement, ReactNode } from 'react';

type DashboardStats = {
  pending: number;
  approved: number;
  rejected: number;
  draft: number;
  total: number;
  new_this_week: number;
  review_progress: number;
};

type Props = {
  stats: DashboardStats;
  queue: Pick<Student, 'id' | 'fname' | 'lname' | 'program' | 'school_name' | 'registration_status'>[];
};

const statusColor: Record<string, string> = {
  approved: 'green',
  pending: 'gold',
  draft: 'default',
  rejected: 'red',
};

const fullName = (student: Pick<Student, 'fname' | 'lname'>) => [student.fname, student.lname].filter(Boolean).join(' ');

const StaffDashboardIndex = ({ stats, queue }: Props) => {
  const summaryCards = [
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: <ClockCircleOutlined />,
      tone: 'border-amber-200 bg-amber-50 text-amber-700',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: <CheckCircleOutlined />,
      tone: 'border-green-200 bg-green-50 text-green-700',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: <CloseCircleOutlined />,
      tone: 'border-red-200 bg-red-50 text-red-700',
    },
    {
      label: 'New This Week',
      value: stats.new_this_week,
      icon: <UserAddOutlined />,
      tone: 'border-stone-200 bg-white text-stone-700',
    },
  ];

  return (
    <>
      <Head title="Staff Dashboard" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-500">Today</p>
            <h1 className="text-2xl font-semibold text-stone-900">Staff Dashboard</h1>
          </div>
          <Link
            href="/staff/applicants"
            className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
          >
            View applicants
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <div key={card.label} className={`rounded-lg border p-4 shadow-sm ${card.tone}`}>
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">{card.label}</p>
                <span className="text-lg">{card.icon}</span>
              </div>
              <p className="mt-4 text-3xl font-semibold text-stone-900">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-stone-900">Pending Application Queue</h2>
              <Link href="/staff/applicants" className="text-sm font-medium text-green-700 hover:text-green-900">
                View all
              </Link>
            </div>

            <div className="mt-4 divide-y divide-stone-100">
              {queue.length === 0 && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No pending applications" />}

              {queue.map((item) => (
                <div key={item.id} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                  <div>
                    <p className="font-medium text-stone-900">{fullName(item)}</p>
                    <p className="text-sm text-stone-500">{item.school_name ?? '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-stone-600">{item.program ?? '-'}</p>
                    <Tag color={statusColor[item.registration_status ?? ''] ?? 'default'} className="mt-1 capitalize">
                      {item.registration_status ?? 'draft'}
                    </Tag>
                  </div>
                  <button
                    type="button"
                    className="w-fit rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
                    onClick={() => router.visit(`/staff/applicants/${item.id}`)}
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <FileSearchOutlined className="text-green-700" />
              <h2 className="text-base font-semibold text-stone-900">Review Load</h2>
            </div>

            <div className="mt-5 flex justify-center">
              <Progress type="dashboard" percent={stats.review_progress} strokeColor="#15803d" />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="text-stone-500">Total applicants</p>
                <p className="mt-1 text-xl font-semibold text-stone-950">{stats.total}</p>
              </div>
              <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                <p className="text-stone-500">Draft records</p>
                <p className="mt-1 text-xl font-semibold text-stone-950">{stats.draft}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

StaffDashboardIndex.layout = (page: ReactNode) => (
  <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</StaffAuthLayout>
);

export default StaffDashboardIndex;
