import BrandLogo from '@/components/brand-logo';
import FormSection from '@/components/form-section';
import SelectBarangay from '@/components/select-barangay';
import SelectCity from '@/components/select-city';
import SelectProvince from '@/components/select-province';
import { Head, Link } from '@inertiajs/react';
import { Button, DatePicker, Form, Input, InputNumber, Select, Steps, Typography } from 'antd';
import axios from 'axios';
import { ArrowLeft, ArrowRight, BookOpen, GraduationCap, Home, LockKeyhole, Mail, Phone, UserRound, Users, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import UploadDocument from './form/upload-document';
import Education from './form/education';

type StudentRegistrationForm = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  lname: string;
  fname: string;
  mname?: string;
  suffix?: string;
  birth_date?: { format: (format: string) => string };
  sex: string;
  civil_status: string;
  mobile_number: string;
  provCode: string;
  citymunCode: string;
  brgyCode: string;
  street_address: string;
  zip_code?: string;
  school_name: string;
  program: string;
  year: string;
  previous_semester_gwa?: number;
  guardian_name: string;
  guardian_contact_number: string;
  monthly_family_income: number;
  coe?: unknown;
  cog?: unknown;
  cedula?: unknown;
  school_id?: unknown;
  psa?: unknown;
};


const sexOptions = [
  { value: 'Female', label: 'Female' },
  { value: 'Male', label: 'Male' },
];

const civilStatusOptions = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Separated', label: 'Separated' },
];

const registrationSteps = [
  { title: 'Profile' },
  { title: 'Education' },
  { title: 'Documents' },
];

