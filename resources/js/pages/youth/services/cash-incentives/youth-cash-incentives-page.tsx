import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { ReactElement, ReactNode } from 'react';



const YouthCashIncentivesPage = () => {
  return (
    <>

      YouthCashIncentivesPage Page Sample

    </>
  );
};


YouthCashIncentivesPage.layout = (page: ReactNode) =>
  <YouthAuthLayout
    user={(page as ReactElement<SharedData>).props.auth.user}
  >
    {page}
  </YouthAuthLayout>

export default YouthCashIncentivesPage
