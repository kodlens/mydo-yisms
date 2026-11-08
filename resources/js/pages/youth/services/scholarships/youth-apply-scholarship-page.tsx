import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData, Youth } from '@/types';
import { ScholarshipType } from '@/types/scholarship';
import { ScholarshipApplication } from '@/types/scholarshipApplication';
import { Head, Link, router } from '@inertiajs/react';
import { Alert, App, Button, Form, FormInstance, Input, InputNumber, Tag } from 'antd';
import axios, { isAxiosError } from 'axios';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  GraduationCap,
  Hash,
  MapPin,
  Phone,
  Sparkles,
  UserCheck,
  UserRound,
  Wallet,
  XCircle,
} from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';
import DocumentUploads from './partials/document-uploads';

type Props = {
  xToken: string;
  scholarshipType: ScholarshipType;
  scholarshipApplication: ScholarshipApplication | null;
  academicYear?: { id: number; name: string; code: string } | null;
  youth?: Youth;
};

const pesoFormatter = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' });

const formatAmount = (amount: number | string | null | undefined) => {
  if (amount === null || amount === undefined || amount === '') return 'Amount not specified';
  const numeric = Number(amount);
  return Number.isFinite(numeric) ? pesoFormatter.format(numeric) : 'Amount not specified';
};

const formatDate = (val?: string | null) => {
  if (!val) return '';
  const d = new Date(val);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-PH', { dateStyle: 'medium' });
};

