import BrandLogo from '@/components/brand-logo';
import MydoLogo from '@/components/mydo-logo';
import { Head } from '@inertiajs/react';
import { Button, Tag } from 'antd';
import { ArrowLeft, CheckCircle2, FileCheck, Printer } from 'lucide-react';

type Props = {
  report: {
    beneficiary_id: number;
    status: string;
    selected_at: string;
    selected_by: string;
    reviewed_at: string;
    reviewed_by: string;
    rejection_reason?: string | null;
    remarks?: string | null;
    youth: {
      id: number;
      reference_code: string;
      student_id?: string;
      full_name: string;
      email: string;
      mobile_number?: string;
      sex?: string;
      birth_date?: string;
      civil_status?: string;
      monthly_family_income?: number;
      address?: string;
      barangay: string;
      city: string;
      province: string;
      school_name: string;
      program: string;
      educational_status?: string;
    };
    program: {
      id: number;
      code: string;
      title: string;
      funding_year: number;
      amount_per_beneficiary: number;
    };
    release?: {
      id: number;
      status: string;
      amount: number;
      scheduled_release_date?: string;
      actual_release_date?: string;
      acknowledgment_reference?: string;
      released_by?: string;
      supporting_document_url?: string;
      remarks?: string;
    } | null;
    audit_trail: Array<{
      action_type: string;
      from_status: string;
      to_status: string;
      reason?: string;
      actor_name: string;
      created_at: string;
    }>;
  };
};

export default function StaffCashIncentiveBeneficiaryReportPage({ report }: Props) {
  const { youth, program, release } = report;

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-8 print:p-0 print:bg-white text-slate-800">
      <Head title={`Beneficiary Report - ${youth.full_name} (${program.code})`} />

      {/* Screen action bar (hidden during print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={() => window.history.back()}
          className="font-medium"
        >
          Back
        </Button>

        <Button
          type="primary"
          icon={<Printer size={16} />}
          onClick={() => window.print()}
          className="!bg-emerald-600 hover:!bg-emerald-700 font-semibold"
        >
          Print Official Ledger
        </Button>
      </div>

      {/* Main Printable Document Card */}
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm p-8 sm:p-12 print:border-none print:shadow-none print:p-0">
        {/* Header Branding */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-white p-1 ring-1 ring-slate-200">
                <MydoLogo className="h-16 w-16 rounded-full" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  Republic of the Philippines
                </p>
                <h2 className="text-base font-black text-slate-900 uppercase">
                  Municipal Youth Development Office
                </h2>
                <p className="text-xs text-slate-600 font-medium">
                  eKabataan Youth Information & Incentives Management System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-slate-50 p-2 border border-slate-200">
                <BrandLogo className="h-12 w-12" />
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-xl font-black uppercase tracking-wide text-slate-950">
              Official Beneficiary Cash Incentive Dossier
            </h1>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              DOCUMENT ID: {program.code}-{youth.reference_code || 'REF-N/A'}
            </p>
          </div>
        </div>

        {/* Program Grant Specification */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase block">Incentive Program</span>
              <span className="font-bold text-slate-900 text-sm">{program.title}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase block">Program Code</span>
              <span className="font-mono font-bold text-slate-900">{program.code}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase block">Funding Year</span>
              <span className="font-bold text-slate-900">{program.funding_year}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase block">Fixed Grant Amount</span>
              <span className="font-mono font-black text-emerald-800 text-sm">
                ₱{program.amount_per_beneficiary.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Section 1: Beneficiary Profile */}
        <div className="mb-6 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Section 1. Demographic & Educational Profile
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Beneficiary Name</span>
              <span className="font-bold text-slate-900 text-sm">{youth.full_name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Youth Reference Code</span>
              <span className="font-mono font-bold text-emerald-900">{youth.reference_code || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Student / Valid ID</span>
              <span className="font-mono font-bold text-slate-800">{youth.student_id || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Barangay Residence</span>
              <span className="font-bold text-slate-800">{youth.barangay}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Educational Classification</span>
              <span className="font-bold text-slate-800">{youth.educational_status || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Sex / Civil Status</span>
              <span className="font-bold text-slate-800">
                {youth.sex || 'N/A'} • {youth.civil_status || 'Single'}
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-400 block font-medium">School / Academic Institution</span>
              <span className="font-bold text-slate-800">{youth.school_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Course / Program</span>
              <span className="font-bold text-slate-800">{youth.program || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Section 2: Eligibility Verification */}
        <div className="mb-6 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Section 2. Eligibility Review & Verification
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Review Status</span>
              <Tag
                color={report.status === 'approved' ? 'success' : report.status === 'rejected' ? 'error' : 'warning'}
                className="font-bold uppercase"
              >
                {report.status}
              </Tag>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Verifying Officer</span>
              <span className="font-bold text-slate-800">{report.reviewed_by || 'Pending'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Verification Timestamp</span>
              <span className="font-bold text-slate-800">{report.reviewed_at || 'Pending'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Selected On</span>
              <span className="font-bold text-slate-800">{report.selected_at}</span>
            </div>
            {report.rejection_reason && (
              <div className="col-span-2 sm:col-span-4 rounded-lg bg-rose-50 border border-rose-200 p-2 text-rose-800">
                <strong>Rejection Reason:</strong> {report.rejection_reason}
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Financial Disbursement Transaction */}
        <div className="mb-8 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
            Section 3. Financial Disbursement & Release Record
          </h3>
          {release ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Disbursement Status</span>
                  <Tag
                    color={release.status === 'released' ? 'cyan' : 'gold'}
                    className="font-bold uppercase"
                  >
                    {release.status}
                  </Tag>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Amount Released</span>
                  <span className="font-mono font-black text-emerald-900 text-sm">
                    ₱{release.amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Acknowledgment Ref / Voucher #</span>
                  <span className="font-mono font-bold text-slate-900">
                    {release.acknowledgment_reference || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Actual Release Date</span>
                  <span className="font-bold text-slate-800">
                    {release.actual_release_date || 'Pending Release'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Disbursing Staff Officer</span>
                  <span className="font-bold text-slate-800">{release.released_by || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Proof Attachment</span>
                  <span className="font-semibold text-slate-800">
                    {release.supporting_document_url ? 'Attached on record' : 'None'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">No disbursement record processed yet.</p>
          )}
        </div>

        {/* Section 4: Signatures & Certification */}
        <div className="pt-6 border-t border-slate-300">
          <p className="text-[11px] text-slate-500 italic mb-10 text-center">
            I hereby certify that the above beneficiary information and financial records were reviewed, verified, and processed in accordance with municipal ordinances, guidelines, and Republic Act No. 10742 (Sangguniang Kabataan Reform Act).
          </p>

          <div className="grid grid-cols-3 gap-8 text-center text-xs">
            <div>
              <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
                {report.reviewed_by || 'Staff Officer'}
              </div>
              <span className="text-slate-500 text-[11px]">Verifying Officer / Reviewer</span>
            </div>

            <div>
              <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
                {release?.released_by || 'Disbursing Officer'}
              </div>
              <span className="text-slate-500 text-[11px]">Disbursing Officer</span>
            </div>

            <div>
              <div className="border-b border-slate-900 pb-1 mb-1 font-bold text-slate-900">
                {youth.full_name}
              </div>
              <span className="text-slate-500 text-[11px]">Beneficiary Recipient Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
