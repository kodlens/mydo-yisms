import StudentAuthLayout from '@/layouts/student-sidebar-layout';
import { SharedData } from '@/types';
import { Head } from '@inertiajs/react';
import { ReactElement, ReactNode } from 'react';



const StudentDashboardIndex = () => {
  return (
    <>
      <Head title="Student Dashboard" />
      <div className="p-4">
        StudentDashboardIndex
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