export default function YouthApplyScholarshipPage({
  xToken,
  scholarshipType,
  scholarshipApplication,
  academicYear,
  youth,
}: Props) {
  const [errors, setErrors] = useState<Record<string, unknown[]>>({});
  const [form] = Form.useForm();
  const { modal } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);

  const fullName = [youth?.fname, youth?.mname, youth?.lname, youth?.suffix].filter(Boolean).join(' ') || 'Applicant';
  const location = [youth?.barangay?.brgyDesc, youth?.city?.citymunDesc].filter(Boolean).join(', ');

  const submit = (values: FormInstance) => {
    setLoading(true);
    setErrors({});

    axios
      .post(`/youth/services/apply-scholarship/${scholarshipType.id}`, values)
      .then((res) => {
        if (res.data.success) {
          modal.success({
            title: 'Scholarship Application Submitted!',
            content: (
              <div className="space-y-2 pt-2">
                <p className="text-sm text-slate-600">
                  Your scholarship application has been received and is now pending review by MYDO staff.
                </p>
                {res.data.reference && (
                  <div className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-900 border border-emerald-200">
                    <span className="font-semibold">Application Reference No:</span> {res.data.reference}
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  Please keep this reference number for your records. Check your notifications for review updates.
                </p>
              </div>
            ),
            okText: 'Back to Scholarships',
            onOk: () => {
              router.visit(route('youth.services.youth-scholarships.index'));
            },
          });
        }
      })
      .catch((error) => {
        if (isAxiosError(error)) {
          if (error.response?.status === 422) {
            const validationErrors = error.response.data.errors ?? {};
            const generalMessage = error.response.data.message;
            setErrors(validationErrors);

            const errorMessages = [
              ...(generalMessage && Object.keys(validationErrors).length === 0 ? [generalMessage] : []),
              ...new Set(Object.values(validationErrors).flat() as string[]),
            ];

            modal.error({
              title: 'Application Submission Issue',
              content: (
                <ul className="mb-0 list-disc pl-5 text-sm text-slate-700">
                  {errorMessages.map((msg, index) => (
                    <li key={`${msg}-${index}`}>{msg}</li>
                  ))}
                </ul>
              ),
            });
          } else {
            modal.error({
              title: 'Unable to submit application',
              content: error.response?.data?.message || 'A network error occurred. Please try again.',
            });
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      <Head title={`Apply for ${scholarshipType.scholarship}`} />

      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-12">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            href={route('youth.services.youth-scholarships.index')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Available Scholarships
          </Link>

          {academicYear && (
            <Tag color="cyan" className="!rounded-full !px-3 !py-1 text-xs font-semibold">
              <Calendar className="mr-1 inline-block h-3.5 w-3.5" />
              {academicYear.name}
            </Tag>
          )}
        </div>

        {/* Hero Program Banner */}
        <header className="relative overflow-hidden rounded-2xl border border-emerald-900/10 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 backdrop-blur-sm">
                <GraduationCap className="h-4 w-4" />
                Municipal Scholarship Program
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {scholarshipType.scholarship}
              </h1>
              {scholarshipType.target_beneficiary && (
                <p className="max-w-2xl text-sm leading-relaxed text-emerald-100/90">
                  {scholarshipType.target_beneficiary}
                </p>
              )}
            </div>

            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/15 sm:text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-200">Financial Grant</p>
              <p className="mt-1 text-2xl font-bold text-white">{formatAmount(scholarshipType.amount)}</p>
              {scholarshipType.benefit && (
                <p className="mt-1 text-xs text-emerald-100">{scholarshipType.benefit}</p>
              )}
            </div>
          </div>
        </header>

        {/* Status Views */}
        {!academicYear ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-amber-900">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 shrink-0 text-amber-600" />
              <div>
                <h3 className="text-base font-semibold text-amber-950">Applications Temporarily Closed</h3>
                <p className="mt-1 text-sm text-amber-800">
                  There is currently no active academic year configured for scholarship intake. Please check back when the municipal youth office opens the next enrollment period.
                </p>
              </div>
            </div>
          </div>
        ) : !scholarshipApplication ? (
          /* Application Form View */
          <div className="space-y-6">
            {/* Applicant Profile Snapshot */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <UserCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Applicant Information</h2>
                    <p className="text-xs text-slate-500">Your profile details on record with MYDO</p>
                  </div>
                </div>

                <Link
                  href={route('youth.youth-my-profile.index')}
                  className="text-xs font-semibold text-emerald-700 hover:underline"
                >
                  Edit Profile
                </Link>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <p className="text-xs text-slate-400">Full Name</p>
                  <p className="text-sm font-semibold text-slate-800">{fullName}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">School / Institution</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {youth?.school_name || <span className="text-amber-600 font-normal italic">Not specified</span>}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Course / Program & Year</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {youth?.program ? `${youth.program} (Year ${youth.year ?? 1})` : <span className="text-amber-600 font-normal italic">Not specified</span>}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Student ID</p>
                  <p className="text-sm font-semibold text-slate-800">
                    {youth?.student_id || <span className="text-slate-400 font-normal italic">N/A</span>}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Contact Number</p>
                  <p className="text-sm font-semibold text-slate-800">{youth?.mobile_number || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-400">Residence</p>
                  <p className="text-sm font-semibold text-slate-800">{location || 'N/A'}</p>
                </div>
              </div>

              {(!youth?.school_name || !youth?.program) && (
                <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  <span className="font-semibold">Notice:</span> Your educational background (School & Course) is not yet set in your profile.
                  Evaluators will use your uploaded Certificate of Enrollment to verify your credentials.
                </div>
              )}
            </section>

            {/* Document Uploads Form */}
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                <FileCheck2 className="h-5 w-5 text-emerald-700" />
                <h2 className="text-base font-semibold text-slate-900">Required Documentary Attachments</h2>
              </div>

              <p className="mb-6 text-xs text-slate-500">
                Please upload clear scanned copies or clear photos of each document in PDF, PNG, JPG, or JPEG format (max 5MB each).
              </p>

              <Form
                form={form}
                layout="vertical"
                onFinish={submit}
                initialValues={{
                  scholarship_type_id: scholarshipType.id,
                  previous_semester_gwa: youth?.previous_semester_gwa ? Number(youth.previous_semester_gwa) : undefined,
                }}
                preserve
              >
                {/* Academic Evaluation (GWA) */}
                <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-emerald-700" />
                    <h3 className="text-sm font-bold text-slate-900">Academic Evaluation (General Weighted Average)</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    Enter your General Weighted Average (GWA) from your previous semester. This will be cross-referenced by MYDO evaluators with your uploaded Certificate of Grades (COG).
                  </p>

                  <div className="max-w-xs">
                    <Form.Item
                      name="previous_semester_gwa"
                      label={<span className="font-semibold text-slate-800">Previous Semester GWA</span>}
                      validateStatus={errors.previous_semester_gwa ? 'error' : ''}
                      help={
                        errors.previous_semester_gwa
                          ? (errors.previous_semester_gwa[0] as string)
                          : 'Format: 1.00 to 5.00 (or 75.00 to 100.00)'
                      }
                      rules={[
                        { required: true, message: 'Please enter your Previous Semester GWA.' },
                      ]}
                    >
                      <InputNumber
                        size="large"
                        className="w-full"
                        min={1.0}
                        max={100.0}
                        step={0.01}
                        placeholder="e.g. 1.75 or 88.50"
                      />
                    </Form.Item>
                  </div>
                </div>

                <DocumentUploads errors={errors} xToken={xToken} />

                <Form.Item name="scholarship_type_id" hidden>
                  <Input />
                </Form.Item>

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Link
                    href={route('youth.services.youth-scholarships.index')}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </Link>

                  <Button
                    htmlType="submit"
                    type="primary"
                    size="large"
                    loading={loading}
                    className="!h-11 !rounded-xl !bg-emerald-700 !px-8 !font-semibold hover:!bg-emerald-800"
                  >
                    <span>Submit Scholarship Application</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Form>
            </section>
          </div>
        ) : scholarshipApplication.status === 'approved' ? (
          /* Approved State Banner */
          <section className="relative overflow-hidden rounded-3xl border border-emerald-600 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 p-6 text-white shadow-xl sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 ring-4 ring-emerald-400/20">
                <BadgeCheck className="h-12 w-12 text-emerald-300" strokeWidth={1.75} />
              </div>

              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-300 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-950">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  Application Approved
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Congratulations, your scholarship is approved!
                </h2>
                <p className="max-w-xl text-sm leading-relaxed text-emerald-100">
                  Your application for {scholarshipType.scholarship} has been officially approved by the Municipal Youth Development Office.
                </p>
                {scholarshipApplication.reference && (
                  <p className="text-xs font-mono text-emerald-200 pt-1">
                    Reference Code: <span className="font-bold underline">{scholarshipApplication.reference}</span>
                  </p>
                )}
              </div>
            </div>
          </section>
        ) : scholarshipApplication.status === 'rejected' ? (
          /* Rejected State Card */
          <section className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-200">
                <XCircle className="h-8 w-8" />
              </div>

              <Tag color="error" className="!rounded-full !px-3 !py-1 text-xs font-semibold">
                Application Not Approved
              </Tag>

              <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
                Application Review Decision
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-600">
                Your application for <span className="font-semibold">{scholarshipType.scholarship}</span> was evaluated but could not be approved at this time.
              </p>

              {scholarshipApplication.rejection_reason && (
                <div className="mt-5 w-full max-w-lg rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-left">
                  <p className="text-xs font-bold uppercase tracking-wider text-rose-800">Evaluator Remarks / Reason:</p>
                  <p className="mt-1 text-sm text-rose-950">{scholarshipApplication.rejection_reason}</p>
                </div>
              )}

              {scholarshipApplication.reference && (
                <p className="mt-4 text-xs text-slate-400">
                  Application Reference: <span className="font-mono font-medium text-slate-600">{scholarshipApplication.reference}</span>
                </p>
              )}

              <div className="mt-6 flex gap-3">
                <Link
                  href={route('youth.services.youth-scholarships.index')}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Explore Other Scholarships
                </Link>
              </div>
            </div>
          </section>
        ) : (
          /* Pending Review State */
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 ring-1 ring-amber-200">
                <Clock3 className="h-8 w-8" />
              </div>

              <Tag color="warning" className="!rounded-full !px-3 !py-1 text-xs font-semibold">
                Under Staff Review
              </Tag>

              <h2 className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">
                Your application is currently being evaluated
              </h2>

              <p className="mt-2 max-w-md text-sm text-slate-500">
                Your application for <span className="font-semibold text-slate-800">{scholarshipType.scholarship}</span> has been received. Our staff is verifying your submitted documents.
              </p>

              <div className="mt-6 w-full max-w-md rounded-xl border border-slate-100 bg-slate-50 p-4 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Application Reference</span>
                  <span className="font-mono font-bold text-slate-800">{scholarshipApplication.reference || 'Generating...'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Submitted On</span>
                  <span className="font-medium text-slate-800">{formatDate(scholarshipApplication.submitted_at) || 'Recently'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-amber-700 capitalize">{scholarshipApplication.status}</span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href={route('youth.services.youth-scholarships.index')}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Back to Scholarships List
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

YouthApplyScholarshipPage.layout = (page: ReactNode) => (
  <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</YouthAuthLayout>
);
