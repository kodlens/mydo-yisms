import StudentAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Button, Tag } from 'antd';
import { ArrowLeft, CheckCircle2, ClipboardList } from 'lucide-react';
import { ReactElement, ReactNode } from 'react';

type ServiceItem = {
  key: string;
  title: string;
  description: string;
  status: string;
  requirements: string[];
};

type Props = {
  service: ServiceItem;
};

const ServiceShow = ({ service }: Props) => {
  return (
    <>
      <Head title={service.title} />

      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <Link href={route('youth.services.index')} className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-950">
          <ArrowLeft className="h-4 w-4" />
          Back to services
        </Link>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase text-teal-700">Service Application</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-950">{service.title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{service.description}</p>
            </div>
            <Tag color="green" className="px-3 py-1">{service.status}</Tag>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-teal-700" />
              <h2 className="text-base font-semibold text-slate-950">Requirements</h2>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {service.requirements.map((requirement) => (
                <div key={requirement} className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {requirement}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button type="primary" size="large">
              Start Application
            </Button>
          </div>
        </section>
      </div>
    </>
  );
};

ServiceShow.layout = (page: ReactNode) => (
  <StudentAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</StudentAuthLayout>
);

export default ServiceShow;
