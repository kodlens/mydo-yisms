import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { Head, router } from '@inertiajs/react';
import { ArrowRight, Check, Clock3, GraduationCap } from 'lucide-react';
import React, { ReactElement, ReactNode, useState } from 'react'
import DocumentUploads from './partials/document-uploads';
import { App, Button, Form, FormInstance, Input } from 'antd';
import axios, { isAxiosError } from 'axios';
import { ScholarshipType } from '@/types/scholarship';
import { ScholarshipApplication } from '@/types/scholarshipApplication';

type Props = {
  xToken: string
  scholarshipTypeId: number
  scholarshipApplication: ScholarshipApplication
  scholarshipType: ScholarshipType
}

const YouthApplyScholarshipPage = ({ xToken, scholarshipTypeId, scholarshipApplication, scholarshipType }: Props) => {

  const [errors, setErrors] = useState<Record<string, unknown[]>>({})
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false)

  const submit = (values: FormInstance) => {
    setLoading(true)

    axios
      .post(`/youth/services/apply-scholarship/${scholarshipTypeId}`, values)
      .then((res) => {
        if (res.data.success) {
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
            <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">{scholarshipType.scholarship}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
              {scholarshipType.target_beneficiary ?? ''}
            </p>
          </div>
          <div
            aria-hidden="true"
            className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700 sm:flex"
          >
            <GraduationCap size={40} strokeWidth={1.5} />
          </div>
        </header>

        {!scholarshipApplication ? (
          <section className='bg-white rounded-2xl py-5 px-5'>
            <Form
              form={form}
              layout='vertical'
              onFinish={submit}
              initialValues={{
                'scholarship_type_id': scholarshipTypeId ?? 0
              }}
              onFinishFailed={(errInfo) => {
                console.log('Youth registration validation failed:', errInfo);
              }}
              preserve
            >
              <DocumentUploads errors={errors} xToken={xToken} />

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
        ) : (
          <section
            aria-labelledby="application-status-heading"
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-2 border-b border-stone-100 bg-stone-50/80 px-5 py-4 text-sm font-medium text-stone-600 sm:px-8">
              <Check aria-hidden="true" className="h-4 w-4 text-teal-600" />
              Application submitted
            </div>

            <div className="flex flex-col items-center px-5 py-10 text-center sm:px-8 sm:py-14">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700">
                <GraduationCap aria-hidden="true" size={32} strokeWidth={1.5} />
              </div>

              <span className={`inline-flex max-w-full items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${scholarshipApplication.status === 'pending' ? 'bg-amber-50 text-amber-800 ring-amber-200' : 'bg-stone-50 text-stone-700 ring-stone-200'}`}>
                {scholarshipApplication.status === 'pending' && <Clock3 aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />}
                <span className="break-words capitalize">{scholarshipApplication.status.replace(/_/g, ' ')}</span>
              </span>

              <h2 id="application-status-heading" className="mt-4 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
                {scholarshipApplication.status === 'pending' ? 'Your application is awaiting review' : 'You’ve already applied'}
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-stone-500">
                {scholarshipApplication.status === 'pending'
                  ? 'Your scholarship application has been submitted successfully. No need to submit another application while you wait for a review.'
                  : 'Your scholarship application has been submitted. You can check its current status above.'}
              </p>

              <div className="mt-8 w-full max-w-md rounded-xl border border-stone-100 bg-stone-50 px-4 py-4">
                <p className="text-xs font-medium tracking-wide text-stone-500 uppercase">Scholarship program</p>
                <p className="mt-1 break-words text-sm font-semibold text-stone-800">{scholarshipType.scholarship}</p>
              </div>
            </div>
          </section>
        )}




      </div>

    </>
  )
}


YouthApplyScholarshipPage.layout = (page: ReactNode) => (
  <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</YouthAuthLayout>
);

export default YouthApplyScholarshipPage
