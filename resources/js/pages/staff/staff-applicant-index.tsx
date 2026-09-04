import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData } from '@/types';
import { Head } from '@inertiajs/react';
import { ReactElement, ReactNode } from 'react';

const StaffApplicantIndex = () => {
  return (
    <>
      <Head title="Staff Applicants" />
      <div className="mx-auto max-w-7xl rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-stone-900">Applicants</h1>
      </div>
    </>
  );
};

StaffApplicantIndex.layout = (page: ReactNode) => (
  <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</StaffAuthLayout>
);

export default StaffApplicantIndex;
