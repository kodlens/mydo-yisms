import BrandLogo from '@/components/brand-logo';
import FormSection from '@/components/form-section';
import SelectBarangay from '@/components/select-barangay';
import SelectCity from '@/components/select-city';
import SelectProvince from '@/components/select-province';
import { Head, Link, router } from '@inertiajs/react';
import { App, Button, DatePicker, Form, Input, InputNumber, Select, Typography } from 'antd';
import axios, { isAxiosError } from 'axios';
import { ArrowLeft, ArrowRight, ClipboardList, Home, LockKeyhole, Mail, Phone, UserRound, Users, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';


type YouthRegistrationForm = {
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
  school_name?: string;
  program?: string;
  year?: string | number;
  previous_semester_gwa?: number;
  guardian_name: string;
  guardian_contact_number: string;
  monthly_family_income: number;
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

export default function StudentRegister() {
  const { modal } = App.useApp();
  const [form] = Form.useForm<YouthRegistrationForm>();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [processing, setProcessing] = useState(false);

  const provCode = Form.useWatch('provCode', form) ?? '';
  const citymunCode = Form.useWatch('citymunCode', form) ?? '';

  // const initialData = {
  //   email: null,
  //   password: null,
  //   password_confirmation: null,
  //   lname: '',
  //   fname: '',
  //   mname: '',
  //   sex:'',
  //   birth_date: null,
  //   civil_status: '',
  //   mobile_number: null,
  //   provCode: null,
  //   citymunCode: null,
  //   brgyCode: null,
  //   street_address: '',
  //   zip_code: '',
  //   guardian_name: '',
  //   guardian_contact_number: null,
  //   monthly_family_income: 0,
  //    school_name: '',
  //   program: '',
  //   year: 1,
  //   previous_semester_gwa: 0,
  //   coe: null,
  //   cog: null,
  //   sedula: null,
  //   school_id: null
  // }


  const testData = {
    email: 'juan@mail.com',
    password: 'a',
    password_confirmation: 'a',
    lname: 'Dela Cruz',
    fname: 'Juan',
    mname: 'N',
    sex:'Male',
    birth_date: dayjs('2005-08-08'),
    civil_status: 'Single',
    mobile_number: '09706102876',
    provCode: '421',
    citymunCode: '42113',
    brgyCode: '42113014',
    street_address: 'Mabini St.',
    zip_code: '9210',
    guardian_name: 'Maria Clara Dela Cruz',
    guardian_contact_number: '09712223654',
    monthly_family_income: 10000,
  }
  const submit = () => {
    setProcessing(true);
    setErrors({});


    const allValues = form.getFieldsValue(true);
    // console.log('onFinish values:', values);
    // console.log('all form values:', allValues);

    // return

    axios
      .post(route('youth-register.store'), {
        ...allValues,
        birth_date: allValues.birth_date?.format('YYYY-MM-DD'),
      })
      .then((res) => {
        if(res.data.success){
          //window.location.href = route('youth-login.index');
          modal.success({
            title: 'Youth Profile Created',
            content:
              'Your youth profile has been created. You may now sign in and apply for available MYDO services such as scholarship, cash incentives, and activities.',
            okText: 'Got it',
            onOk: () => {
              router.visit(route('youth-login.index'))
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
      <Head title="Youth Registration" />

      <main className="min-h-screen bg-[#f7f9f5] text-slate-950">
        <div className="mx-auto w-full max-w-7xl px-6 py-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link href={route('home')} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950">
              <ArrowLeft className="h-4 w-4" />
              Back to portal
            </Link>

            <Link href={route('youth-login.index')} className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
              Already registered?
            </Link>
          </div>

          <section className="overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-xl shadow-emerald-900/10">
            <div className="grid lg:grid-cols-[360px_1fr]">
              <aside className="bg-emerald-800 px-6 py-8 text-white sm:px-8">
                <Link href={route('home')} className="inline-flex w-fit items-center gap-3">
                  <BrandLogo className="h-12 w-12 rounded-md bg-white p-1" />
                  <span>
                    <span className="block text-sm font-bold tracking-wid text-white">eKabataan</span>
                    <span className="block text-xs text-emerald-100">Youth Registration</span>
                  </span>
                </Link>

                <div className="mt-10">
                  <div className="mb-5 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-emerald-50">
                    <ClipboardList className="h-4 w-4" />
                    Youth Profiling
                  </div>

                  <h1 className="text-3xl font-bold leading-tight">Create your youth account.</h1>
                  <p className="mt-4 text-sm leading-6 text-emerald-50">
                    Fill out your basic youth information once, then use this profile when applying for MYDO services.
                  </p>
                </div>

                <div className="mt-10 space-y-3">
                  <SidebarItem icon={UserRound} label="Personal details" />
                  <SidebarItem icon={Home} label="Address verification" />
                  <SidebarItem icon={Users} label="Family / guardian details" />
                  <SidebarItem icon={LockKeyhole} label="Secure login account" />
                </div>
              </aside>

              <div className="px-6 py-8 sm:px-8 lg:px-10">
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase text-emerald-700">Applicant Form</p>
                  <Typography.Title level={2} className="!mb-0 !mt-2 !text-2xl">
                    Youth profile registration
                  </Typography.Title>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Complete your personal, address, and guardian information. Service applications are available after login.
                  </p>
                </div>

                <Form form={form}
                  layout="vertical"
                  onFinish={submit}
                  onFinishFailed={(errorInfo) => {
                    console.log('Youth registration validation failed:', errorInfo);
                  }}
                  preserve
                  initialValues={testData}
                  className="space-y-6">
                      <FormSection icon={LockKeyhole} title="Account Information">
                        <div className="flex md:gap-4 flex-col md:flex-row">
                          <div className="w-full">
                            <Form.Item
                              name="email"
                              label="Email"
                              validateStatus={errors.email ? "error" : ""}
                              help={errors.email ? errors.email[0] : ""}
                            >
                              <Input prefix={<Mail className="h-4 w-4 text-slate-400" />}
                                placeholder="email@example.com" />
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
                </Form>

                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Link href={route('youth-login.index')} className="inline-flex justify-center rounded-md px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                    I already have an account
                  </Link>

                  <Button htmlType="button"
                    type="primary" size="large"
                    loading={processing}
                    onClick={() => {
                      form.submit();
                    }}>
                    Create Youth Profile
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
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
