import StudentAuthLayout from '@/layouts/student-auth-layout'
import { SharedData } from '@/types'
import React, { ReactElement, ReactNode } from 'react'

const MyAccountIndex = () => {
  return (
    <div>MyAccountIndex</div>
  )
}

MyAccountIndex.layout = (page: ReactNode) =>
  <StudentAuthLayout
    user={(page as ReactElement<SharedData>).props.auth.user}
  >
    {page}
  </StudentAuthLayout>
