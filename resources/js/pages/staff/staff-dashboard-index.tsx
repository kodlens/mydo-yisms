import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData } from '@/types';
import { CheckCircleOutlined, ClockCircleOutlined, FileSearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { Head } from '@inertiajs/react';
import { ReactElement, ReactNode } from 'react';

const summaryCards = [
  {
    label: 'Pending Review',
    value: '24',
    icon: <ClockCircleOutlined />,
    tone: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  {
    label: 'For Verification',
    value: '12',
    icon: <FileSearchOutlined />,
    tone: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  {
    label: 'Approved',
    value: '108',
    icon: <CheckCircleOutlined />,
    tone: 'border-green-200 bg-green-50 text-green-700',
  },
  {
    label: 'New This Week',
    value: '31',
    icon: <UserAddOutlined />,
    tone: 'border-stone-200 bg-white text-stone-700',
  },
];

const queueItems = [
  { name: 'Maria Santos', program: 'College Scholarship', status: 'Documents' },
  { name: 'Jose Reyes', program: 'Senior High Assistance', status: 'Review' },
  { name: 'Ana Bautista', program: 'Skills Training', status: 'Verification' },
];

const StaffDashboardIndex = () => {
  return (
    <>
      <Head title="Staff Dashboard" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="flex flex-col gap-1">
          <p className="text-sm font-medium text-stone-500">Today</p>
          <h1 className="text-2xl font-semibold text-stone-900">Staff Dashboard</h1>
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
              <h2 className="text-base font-semibold text-stone-900">Application Queue</h2>
              <button
                type="button"
                className="rounded-md border border-stone-200 px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
              >
                View all
              </button>
            </div>

            <div className="mt-4 divide-y divide-stone-100">
              {queueItems.map((item) => (
                <div key={item.name} className="grid gap-2 py-3 sm:grid-cols-[1fr_1fr_auto] sm:items-center">
                  <div>
                    <p className="font-medium text-stone-900">{item.name}</p>
                    <p className="text-sm text-stone-500">{item.program}</p>
                  </div>
                  <p className="text-sm text-stone-600">{item.status}</p>
                  <button
                    type="button"
                    className="w-fit rounded-md bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="text-base font-semibold text-stone-900">Review Load</h2>
            <div className="mt-4 space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Documents checked</span>
                  <span className="font-medium text-stone-900">68%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-stone-100">
                  <div className="h-2 rounded-full bg-green-700" style={{ width: '68%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Interviews scheduled</span>
                  <span className="font-medium text-stone-900">42%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-stone-100">
                  <div className="h-2 rounded-full bg-amber-500" style={{ width: '42%' }} />
                </div>
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
