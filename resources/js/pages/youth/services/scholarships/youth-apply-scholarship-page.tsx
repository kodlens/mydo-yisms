import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, GraduationCap } from 'lucide-react';
import React, { ReactElement, ReactNode, useState } from 'react'
import DocumentUploads from './partials/document-uploads';
import { App, Button, Form, FormInstance, Input } from 'antd';
import axios, { isAxiosError } from 'axios';

type Props = {
  xToken: string
  scholarshipTypeId: number
}

const YouthApplyScholarshipPage = ( {xToken, scholarshipTypeId}: Props ) => {

  const [errors, setErrors] = useState<Record<string, unknown[]>>({})
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false)

  const submit = (values:FormInstance) => {
    setLoading(true)

    axios
    .post(`/youth/services/apply-scholarship/${scholarshipTypeId}`, values)
    .then((res) => {
      if(res.data.success){
        //window.location.href = route('youth-login.index');
        modal.success({
          title: 'Youth Profile Created',
          content:
            'Your youth profile has been created. You may now sign in and apply for available MYDO services such as scholarship, cash incentives, and activities.',
          okText: 'Got it',
          onOk: () => {
            router.visit('')
          }
        });
      }
    })
    .catch((error) => {
      if (isAxiosError(error) && error.response?.status === 422) {
        const validationErrors = error.response.data.errors ?? {};
        const errorMessages = [...new Set(Object.values(validationErrors).flat() as string[])];

        setErrors(validationErrors);

        modal.error({
          title: 'Please check your registration details',
          content: (
            <ul className="mb-0 list-disc pl-5">
              {errorMessages.map((message, index) => (
                <li key={`${message}-${index}`}>{message}</li>
              ))}
            </ul>
          ),
        });
      }
    })
    .finally(() => {
      setLoading(false);
    });
  }

  return (
    <>
      <Head title="Scholarship Application" />
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-widest text-teal-700 uppercase">Youth services / Apply Scholarship</p>
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Scholarship Application</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
              A little support can take you further. Explore programs built to help you continue your education.
            </p>
          </div>
          <div
            aria-hidden="true"
            className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700 sm:flex"
          >
            <GraduationCap size={40} strokeWidth={1.5} />
          </div>
        </header>

        <section className='bg-white rounded-2xl py-5 px-5'>
          <Form
            form={form}
            layout='vertical'
            onFinish={submit}
            initialValues={{
              'scholarship_type_id': scholarshipTypeId ?? 0
            }}
            onFinishFailed={(errInfo) =>{
              console.log('Youth registration validation failed:', errInfo);
            }}
            preserve
          >
            <DocumentUploads errors={errors} xToken={xToken}/>

            <Form.Item
              name="scholarship_type_id"
              hidden>
                <Input />
            </Form.Item>

            <div className='flex justify-end'>
              <Button htmlType="submit"
                type="primary" size="large"
                loading={loading}>
                Submit Application
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Form>

        </section>


      </div>

    </>
  )
}


YouthApplyScholarshipPage.layout = (page: ReactNode) => (
  <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</YouthAuthLayout>
);

export default YouthApplyScholarshipPage
