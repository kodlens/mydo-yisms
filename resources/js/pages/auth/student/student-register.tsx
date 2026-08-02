import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, BookOpen, GraduationCap, Home, LockKeyhole, Mail, Phone, UserRound, Users, type LucideIcon } from 'lucide-react';
import { type FormEventHandler, type ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import TextField from '@/components/text-field';
import SelectField from '@/components/select-field';
import SelectProvince from '@/components/select-province';
import SelectCity from '@/components/select-city';
import SelectBarangay from '@/components/select-barangay';

type StudentRegistrationForm = {
  username: string;
  email: string;
  password: string;
  password_confirmation: string;
  lname: string;
  fname: string;
  mname: string;
  suffix: string;
  birth_date: string;
  sex: string;
  civil_status: string;
  mobile_number: string;
  provCode: string;
  citymunCode: string;
  brgyCode: string;
  street_address: string;
  zip_code: string;
  school_name: string;
  program: string;
  year: string;
  guardian_name: string;
  guardian_contact_number: string;
  monthly_family_income: string;
};

const yearOptions = [
  { value: 1, label: '1st Year' },
  { value: 2, label: '2nd Year' },
  { value: 3, label: '3rd Year' },
  { value: 4, label: '4th Year' },
];
const sexOptions = ['Female', 'Male'];
const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Separated'];

export default function StudentRegister() {
  const { data, setData, post, processing, errors, reset } = useForm<StudentRegistrationForm>({
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    lname: '',
    fname: '',
    mname: '',
    suffix: '',
    birth_date: '',
    sex: '',
    civil_status: '',
    mobile_number: '',
    provCode: '',
    citymunCode: '',
    brgyCode: '',
    street_address: '',
    zip_code: '',
    school_name: '',
    program: '',
    year: '',
    guardian_name: '',
    guardian_contact_number: '',
    monthly_family_income: '',
  });
  const updateProvince = (provinceId: string) => {
    setData((currentData) => ({
      ...currentData,
      provCode: provinceId,
      citymunCode: '',
      brgyCode: '',
    }));
  };

  const updateCity = (cityId: string) => {
    setData((currentData) => ({
      ...currentData,
      citymunCode: cityId,
      brgyCode: '',
    }));
  };

  const submit: FormEventHandler = (event) => {
    event.preventDefault();

    post(route('student-register.store'), {
      onFinish: () => reset('password', 'password_confirmation'),
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
                  <span className="flex h-11 w-11 items-center justify-center rounded-md bg-white text-sm font-bold text-emerald-800">
                    MY
                  </span>
                  <span>
                    <span className="block text-sm font-bold tracking-wide">MYDO-YISMS</span>
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
                  <div className="rounded-md bg-white/10 p-4">
                    <UserRound className="h-5 w-5 text-emerald-100" />
                    <p className="mt-3 text-sm font-semibold">Personal details</p>
                  </div>
                  <div className="rounded-md bg-white/10 p-4">
                    <BookOpen className="h-5 w-5 text-emerald-100" />
                    <p className="mt-3 text-sm font-semibold">School information</p>
                  </div>
                  <div className="rounded-md bg-white/10 p-4">
                    <LockKeyhole className="h-5 w-5 text-emerald-100" />
                    <p className="mt-3 text-sm font-semibold">Secure login account</p>
                  </div>
                </div>
              </aside>

              <div className="px-6 py-8 sm:px-8 lg:px-10">
                <div className="mb-8">
                  <p className="text-sm font-semibold uppercase text-emerald-700">Applicant Form</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">Student scholarship registration</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Complete the form below to submit your student scholarship registration for MYDO review.
                  </p>
                </div>

                <form className="space-y-8" onSubmit={submit}>
                  <FormSection icon={LockKeyhole} title="Account Information">
                    <TextField id="username" label="Username" placeholder="e.g. juan.delacruz" value={data.username} onChange={(value) => setData('username', value)} error={errors.username} />
                    <TextField id="email" label="Email address" type="email" placeholder="student@example.com" icon={Mail} value={data.email} onChange={(value) => setData('email', value)} error={errors.email} />
                    <TextField id="password" label="Password" type="password" placeholder="Create a password" value={data.password} onChange={(value) => setData('password', value)} error={errors.password} />
                    <TextField id="password_confirmation" label="Confirm password" type="password" placeholder="Confirm your password" value={data.password_confirmation} onChange={(value) => setData('password_confirmation', value)} error={errors.password_confirmation} />
                  </FormSection>

                  <FormSection icon={UserRound} title="Personal Information">
                    <TextField id="lname" label="Last name" placeholder="Dela Cruz" value={data.lname} onChange={(value) => setData('lname', value)} error={errors.lname} />
                    <TextField id="fname" label="First name" placeholder="Juan" value={data.fname} onChange={(value) => setData('fname', value)} error={errors.fname} />
                    <TextField id="mname" label="Middle name" placeholder="Santos" value={data.mname} onChange={(value) => setData('mname', value)} error={errors.mname} />
                    <TextField id="suffix" label="Suffix" placeholder="Jr., III, etc." value={data.suffix} onChange={(value) => setData('suffix', value)} error={errors.suffix} />
                    <TextField id="birth_date" label="Birth date" type="date" value={data.birth_date} onChange={(value) => setData('birth_date', value)} error={errors.birth_date} />
                    <SelectField id="sex" label="Sex" options={sexOptions} value={data.sex} onChange={(value) => setData('sex', value)} error={errors.sex} />
                    <SelectField id="civil_status" label="Civil status" options={civilStatusOptions} value={data.civil_status} onChange={(value) => setData('civil_status', value)} error={errors.civil_status} />
                    <TextField id="mobile_number" label="Mobile number" placeholder="09XXXXXXXXX" icon={Phone} value={data.mobile_number} onChange={(value) => setData('mobile_number', value)} error={errors.mobile_number} />
                  </FormSection>

                  <FormSection icon={Home} title="Address Information">
                    <SelectProvince value={data.provCode} onChange={updateProvince} error={errors.provCode} />
                    <SelectCity provinceCode={data.provCode} value={data.citymunCode} onChange={updateCity} error={errors.citymunCode} />
                    <SelectBarangay
                      provinceCode={data.provCode}
                      cityCode={data.citymunCode}
                      value={data.brgyCode}
                      onChange={(value) => setData('brgyCode', value)}
                      error={errors.brgyCode}
                    />
                    <TextField id="street_address" label="Street address" placeholder="House no., street, purok, subdivision" value={data.street_address} onChange={(value) => setData('street_address', value)} error={errors.street_address} />
                    <TextField id="zip_code" label="ZIP code" placeholder="0000" value={data.zip_code} onChange={(value) => setData('zip_code', value)} error={errors.zip_code} />
                  </FormSection>

                  <FormSection icon={BookOpen} title="Educational Information">
                    <TextField id="school_name" label="School name" placeholder="Name of school" value={data.school_name} onChange={(value) => setData('school_name', value)} error={errors.school_name} />
                    <TextField id="program" label="Program" placeholder="Bachelor of Science in Information Technology" value={data.program} onChange={(value) => setData('program', value)} error={errors.program} />
                    <SelectField id="year" label="Year" options={yearOptions} placeholder="Select year level" value={data.year} onChange={(value) => setData('year', value)} error={errors.year} />
                  </FormSection>

                  <FormSection icon={Users} title="Family / Guardian Information">
                    <TextField id="guardian_name" label="Guardian name" placeholder="Full name of parent or guardian" value={data.guardian_name} onChange={(value) => setData('guardian_name', value)} error={errors.guardian_name} />
                    <TextField id="guardian_contact_number" label="Guardian contact number" placeholder="09XXXXXXXXX" icon={Phone} value={data.guardian_contact_number} onChange={(value) => setData('guardian_contact_number', value)} error={errors.guardian_contact_number} />
                    <TextField id="monthly_family_income" label="Monthly family income" type="number" placeholder="e.g. 10000" value={data.monthly_family_income} onChange={(value) => setData('monthly_family_income', value)} error={errors.monthly_family_income} />
                  </FormSection>

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={route('student-login')} className="inline-flex justify-center rounded-md px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                      I already have an account
                    </Link>
                    <Button type="submit" className="bg-emerald-700 px-6 hover:bg-emerald-800" disabled={processing}>
                      {processing ? 'Submitting...' : 'Submit Registration'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function FormSection({
  children,
  icon: Icon,
  title,
}: {
  children: ReactNode;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-100 text-emerald-700">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}
