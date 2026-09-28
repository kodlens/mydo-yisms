import VolunteerDirectory from '@/components/volunteer/volunteer-directory';
import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { SharedData } from '@/types';
import { ReactElement, ReactNode } from 'react';

const StaffVolunteersPage = () => (
  <VolunteerDirectory
    basePath="/staff/volunteers"
    dataPath="/staff/get-volunteers"
    workspaceLabel="Staff Workspace"
    heading="Volunteers"
    description="Review volunteer applications, assign youth to activities, and record the service hours they render."
  />
);

StaffVolunteersPage.layout = (page: ReactNode) => (
  <StaffAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</StaffAuthLayout>
);

export default StaffVolunteersPage;
