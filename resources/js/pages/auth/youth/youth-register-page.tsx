import BrandLogo from '@/components/brand-logo';
import FormSection from '@/components/form-section';
import MydoLogo from '@/components/mydo-logo';
import SelectBarangay from '@/components/select-barangay';
import SelectCity from '@/components/select-city';
import SelectProvince from '@/components/select-province';
import { Head, Link, router } from '@inertiajs/react';
import { App, Button, DatePicker, Form, Input, InputNumber, Select, Typography } from 'antd';
import axios, { isAxiosError } from 'axios';
import dayjs, { type Dayjs } from 'dayjs';

import type { FormProps } from 'antd';

type FormError<T> = Parameters<
  NonNullable<FormProps<T>['onFinishFailed']>
>[0];

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Building2,
  ClipboardList,
  GraduationCap,
  Hash,
  Home,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';



type YouthRegistrationForm = {
  email: string;
  password: string;
  password_confirmation: string;
  lname: string;
  fname: string;
  mname?: string;
  suffix?: string;
  birth_date?: Dayjs | null;
  sex: string;
  civil_status: string;
  mobile_number: string;
  provCode: string;
  citymunCode: string;
  brgyCode: string;
  street_address: string;
  zip_code?: string;
  student_id?: string;
  school_name: string;
  school_address?: string;
  program: string;
  year: number;
  previous_semester_gwa?: number;
  is_graduated?: boolean;
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

const yearLevelOptions = [
  { value: 1, label: '1st Year College' },
  { value: 2, label: '2nd Year College' },
  { value: 3, label: '3rd Year College' },
  { value: 4, label: '4th Year College' },
  { value: 5, label: '5th Year College' },
];

export default function YouthRegisterPage() {
  const { modal } = App.useApp();
  const [form] = Form.useForm<YouthRegistrationForm>();
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [processing, setProcessing] = useState(false);

  const provCode = Form.useWatch('provCode', form) ?? '';
  const citymunCode = Form.useWatch('citymunCode', form) ?? '';

  const initialData = {
    email: '',
    password: '',
    password_confirmation: '',
    lname: '',
    fname: '',
    mname: '',
    suffix: '',
    sex: undefined,
    birth_date: null,
    civil_status: undefined,
    mobile_number: '',
    provCode: undefined,
    citymunCode: undefined,
    brgyCode: undefined,
    street_address: '',
    zip_code: '',
    student_id: '',
    school_name: '',
    school_address: '',
    program: '',
    year: 1,
    is_graduated: false,
    guardian_name: '',
    guardian_contact_number: '',
    monthly_family_income: 0,
  };

  // const sampleData = {
  //   email: 'shen@mail.test',
  //   password: 'password123',
  //   password_confirmation: 'password123',
  //   lname: 'Dela Cruz',
  //   fname: 'Shen',
  //   mname: 'N',
  //   suffix: '',
  //   sex: 'Male',
  //   birth_date: dayjs('2001-03-04'),
  //   civil_status: 'Single',
  //   mobile_number: '09121231234',
  //   provCode: '973',
  //   citymunCode: '97308',
  //   brgyCode: '97308035',
  //   street_address: 'Purok 1, Poblacion',
  //   zip_code: '9123',
  //   student_id: '20101122',
  //   school_name: 'Polytechnic University of the Philippines',
  //   school_address: 'Taguig City',
  //   program: 'BS Information Technology',
  //   year: 1,
  //   is_graduated: false,
  //   guardian_name: 'Maria Clara Dela Cruz',
  //   guardian_contact_number: '09121122123',
  //   monthly_family_income: 10000,
  // };

  const submit = (values: YouthRegistrationForm) => {
    if (processing) return;
    setProcessing(true);
    setErrors({});

    const payload = {
      ...values,
      birth_date: values.birth_date ? dayjs(values.birth_date).format('YYYY-MM-DD') : null,
      school_name: values.school_name.trim(),
      school_address: values.school_address?.trim() || null,
      program: values.program.trim(),
      year: values.year,
      student_id: values.student_id?.trim() || null,
      is_graduated: false,
    };

    axios
      .post(route('youth-register.store'), payload)
      .then((res) => {
        if (res.data.success) {
          modal.success({
            title: 'Youth Profile Created Successfully!',
            content:
              'Your youth registration has been saved. You may now sign in to your eKabataan account to apply for scholarships, participate in youth activities, and access cash incentives.',
            okText: 'Proceed to Sign In',
            onOk: () => {
              router.visit(route('youth-login.index'));
            },
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
              <ul className="mb-0 list-disc pl-5 text-sm">
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

  const onFinishFailed = (errorInfo:FormError<YouthRegistrationForm>) => {
    console.warn('Form validation failed:', errorInfo);
    modal.warning({
      title: 'Please check required fields',
      content: (
        <div>
          <p className="text-sm text-slate-600 mb-2">Some required fields are missing or invalid:</p>
          <ul className="list-disc pl-5 text-xs text-red-600 space-y-1">
            {errorInfo.errorFields.map((field, idx: number) => (
              <li key={idx}>
                <span className="font-semibold capitalize">{field.name.join(' ').replace(/_/g, ' ')}:</span> {field.errors.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      ),
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

  // Restrict birth date: must be between 15 and 30 years old
  // const disabledBirthDate = (current: Dayjs) => {
  //   if (!current) return false;
  //   const youngest = dayjs().subtract(15, 'year').endOf('day');
  //   const oldest = dayjs().subtract(31, 'year').startOf('day');
  //   return current.isAfter(youngest) || current.isBefore(oldest);
  // };

  return (
    <>
      <Head title="Youth Registration - eKabataan" />

      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <Link
              href={route('home')}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-emerald-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to portal home
            </Link>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">Already registered?</span>
              <Link
                href={route('youth-login.index')}
                className="font-semibold text-emerald-700 underline-offset-4 hover:text-emerald-800 hover:underline"
              >
                Sign in here
              </Link>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
            <div className="grid lg:grid-cols-[380px_1fr]">
              {/* Left Brand & Step Guide Sidebar */}
              <aside className="relative flex flex-col justify-between bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white sm:p-8">
                <div>
                  <Link href={route('home')} className="group inline-flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <MydoLogo className="h-11 w-11 rounded-full bg-white p-0.5 shadow-sm transition-transform group-hover:scale-105" />
                      <div className="h-6 w-px bg-white/20" />
                      <BrandLogo className="h-10 w-10 rounded-lg bg-white p-1 transition-transform group-hover:scale-105" />
                    </div>
                    <div>
                      <span className="block text-base font-bold tracking-tight text-white">eKabataan</span>
                      <span className="block text-xs font-medium text-emerald-200">Municipal Youth Development Office</span>
                    </div>
                  </Link>

                  <div className="mt-8">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-white/15 backdrop-blur-sm">
                      <ClipboardList className="h-3.5 w-3.5" />
                      Official Youth Registry
                    </div>

                    <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
                      Create your youth resident profile.
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-emerald-100/90">
                      Register once to access youth scholarships, cash incentives, community activities, and youth leadership programs.
                    </p>
                  </div>

                  <div className="mt-8 space-y-2.5">
                    <SidebarItem icon={LockKeyhole} label="Account & Login" step={1} />
                    <SidebarItem icon={UserRound} label="Personal Identity" step={2} />
                    <SidebarItem icon={Home} label="Barangay & Address" step={3} />
                    <SidebarItem icon={GraduationCap} label="College Education" step={4} />
                    <SidebarItem icon={Users} label="Family & Guardian" step={5} />
                  </div>
                </div>

                <div className="mt-10 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-200">
                    <ShieldCheck className="h-4 w-4 text-emerald-300" />
                    Data Privacy Protected
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-emerald-100/75">
                    Under RA 10742 (SK Reform Act of 2015), youth profiling covers residents aged 15 to 30. Your details are securely handled under RA 10173.
                  </p>
                </div>
              </aside>

              {/* Right Form Container */}
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-8 border-b border-slate-100 pb-6">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase text-emerald-700">
                    <Sparkles className="h-3.5 w-3.5" />
                    Profiling Form
                  </span>
                  <Typography.Title level={2} className="!mb-1 !mt-2 !text-2xl !font-bold !text-slate-900">
                    Youth Profile Registration
                  </Typography.Title>
                  <p className="text-sm text-slate-500">
                    Please provide accurate information. You will use these records when applying for MYDO services.
                  </p>
                </div>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={submit}
                  onFinishFailed={onFinishFailed}
                  scrollToFirstError
                  initialValues={initialData}
                  className="space-y-6"
                >
                  {/* Step 1: Account Information */}
                  <FormSection icon={LockKeyhole} title="Account & Security">
                    <div className="w-full">
                      <Form.Item
                        name="email"
                        label="Email Address"
                        validateStatus={errors.email ? 'error' : ''}
                        help={errors.email ? errors.email[0] : 'This will be used for your portal sign in and notifications.'}
                        rules={[{ required: true, message: 'Please enter a valid email address.' }]}
                      >
                        <Input
                          size="large"
                          prefix={<Mail className="h-4 w-4 text-slate-400" />}
                          placeholder="your.email@example.com"
                        />
                      </Form.Item>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Form.Item
                        name="password"
                        label="Password"
                        validateStatus={errors.password ? 'error' : ''}
                        help={errors.password ? errors.password[0] : ''}
                        rules={[{ required: true, message: 'Password is required.' }]}
                      >
                        <Input.Password size="large" placeholder="Create a secure password" />
                      </Form.Item>

                      <Form.Item
                        name="password_confirmation"
                        label="Confirm Password"
                        validateStatus={errors.password_confirmation ? 'error' : ''}
                        help={errors.password_confirmation ? errors.password_confirmation[0] : ''}
                        rules={[{ required: true, message: 'Please confirm your password.' }]}
                      >
                        <Input.Password size="large" placeholder="Re-type your password" />
                      </Form.Item>
                    </div>
                  </FormSection>

                  {/* Step 2: Personal Information */}
                  <FormSection icon={UserRound} title="Personal Information">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Form.Item
                        name="lname"
                        label="Last Name"
                        validateStatus={errors.lname ? 'error' : ''}
                        help={errors.lname ? errors.lname[0] : ''}
                        rules={[{ required: true, message: 'Last name is required.' }]}
                      >
                        <Input size="large" placeholder="e.g. Dela Cruz" />
                      </Form.Item>

                      <Form.Item
                        name="fname"
                        label="First Name"
                        validateStatus={errors.fname ? 'error' : ''}
                        help={errors.fname ? errors.fname[0] : ''}
                        rules={[{ required: true, message: 'First name is required.' }]}
                      >
                        <Input size="large" placeholder="e.g. Juan" />
                      </Form.Item>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="sm:col-span-2">
                        <Form.Item
                          name="mname"
                          label="Middle Name (Optional)"
                          validateStatus={errors.mname ? 'error' : ''}
                          help={errors.mname ? errors.mname[0] : ''}
                        >
                          <Input size="large" placeholder="e.g. Santos" />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="suffix"
                          label="Suffix (Optional)"
                          validateStatus={errors.suffix ? 'error' : ''}
                          help={errors.suffix ? errors.suffix[0] : ''}
                        >
                          <Input size="large" placeholder="e.g. Jr., III" />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Form.Item
                          name="birth_date"
                          label="Date of Birth"
                          validateStatus={errors.birth_date ? 'error' : ''}
                          help={errors.birth_date ? errors.birth_date[0] : 'Ages 15–30 eligible'}
                          rules={[{ required: true, message: 'Birth date is required.' }]}
                        >
                          <DatePicker
                            size="large"
                            className="w-full"
                            placeholder="YYYY-MM-DD"
                            //disabledDate={disabledBirthDate}
                          />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="sex"
                          label="Sex"
                          validateStatus={errors.sex ? 'error' : ''}
                          help={errors.sex ? errors.sex[0] : ''}
                          rules={[{ required: true, message: 'Sex is required.' }]}
                        >
                          <Select size="large" allowClear options={sexOptions} placeholder="Select sex" />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="civil_status"
                          label="Civil Status"
                          validateStatus={errors.civil_status ? 'error' : ''}
                          help={errors.civil_status ? errors.civil_status[0] : ''}
                          rules={[{ required: true, message: 'Civil status is required.' }]}
                        >
                          <Select size="large" allowClear options={civilStatusOptions} placeholder="Select status" />
                        </Form.Item>
                      </div>
                    </div>

                    <div>
                      <Form.Item
                        name="mobile_number"
                        label="Active Mobile Number"
                        validateStatus={errors.mobile_number ? 'error' : ''}
                        help={errors.mobile_number ? errors.mobile_number[0] : 'Format: 09XXXXXXXXX or +639XXXXXXXXX'}
                        rules={[{ required: true, message: 'Mobile number is required.' }]}
                      >
                        <Input
                          size="large"
                          prefix={<Phone className="h-4 w-4 text-slate-400" />}
                          placeholder="09XXXXXXXXX"
                        />
                      </Form.Item>
                    </div>
                  </FormSection>

                  {/* Step 3: Address Information */}
                  <FormSection icon={Home} title="Residential Address">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Form.Item
                          name="provCode"
                          label="Province"
                          validateStatus={errors.provCode ? 'error' : ''}
                          help={errors.provCode ? errors.provCode[0] : ''}
                          rules={[{ required: true, message: 'Province is required.' }]}
                        >
                          <SelectProvince onChange={resetCityAndBarangay} />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="citymunCode"
                          label="City / Municipality"
                          validateStatus={errors.citymunCode ? 'error' : ''}
                          help={errors.citymunCode ? errors.citymunCode[0] : ''}
                          rules={[{ required: true, message: 'City / Municipality is required.' }]}
                        >
                          <SelectCity provinceCode={provCode} onChange={resetBarangay} />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="brgyCode"
                          label="Barangay"
                          validateStatus={errors.brgyCode ? 'error' : ''}
                          help={errors.brgyCode ? errors.brgyCode[0] : ''}
                          rules={[{ required: true, message: 'Barangay is required.' }]}
                        >
                          <SelectBarangay provinceCode={provCode} cityCode={citymunCode} />
                        </Form.Item>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
                      <div>
                        <Form.Item
                          name="street_address"
                          label="House No. / Street / Purok / Sitio"
                          validateStatus={errors.street_address ? 'error' : ''}
                          help={errors.street_address ? errors.street_address[0] : ''}
                          rules={[{ required: true, message: 'Street address is required.' }]}
                        >
                          <Input size="large" placeholder="Purok 4, Mabini Street" />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="zip_code"
                          label="ZIP Code"
                          validateStatus={errors.zip_code ? 'error' : ''}
                          help={errors.zip_code ? errors.zip_code[0] : ''}
                        >
                          <Input size="large" placeholder="e.g. 8714" />
                        </Form.Item>
                      </div>
                    </div>
                  </FormSection>

                  {/* Step 4: College Educational Background */}
                  <FormSection icon={GraduationCap} title="College Educational Background">
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <Form.Item
                            name="school_name"
                            label="College / University Name"
                            validateStatus={errors.school_name ? 'error' : ''}
                            help={errors.school_name ? errors.school_name[0] : ''}
                            rules={[{ required: true, message: 'College or university name is required.' }]}
                          >
                            <Input
                              size="large"
                              prefix={<GraduationCap className="h-4 w-4 text-slate-400" />}
                              placeholder="e.g. Bukidnon State University, Central Mindanao University"
                            />
                          </Form.Item>
                        </div>

                        <div>
                          <Form.Item
                            name="program"
                            label="Course / Degree Program"
                            validateStatus={errors.program ? 'error' : ''}
                            help={errors.program ? errors.program[0] : ''}
                            rules={[{ required: true, message: 'Degree program or course is required.' }]}
                          >
                            <Input
                              size="large"
                              prefix={<BookOpen className="h-4 w-4 text-slate-400" />}
                              placeholder="e.g. BS Information Technology, BS Nursing"
                            />
                          </Form.Item>
                        </div>

                        <div>
                          <Form.Item
                            name="year"
                            label="Year Level"
                            validateStatus={errors.year ? 'error' : ''}
                            help={errors.year ? errors.year[0] : ''}
                            rules={[{ required: true, message: 'College year level is required.' }]}
                          >
                            <Select
                              size="large"
                              allowClear
                              options={yearLevelOptions}
                              placeholder="Select college year level"
                            />
                          </Form.Item>
                        </div>

                        <div>
                          <Form.Item
                            name="student_id"
                            label="Student ID Number (Optional)"
                            validateStatus={errors.student_id ? 'error' : ''}
                            help={errors.student_id ? errors.student_id[0] : ''}
                          >
                            <Input
                              size="large"
                              prefix={<Hash className="h-4 w-4 text-slate-400" />}
                              placeholder="e.g. 2024-00123"
                            />
                          </Form.Item>
                        </div>

                        <div>
                          <Form.Item
                            name="school_address"
                            label="College Campus / Address (Optional)"
                            validateStatus={errors.school_address ? 'error' : ''}
                            help={errors.school_address ? errors.school_address[0] : ''}
                          >
                            <Input
                              size="large"
                              prefix={<Building2 className="h-4 w-4 text-slate-400" />}
                              placeholder="e.g. Malaybalay City, Bukidnon"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  </FormSection>

                  {/* Step 5: Family & Guardian Information */}
                  <FormSection icon={Users} title="Family & Guardian Information">
                    <div>
                      <Form.Item
                        name="guardian_name"
                        label="Parent or Guardian Full Name"
                        validateStatus={errors.guardian_name ? 'error' : ''}
                        help={errors.guardian_name ? errors.guardian_name[0] : ''}
                        rules={[{ required: true, message: 'Guardian name is required.' }]}
                      >
                        <Input size="large" placeholder="Full name of parent or legal guardian" />
                      </Form.Item>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Form.Item
                          name="guardian_contact_number"
                          label="Guardian Mobile Contact"
                          validateStatus={errors.guardian_contact_number ? 'error' : ''}
                          help={errors.guardian_contact_number ? errors.guardian_contact_number[0] : ''}
                          rules={[{ required: true, message: 'Guardian contact number is required.' }]}
                        >
                          <Input
                            size="large"
                            prefix={<Phone className="h-4 w-4 text-slate-400" />}
                            placeholder="09XXXXXXXXX"
                          />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="monthly_family_income"
                          label="Estimated Monthly Household Income (₱)"
                          validateStatus={errors.monthly_family_income ? 'error' : ''}
                          help={errors.monthly_family_income ? errors.monthly_family_income[0] : ''}
                          rules={[{ required: true, message: 'Monthly family income is required.' }]}
                        >
                          <InputNumber
                            size="large"
                            className="w-full"
                            placeholder="e.g. 10000"
                            formatter={(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value!.replace(/₱\s?|(,*)/g, '') as unknown as number}
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </FormSection>

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={route('youth-login.index')}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    I already have an account
                  </Link>

                  <Button
                    htmlType="submit"
                    type="primary"
                    size="large"
                    loading={processing}
                    onClick={() => form.submit()}
                    className="!h-12 !rounded-xl !bg-emerald-700 !px-8 !text-base !font-semibold shadow-md shadow-emerald-700/25 hover:!bg-emerald-800"
                  >
                    <span>Complete Youth Registration</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
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

function SidebarItem({
  icon: Icon,
  label,
  step,
}: {
  icon: LucideIcon;
  label: string;
  step: number;
}) {
  return (
    <div className="flex items-center gap-3.5 rounded-xl bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/15">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/30 text-emerald-100 ring-1 ring-white/20">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold tracking-wider uppercase text-emerald-200">Step 0{step}</p>
        <p className="text-sm font-medium text-white">{label}</p>
      </div>
    </div>
  );
}
