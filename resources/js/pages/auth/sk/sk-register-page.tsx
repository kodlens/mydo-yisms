import BrandLogo from '@/components/brand-logo';
import FormSection from '@/components/form-section';
import MydoLogo from '@/components/mydo-logo';
import SelectBarangay from '@/components/select-barangay';
import SelectCity from '@/components/select-city';
import SelectProvince from '@/components/select-province';
import { Head, Link, router } from '@inertiajs/react';
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  Select,
  Typography,
  Upload,
  type FormProps,
  type UploadFile,
  type UploadProps,
} from 'antd';
import axios, { isAxiosError } from 'axios';
import dayjs, { type Dayjs } from 'dayjs';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Home,
  IdCard,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';

type FormError<T> = Parameters<NonNullable<FormProps<T>['onFinishFailed']>>[0];

type SkRegistrationForm = {
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
  sk_position: string;
  school_id: UploadFile[];
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

const skPositionOptions = [
  { value: 'SK Chairperson', label: 'SK Chairperson' },
  { value: 'SK Kagawad', label: 'SK Kagawad (Councilor)' },
  { value: 'SK Secretary', label: 'SK Secretary' },
  { value: 'SK Treasurer', label: 'SK Treasurer' },
  { value: 'SK Federation Officer', label: 'SK Federation Officer' },
];

export default function SkRegisterPage({ xToken }: { xToken: string }) {
  const { modal, notification } = App.useApp();
  const [form] = Form.useForm<SkRegistrationForm>();
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
    sk_position: undefined,
    school_id: [],
  };

  const idUploadProps: UploadProps = {
    name: 'upload',
    action: '/temp-upload',
    headers: {
      'X-CSRF-TOKEN': xToken,
    },
    listType: 'picture',
    maxCount: 1,
    accept: '.png,.jpg,.jpeg,image/png,image/jpeg',
    beforeUpload: (file) => {
      const allowedMimeTypes = ['image/png', 'image/jpeg'];
      const hasValidExtension = /\.(png|jpe?g)$/i.test(file.name);
      const isAllowedType = allowedMimeTypes.includes(file.type) && hasValidExtension;
      const isUnder5MB = file.size / 1024 / 1024 <= 5;

      if (!isAllowedType) {
        notification.error({
          message: `${file.name} is not an allowed image format`,
          placement: 'topRight',
          description: 'Strictly PNG, JPG, or JPEG image files only. PDFs and other formats are not accepted.',
        });
      }

      if (!isUnder5MB) {
        notification.error({
          message: `${file.name} is too large`,
          placement: 'topRight',
          description: 'Please upload an ID image not greater than 5MB.',
        });
      }

      return (isAllowedType && isUnder5MB) || Upload.LIST_IGNORE;
    },
    onChange(info) {
      if (info.file.status === 'done') {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.school_id;
          return next;
        });
        notification.success({
          message: 'SK Official ID uploaded',
          description: `${info.file.name} uploaded successfully.`,
          placement: 'topRight',
        });
      } else if (info.file.status === 'error') {
        notification.error({
          message: `${info.file.name} upload failed`,
          description: 'Please upload a valid PNG, JPG, or JPEG image (max 5MB).',
          placement: 'topRight',
        });
      }
    },
    onRemove(file) {
      const filename = file.response?.filename;
      if (filename) {
        axios
          .post('/temp-remove/' + filename)
          .then((res) => {
            if (res.data.status === 'temp_deleted') {
              notification.info({
                message: 'Uploaded ID removed',
                placement: 'topRight',
              });
            }
          })
          .catch(() => {});
      }
    },
  };

  const submit = (values: SkRegistrationForm) => {
    if (processing) return;
    setProcessing(true);
    setErrors({});

    const payload = {
      ...values,
      birth_date: values.birth_date ? dayjs(values.birth_date).format('YYYY-MM-DD') : null,
      school_id: values.school_id,
    };

    axios
      .post(route('sk-register.store'), payload)
      .then((res) => {
        if (res.data.success) {
          modal.info({
            title: 'SK Official Registration Submitted',
            content:
              'Your Sangguniang Kabataan (SK) Official registration has been submitted successfully! It is now pending verification and approval by the Municipal Youth Development Office (MYDO) staff. You will be able to sign in once your SK account has been approved.',
            okText: 'Proceed to SK Sign In',
            onOk: () => {
              router.visit(route('sk-login.index'));
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
            title: 'Please check your SK registration details',
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

  const onFinishFailed = (errorInfo: FormError<SkRegistrationForm>) => {
    modal.warning({
      title: 'Please check required fields',
      content: (
        <div>
          <p className="mb-2 text-sm text-slate-600">Some required fields are missing or invalid:</p>
          <ul className="list-disc space-y-1 pl-5 text-xs text-red-600">
            {errorInfo.errorFields.map((field, idx: number) => (
              <li key={idx}>
                <span className="font-semibold capitalize">{field.name.join(' ').replace(/_/g, ' ')}:</span>{' '}
                {field.errors.join(', ')}
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

  return (
    <>
      <Head title="SK Official Registration - eKabataan" />

      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={route('home')}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-indigo-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to portal home
            </Link>

            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-slate-500">College Student / Youth? </span>
                <Link
                  href={route('youth-register.index')}
                  className="font-semibold text-emerald-700 underline-offset-4 hover:underline"
                >
                  Youth Registration
                </Link>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-slate-500">Already registered as SK? </span>
                <Link
                  href={route('sk-login.index')}
                  className="font-semibold text-indigo-700 underline-offset-4 hover:text-indigo-800 hover:underline"
                >
                  SK Sign in here
                </Link>
              </div>
            </div>
          </div>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/50">
            <div className="grid lg:grid-cols-[380px_1fr]">
              {/* Left Brand & Step Guide Sidebar */}
              <aside className="relative flex flex-col justify-between bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 p-6 text-white sm:p-8">
                <div>
                  <Link href={route('home')} className="group inline-flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <MydoLogo className="h-11 w-11 rounded-full bg-white p-0.5 shadow-sm transition-transform group-hover:scale-105" />
                      <div className="h-6 w-px bg-white/20" />
                      <BrandLogo className="h-10 w-10 rounded-lg bg-white p-1 transition-transform group-hover:scale-105" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="block text-base font-bold tracking-tight text-white">eKabataan</span>
                        <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[10px] font-extrabold text-indigo-950 uppercase">
                          SK
                        </span>
                      </div>
                      <span className="block text-xs font-medium text-indigo-200">
                        Municipal Youth Development Office
                      </span>
                    </div>
                  </Link>

                  <div className="mt-8">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-amber-200 ring-1 ring-white/15 backdrop-blur-sm">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Official SK Governance Registry
                    </div>

                    <h1 className="text-2xl font-bold leading-snug sm:text-3xl">
                      Register your Sangguniang Kabataan Official Account.
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-indigo-100/90">
                      Establish your official barangay SK account to upload event photo evidence, submit accomplishment
                      descriptions, and coordinate with MYDO.
                    </p>
                  </div>

                  <div className="mt-8 space-y-2.5">
                    <SidebarItem icon={LockKeyhole} label="Account & Login" step={1} />
                    <SidebarItem icon={UserRound} label="Personal Identity" step={2} />
                    <SidebarItem icon={Home} label="Barangay Jurisdiction" step={3} />
                    <SidebarItem icon={Award} label="SK Position & Official ID" step={4} />
                  </div>
                </div>

                <div className="mt-10 rounded-xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                    <ShieldCheck className="h-4 w-4 text-amber-300" />
                    RA 10742 (SK Reform Act)
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-indigo-100/80">
                    All SK Official registrations are verified by MYDO staff against official barangay proclamation and
                    appointment records before activation.
                  </p>
                </div>
              </aside>

              {/* Right Form Container */}
              <div className="p-6 sm:p-8 lg:p-10">
                <div className="mb-8 border-b border-slate-100 pb-6">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-indigo-700 uppercase">
                    <Sparkles className="h-3.5 w-3.5" />
                    Sangguniang Kabataan Onboarding
                  </span>
                  <Typography.Title level={2} className="!mb-1 !mt-2 !text-2xl !font-bold !text-slate-900">
                    SK Official Registration Form
                  </Typography.Title>
                  <p className="text-sm text-slate-500">
                    Provide your official barangay designation and upload a clear photo of your valid SK ID or
                    Certificate of Proclamation.
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
                        label="Official or Personal Email Address"
                        validateStatus={errors.email ? 'error' : undefined}
                        help={errors.email ? errors.email[0] : 'Used for signing in to the SK Official Portal.'}
                        rules={[{ required: true, message: 'Please enter a valid email address.' }]}
                      >
                        <Input
                          size="large"
                          prefix={<Mail className="h-4 w-4 text-slate-400" />}
                          placeholder="sk.official@example.com"
                        />
                      </Form.Item>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Form.Item
                        name="password"
                        label="Password"
                        validateStatus={errors.password ? 'error' : undefined}
                        help={errors.password ? errors.password[0] : undefined}
                        rules={[{ required: true, message: 'Password is required.' }]}
                      >
                        <Input.Password size="large" placeholder="Create a secure password" />
                      </Form.Item>

                      <Form.Item
                        name="password_confirmation"
                        label="Confirm Password"
                        validateStatus={errors.password_confirmation ? 'error' : undefined}
                        help={errors.password_confirmation ? errors.password_confirmation[0] : undefined}
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
                        validateStatus={errors.lname ? 'error' : undefined}
                        help={errors.lname ? errors.lname[0] : undefined}
                        rules={[{ required: true, message: 'Last name is required.' }]}
                      >
                        <Input size="large" placeholder="e.g. Dela Cruz" />
                      </Form.Item>

                      <Form.Item
                        name="fname"
                        label="First Name"
                        validateStatus={errors.fname ? 'error' : undefined}
                        help={errors.fname ? errors.fname[0] : undefined}
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
                          validateStatus={errors.mname ? 'error' : undefined}
                          help={errors.mname ? errors.mname[0] : undefined}
                        >
                          <Input size="large" placeholder="e.g. Santos" />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="suffix"
                          label="Suffix (Optional)"
                          validateStatus={errors.suffix ? 'error' : undefined}
                          help={errors.suffix ? errors.suffix[0] : undefined}
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
                          validateStatus={errors.birth_date ? 'error' : undefined}
                          help={errors.birth_date ? errors.birth_date[0] : 'Ages 15–30 eligible'}
                          rules={[{ required: true, message: 'Birth date is required.' }]}
                        >
                          <DatePicker size="large" className="w-full" placeholder="YYYY-MM-DD" />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="sex"
                          label="Sex"
                          validateStatus={errors.sex ? 'error' : undefined}
                          help={errors.sex ? errors.sex[0] : undefined}
                          rules={[{ required: true, message: 'Sex is required.' }]}
                        >
                          <Select size="large" allowClear options={sexOptions} placeholder="Select sex" />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="civil_status"
                          label="Civil Status"
                          validateStatus={errors.civil_status ? 'error' : undefined}
                          help={errors.civil_status ? errors.civil_status[0] : undefined}
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
                        validateStatus={errors.mobile_number ? 'error' : undefined}
                        help={
                          errors.mobile_number ? errors.mobile_number[0] : 'Format: 09XXXXXXXXX or +639XXXXXXXXX'
                        }
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

                  {/* Step 3: Barangay Jurisdiction & Address */}
                  <FormSection icon={Home} title="Barangay Jurisdiction & Address">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Form.Item
                          name="provCode"
                          label="Province"
                          validateStatus={errors.provCode ? 'error' : undefined}
                          help={errors.provCode ? errors.provCode[0] : undefined}
                          rules={[{ required: true, message: 'Province is required.' }]}
                        >
                          <SelectProvince onChange={resetCityAndBarangay} />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="citymunCode"
                          label="City / Municipality"
                          validateStatus={errors.citymunCode ? 'error' : undefined}
                          help={errors.citymunCode ? errors.citymunCode[0] : undefined}
                          rules={[{ required: true, message: 'City / Municipality is required.' }]}
                        >
                          <SelectCity provinceCode={provCode} onChange={resetBarangay} />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="brgyCode"
                          label="Assigned Barangay"
                          validateStatus={errors.brgyCode ? 'error' : undefined}
                          help={errors.brgyCode ? errors.brgyCode[0] : undefined}
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
                          label="Barangay Hall / Purok / Street Address"
                          validateStatus={errors.street_address ? 'error' : undefined}
                          help={errors.street_address ? errors.street_address[0] : undefined}
                          rules={[{ required: true, message: 'Street address is required.' }]}
                        >
                          <Input size="large" placeholder="Purok 1, Barangay Hall Compound" />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="zip_code"
                          label="ZIP Code"
                          validateStatus={errors.zip_code ? 'error' : undefined}
                          help={errors.zip_code ? errors.zip_code[0] : undefined}
                        >
                          <Input size="large" placeholder="e.g. 7028" />
                        </Form.Item>
                      </div>
                    </div>
                  </FormSection>

                  {/* Step 4: SK Position & Official ID Upload */}
                  <FormSection icon={Award} title="SK Official Designation & Mandatory ID Upload">
                    <div className="space-y-4">
                      <div>
                        <Form.Item
                          name="sk_position"
                          label="Sangguniang Kabataan (SK) Position"
                          validateStatus={errors.sk_position ? 'error' : undefined}
                          help={errors.sk_position ? errors.sk_position[0] : undefined}
                          rules={[{ required: true, message: 'Please select your official SK position.' }]}
                        >
                          <Select
                            size="large"
                            allowClear
                            options={skPositionOptions}
                            placeholder="Select your SK Official position"
                          />
                        </Form.Item>
                      </div>

                      <div>
                        <Form.Item
                          name="school_id"
                          label={
                            <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
                              <IdCard className="h-4 w-4 text-indigo-700" />
                              Upload Valid SK Official ID / Certificate of Proclamation (Required — PNG, JPG, JPEG only)
                            </span>
                          }
                          valuePropName="fileList"
                          getValueFromEvent={(e) => {
                            if (Array.isArray(e)) return e;
                            return e?.fileList;
                          }}
                          validateStatus={errors.school_id ? 'error' : undefined}
                          help={errors.school_id ? errors.school_id[0] : undefined}
                          rules={[
                            {
                              required: true,
                              validator: async (_, fileList: UploadFile[] | undefined) => {
                                if (!fileList || fileList.length === 0) {
                                  return Promise.reject(
                                    new Error('SK Official ID upload is required. No ID, no registration.')
                                  );
                                }
                                const file = fileList[0];
                                if (file.status === 'uploading') {
                                  return Promise.reject(
                                    new Error('Please wait for your SK ID image to finish uploading.')
                                  );
                                }
                                if (file.status === 'error' || !file.response?.filename) {
                                  return Promise.reject(
                                    new Error('Please upload a valid SK ID image (PNG, JPG, or JPEG).')
                                  );
                                }
                                const isAllowedExt = /\.(png|jpe?g)$/i.test(file.name || '');
                                if (!isAllowedExt) {
                                  return Promise.reject(
                                    new Error('Strictly PNG, JPG, or JPEG image format is required.')
                                  );
                                }
                                return Promise.resolve();
                              },
                            },
                          ]}
                        >
                          <Upload.Dragger {...idUploadProps}>
                            <div className="flex flex-col items-center py-4 text-center">
                              <UploadCloud className="mb-2.5 h-8 w-8 text-indigo-700" />
                              <p className="text-sm font-semibold text-slate-800">
                                Click or drag your SK Official ID / Oath image here to upload
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Strictly <strong>PNG, JPG, or JPEG</strong> only (max 5MB) · Required for MYDO verification
                              </p>
                            </div>
                          </Upload.Dragger>
                        </Form.Item>
                      </div>
                    </div>
                  </FormSection>

                  <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link
                      href={route('sk-login.index')}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      I already have an SK account
                    </Link>

                    <Button
                      htmlType="submit"
                      type="primary"
                      size="large"
                      loading={processing}
                      className="!h-12 !rounded-xl !bg-indigo-700 !px-8 !text-base !font-semibold shadow-md shadow-indigo-700/25 hover:!bg-indigo-800"
                    >
                      <span>Complete SK Official Registration</span>
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
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/30 text-indigo-100 ring-1 ring-white/20">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold tracking-wider text-amber-300 uppercase">Step 0{step}</p>
        <p className="text-sm font-medium text-white">{label}</p>
      </div>
    </div>
  );
}
