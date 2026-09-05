import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { Head } from '@inertiajs/react';
import { Button, Tag } from 'antd';
import { Award, Banknote, CalendarCheck, FileText, type LucideIcon } from 'lucide-react';
import { ReactElement, ReactNode } from 'react';

type ServiceItem = {
  key: string;
  title: string;
  description: string;
  status: string;
  requirements: string[];
};

type Props = {
  services: Record<string, ServiceItem>;
};

const serviceIcons: Record<string, LucideIcon> = {
  scholarship: Award,
  'cash-incentive': Banknote,
  activities: CalendarCheck,
  documents: FileText,
};

const YouthServicePage = ({ services }: Props) => {
  const serviceList = Object.values(services);

  return (
    <>
      <Head title="Youth Services" />

      <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase text-teal-700">Services</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-950">Apply for MYDO services</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Use your youth profile to apply for available services. Each application can request its own details and documents.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {serviceList.map((service) => {
            const Icon = serviceIcons[service.key] ?? FileText;
            const isOpen = service.status === 'Open';

            return (
              <article key={service.key} className="flex min-h-[260px] flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-md bg-teal-50 text-teal-700">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Tag color={isOpen ? 'green' : 'default'}>{service.status}</Tag>
                </div>

                <h2 className="mt-5 text-lg font-semibold text-slate-950">{service.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{service.description}</p>

                <Button
                  type={isOpen ? 'primary' : 'default'}
                  disabled={!isOpen}
                  href={isOpen ? route('youth.youth-services.show', service.key) : undefined}
                  className="mt-5 w-full"
                >
                  Apply
                </Button>
              </article>
            );
          })}
        </section>
      </div>
    </>
  );
};

YouthServicePage.layout = (page: ReactNode) => (
  <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</YouthAuthLayout>
);

export default YouthServicePage;
