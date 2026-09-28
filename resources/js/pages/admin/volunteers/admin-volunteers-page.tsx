import VolunteerDirectory from '@/components/volunteer/volunteer-directory';
import AdminAuthLayout from '@/layouts/admin-auth-layout';
import { SharedData } from '@/types';
import { ReactElement, ReactNode } from 'react';

const AdminVolunteersPage = () => (
  <VolunteerDirectory
    basePath="/admin/volunteers"
    dataPath="/admin/get-volunteers"
    workspaceLabel="Admin Workspace"
    heading="Volunteers"
    description="Register youth volunteers, assign them to activities, and record the service hours they render."
    canRegister
    canRemove
  />
);

AdminVolunteersPage.layout = (page: ReactNode) => (
  <AdminAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</AdminAuthLayout>
);

export default AdminVolunteersPage;
