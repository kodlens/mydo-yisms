import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { ReactElement, ReactNode } from 'react';



const YouthEventActivitiesPage = () => {
  return (
    <>

      YouthEventActivitiesPage Page Sample

    </>
  );
};


YouthEventActivitiesPage.layout = (page: ReactNode) =>
  <YouthAuthLayout
    user={(page as ReactElement<SharedData>).props.auth.user}
  >
    {page}
  </YouthAuthLayout>

export default YouthEventActivitiesPage