export default function StudentRegister() {
  const [form] = Form.useForm<StudentRegistrationForm>();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const provCode = Form.useWatch('provCode', form) ?? '';
  const citymunCode = Form.useWatch('citymunCode', form) ?? '';

  const submit = (values: StudentRegistrationForm) => {
    setProcessing(true);
    setErrors({});

    const payload = { ...values };

    delete payload.coe;
    delete payload.cog;
    delete payload.cedula;
    delete payload.school_id;
    delete payload.psa;

    axios
      .post(route('student-register.store'), {
        ...payload,
        birth_date: payload.birth_date?.format('YYYY-MM-DD'),
      })
      .then(() => {
        window.location.href = route('student-login');
      })
      .catch((error) => {
        setErrors(error.response?.data?.errors ?? {});
      })
      .finally(() => {
        setProcessing(false);
      });
  };

  const resetCityAndBarangay = (value: string) => {
    form.setFieldsValue({
      provCode: value,
      citymunCode: undefined,
      brgyCode: undefined,
    });
  };

  const resetBarangay = (value: string) => {
    form.setFieldsValue({
      citymunCode: value,
      brgyCode: undefined,
    });
  };

  return (
    <>
      <Head title="Student Registration" />

      <main className="min-h-screen bg-[#f7f9f5] text-slate-950">
        <div className="mx-auto w-full max-w-7xl px-6 py-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href={route('home')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Back to portal
            </Link>

            <Link href={route('student-login')} className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
              Already registered?
            </Link>
          </div>

          <section className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-xl shadow-emerald-900/10">
            <div className="grid lg:grid-cols-[360px_1fr]">
              <aside className="bg-emerald-800 px-6 py-8 text-white sm:px-8">
                <Link href={route('home')} className="inline-flex w-fit items-center gap-3">
                  <BrandLogo className="h-12 w-12 rounded-md bg-white p-1" />
                  <span>
                    <span className="block text-sm font-bold tracking-wide">eKabataan</span>
                    <span className="block text-xs text-emerald-100">Student Registration</span>
                  </span>
                </Link>

                <div className="mt-10">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-50">
                    <GraduationCap className="h-4 w-4" />
                    Scholarship Application
                  </div>

                  <h1 className="text-3xl font-bold leading-tight">Create your applicant account.</h1>
                  <p className="mt-4 text-sm leading-6 text-emerald-50">
                    Fill out your student information so MYDO can review your scholarship application and youth profile.
                  </p>
                </div>

                <div className="mt-10 space-y-3">
                  <SidebarItem icon={UserRound} label="Personal details" />
                  <SidebarItem icon={Home} label="Address verification" />
                  <SidebarItem icon={BookOpen} label="School information" />
                  <SidebarItem icon={LockKeyhole} label="Secure login account" />
                </div>
              </aside>

              <div className="px-6 py-8 sm:px-8 lg:px-10">
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase text-emerald-700">Applicant Form</p>
                  <Typography.Title level={2} className="!mb-0 !mt-2 !text-2xl">
                    Student scholarship registration
                  </Typography.Title>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Complete the form below to submit your student scholarship registration for MYDO review.
                  </p>
                </div>

                <Form form={form}
                  layout="vertical"
                  onFinish={submit}
                  className="space-y-6">

                  <div>
                    <Steps current={currentStep} items={registrationSteps} responsive />
                  </div>

                  {currentStep === 0 && (
                    <>
                      <FormSection icon={LockKeyhole} title="Account Information">
                        <div className="flex md:gap-4 flex-col md:flex-row">
                          {/* <div className="w-full ">
                            <Form.Item name="username"
                              label="Username"
                              validateStatus={errors.username ? "error" : ""}
                              help={errors.username ? errors.username[0] : ""} >
                              <Input placeholder="Username" />
                            </Form.Item>
                          </div> */}

                          <div className="w-full">
                            <Form.Item
                              name="email"
                              label="Email"
                              validateStatus={errors.email ? "error" : ""}
                              help={errors.email ? errors.email[0] : ""}
                            >
                              <Input prefix={<Mail className="h-4 w-4 text-slate-400" />} placeholder="email@example.com" />
                            </Form.Item>
                          </div>
                        </div>

                        <div className='flex gap-4 md:flex-row md:gap-4 flex-col'>
                          <div className="w-full">
                            <Form.Item
                              name="password"
                              label="Password"
                              validateStatus={errors.password ? "error" : ""}
                              help={errors.password ? errors.password[0] : ""}
                            >
                              <Input.Password placeholder="Create a password" />
                            </Form.Item>
                          </div>

                          <div className="w-full">
                            <Form.Item
                              name="password_confirmation"
                              label="Confirm password"
                              validateStatus={errors.password_confirmation ? "error" : ""}
                              help={errors.password_confirmation ? errors.password_confirmation[0] : ""}
                            >
                              <Input.Password placeholder="Confirm your password" />
                            </Form.Item>
                          </div>
                        </div>
                      </FormSection>

                      <FormSection icon={UserRound} title="Personal Information">
                        <div className="flex gap-4 md:flex-row md:gap-4 flex-col">

                          <div className="w-full">
                            <Form.Item
                              name="lname"
                              label="Last name"
                              validateStatus={errors.lname ? "error" : ""}
                              help={errors.lname ? errors.lname[0] : ""}
                            >
                              <Input placeholder="Dela Cruz" />
                            </Form.Item>
                          </div>

                          <div className="w-full">
                            <Form.Item
                              name="fname"
                              label="First name"
                              validateStatus={errors.fname ? "error" : ""}
                              help={errors.fname ? errors.fname[0] : ""}
                            >
                              <Input placeholder="Juan" />
                            </Form.Item>
                          </div>
                        </div>

                        <div className="flex gap-4 md:flex-row md:gap-4 flex-col">
                          <div className="w-full">
                            <Form.Item
                              name="mname"
                              label="Middle name"
                              validateStatus={errors.mname ? "error" : ""}
                              help={errors.mname ? errors.mname[0] : ""}
                            >
                              <Input placeholder="Santos" />
                            </Form.Item>
                          </div>

                          <div className="w-full">
                            <Form.Item
                              name="suffix"
                              label="Suffix"
                              validateStatus={errors.suffix ? "error" : ""}
                              help={errors.suffix ? errors.suffix[0] : ""}
                            >
                              <Input placeholder="Jr., III, etc." />
                            </Form.Item>
                          </div>
                        </div>

                        <div className="flex gap-4 md:flex-row md:gap-4 flex-col">
                          <div className="w-full">
                            <Form.Item
                              name="birth_date"
                              label="Birth date"
                              validateStatus={errors.birth_date ? "error" : ""}
                              help={errors.birth_date ? errors.birth_date[0] : ""}
                            >
                              <DatePicker className="w-full" placeholder="Select birth date" />
                            </Form.Item>
                          </div>

                          <div className="w-full">
                            <Form.Item
                              name="sex"
                              label="Sex"
                              validateStatus={errors.sex ? "error" : ""}
                              help={errors.sex ? errors.sex[0] : ""}
                            >
                              <Select allowClear options={sexOptions} placeholder="Select sex" />
                            </Form.Item>
                          </div>
                        </div>

                        <div className="flex gap-4 md:flex-row md:gap-4 flex-col">
                          <div className="w-full">
                            <Form.Item
                              name="civil_status"
                              label="Civil status"
                              validateStatus={errors.civil_status ? "error" : ""}
                              help={errors.civil_status ? errors.civil_status[0] : ""}
                            >
                              <Select allowClear options={civilStatusOptions} placeholder="Select civil status" />
                            </Form.Item>
                          </div>

                          <div className="w-full">
                            <Form.Item
                              name="mobile_number"
                              label="Mobile number"
                              validateStatus={errors.mobile_number ? "error" : ""}
                              help={errors.mobile_number ? errors.mobile_number[0] : ""}
                            >
                              <Input prefix={<Phone className="h-4 w-4 text-slate-400" />} placeholder="09XXXXXXXXX" />
                            </Form.Item>
                          </div>
                        </div>
                      </FormSection>

                      <FormSection icon={Home} title="Address Information">
                        <div className="flex gap-4 md:flex-row md:gap-4 flex-col">
                          <div className="w-full">
                            <Form.Item
                              name="provCode"
                              label="Province"
                              validateStatus={errors.provCode ? "error" : ""}
                              help={errors.provCode ? errors.provCode[0] : ""}
                            >
                              <SelectProvince onChange={resetCityAndBarangay} />
                            </Form.Item>
                          </div>

                          <div className="w-full">
                            <Form.Item
                              name="citymunCode"
                              label="City / Municipality"
                              validateStatus={errors.citymunCode ? "error" : ""}
                              help={errors.citymunCode ? errors.citymunCode[0] : ""}
                            >
                              <SelectCity provinceCode={provCode} onChange={resetBarangay} />
                            </Form.Item>
                          </div>

                          <div className="w-full">
                            <Form.Item
                              name="brgyCode"
                              label="Barangay"
                              validateStatus={errors.brgyCode ? "error" : ""}
                              help={errors.brgyCode ? errors.brgyCode[0] : ""}
                            >
                              <SelectBarangay provinceCode={provCode} cityCode={citymunCode} />
                            </Form.Item>
                          </div>
                        </div>


                        <div className="flex gap-4 md:flex-row md:gap-4 flex-col">
                          <div className="w-full">
                            <Form.Item
                              name="street_address"
                              label="Street address"
                              validateStatus={errors.street_address ? "error" : ""}
                              help={errors.street_address ? errors.street_address[0] : ""}
                            >
                              <Input placeholder="House no., street, purok, subdivision" />
                            </Form.Item>
                          </div>

                          <div className="w-full">
                            <Form.Item
                              name="zip_code"
                              label="ZIP code"
                              validateStatus={errors.zip_code ? "error" : ""}
                              help={errors.zip_code ? errors.zip_code[0] : ""}
                            >
                              <Input placeholder="0000" />
                            </Form.Item>
                          </div>
                        </div>
                      </FormSection>

                      <FormSection icon={Users} title="Family / Guardian Information">
                        <div>
                          <Form.Item
                              name="guardian_name"
                              label="Guardian name"
                              validateStatus={errors.guardian_name ? "error" : ""}
                              help={errors.guardian_name ? errors.guardian_name[0] : ""}
                            >
                              <Input placeholder="Full name of parent or guardian" />
                            </Form.Item>
                        </div>

                        <div className="flex md:gap-4 md:flex-row flex-col">
                           <div className="w-full">
                            <Form.Item
                              name="guardian_contact_number"
                              label="Guardian contact number"
                              validateStatus={errors.guardian_contact_number ? "error" : ""}
                              help={errors.guardian_contact_number ? errors.guardian_contact_number[0] : ""}
                            >
                              <Input prefix={<Phone className="h-4 w-4 text-slate-400" />} placeholder="09XXXXXXXXX" />
                            </Form.Item>
                          </div>

                          <div className="w-full">
                            <Form.Item
                              className="w-full"
                              name="monthly_family_income"
                              label="Monthly family income"
                              validateStatus={errors.monthly_family_income ? "error" : ""}
                              help={errors.monthly_family_income ? errors.monthly_family_income[0] : ""}
                            >
                              <InputNumber className="w-full" min={0} placeholder="e.g. 10000" />
                            </Form.Item>
                          </div>
                        </div>
                      </FormSection>
                    </>
                  )}

                  {currentStep === 1 && (
                    <Education errors={errors} />
                  )}

                  {currentStep === 2 && (
                    <UploadDocument errors={errors}/>
                  )}

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    {currentStep === 0 ? (
                      <Link href={route('student-login')} className="inline-flex justify-center rounded-md px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                        I already have an account
                      </Link>
                    ) : (
                      <Button icon={<ArrowLeft className="h-4 w-4" />} size="large" onClick={() => setCurrentStep((step) => step - 1)}>
                        Back
                      </Button>
                    )}

                    {currentStep < registrationSteps.length - 1 ? (
                      <Button type="primary" size="large" onClick={() => setCurrentStep((step) => step + 1)}>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button htmlType="submit" type="primary" size="large" loading={processing}>
                        Submit Registration
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Form>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function SidebarItem({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="rounded-md bg-white/10 p-4">
      <Icon className="h-5 w-5 text-emerald-100" />
      <p className="mt-3 text-sm font-semibold">{label}</p>
    </div>
  );
}
