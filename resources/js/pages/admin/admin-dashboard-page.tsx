import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { SharedData, Youth } from '@/types';
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
  queue: Pick<Youth, 'id' | 'fname' | 'lname' | 'program' | 'school_name' | 'registration_status'>[];
};

const statusColor: Record<string, string> = {
  approved: 'green',
  pending: 'gold',
  draft: 'default',
  rejected: 'red',
};

const fullName = (youth: Pick<Youth, 'fname' | 'lname'>) => [youth.fname, youth.lname].filter(Boolean).join(' ');

const AdminDashboardIndex = ({ stats, queue }: Props) => {
  const summaryCards = [
    {
      label: 'Pending Review',
      value: stats.pending,
      icon: <ClockCircleOutlined />,
      tone: 'border-amber-200 bg-amber-50/70 text-amber-700 hover:border-amber-300 hover:bg-amber-50',
      badge: 'Action required',
      badgeClass: 'bg-amber-100 text-amber-800',
      href: '/admin/applicants?status=pending',
      actionText: 'View pending list',
    },
    {
      label: 'Approved',
      value: stats.approved,
      icon: <CheckCircleOutlined />,
      tone: 'border-green-200 bg-green-50/70 text-green-700 hover:border-green-300 hover:bg-green-50',
      badge: null,
      badgeClass: '',
      href: '/admin/applicants?status=approved',
      actionText: 'View approved list',
    },
    {
      label: 'Rejected',
      value: stats.rejected,
      icon: <CloseCircleOutlined />,
      tone: 'border-red-200 bg-red-50/70 text-red-700 hover:border-red-300 hover:bg-red-50',
      badge: null,
      badgeClass: '',
      href: '/admin/applicants?status=rejected',
      actionText: 'View rejected list',
    },
    {
      label: 'New This Week',
      value: stats.new_this_week,
      icon: <UserAddOutlined />,
      tone: 'border-stone-200 bg-white text-stone-700 hover:border-stone-300 hover:bg-stone-50',
      badge: 'Recent',
      badgeClass: 'bg-stone-100 text-stone-700',
      href: '/admin/applicants',
      actionText: 'View all applicants',
    },
  ];

  return (
    <>
      <Head title="Admin Dashboard" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-stone-500">Today</p>
            <h1 className="text-2xl font-semibold text-stone-900">Admin Dashboard</h1>
          </div>
          <Link
            href="/admin/applicants"
            className="rounded-md border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-50"
          >
            View applications
          </Link>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`group flex flex-col justify-between rounded-xl border p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${card.tone}`}
            >
              <div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-800">{card.label}</p>
                    {card.badge && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide ${card.badgeClass}`}>
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-xl transition-transform duration-200 group-hover:scale-110">{card.icon}</span>
                </div>
                <p className="mt-4 text-3xl font-bold tracking-tight text-stone-900">{card.value}</p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-stone-200/50 pt-3 text-xs font-medium text-stone-600 group-hover:text-stone-950">
                <span>{card.actionText}</span>
                <span className="text-sm transition-transform duration-200 group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-stone-900">Pending Application Queue</h2>
              <Link href="/admin/applicants?status=pending" className="text-sm font-medium text-green-700 hover:text-green-900">
                View all pending
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
                    onClick={() => router.visit(`/admin/applicants/${item.id}`)}
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
              <Link
                href="/admin/applicants"
                className="group rounded-lg border border-stone-200 bg-stone-50 p-3 transition-colors hover:border-stone-300 hover:bg-stone-100 block"
              >
                <div className="flex items-center justify-between">
                  <p className="text-stone-500 text-xs">Total applications</p>
                  <span className="text-xs text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-stone-950">{stats.total}</p>
              </Link>
              <Link
                href="/admin/applicants?status=draft"
                className="group rounded-lg border border-stone-200 bg-stone-50 p-3 transition-colors hover:border-stone-300 hover:bg-stone-100 block"
              >
                <div className="flex items-center justify-between">
                  <p className="text-stone-500 text-xs">Draft records</p>
                  <span className="text-xs text-stone-400 group-hover:text-stone-700 group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <p className="mt-1 text-xl font-semibold text-stone-950">{stats.draft}</p>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

AdminDashboardIndex.layout = (page: ReactNode) => (
  <AdminAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</AdminAuthLayout>
);

export default AdminDashboardIndex;
