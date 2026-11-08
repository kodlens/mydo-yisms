import { CashIncentiveBeneficiary, CashIncentiveProgram } from '@/types/cash-incentive';
import { Button, Descriptions, Divider, Modal, Tag, Timeline } from 'antd';
import {
  Banknote,
  Calendar,
  ExternalLink,
  FileText,
  MapPin,
  Printer,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BeneficiaryStatusBadge, ReleaseStatusBadge } from './admin-release-status-badge';

type Props = {
  open: boolean;
  onClose: () => void;
  beneficiary: CashIncentiveBeneficiary | null;
  program: CashIncentiveProgram;
};

export default function AdminIndividualBeneficiaryLedgerModal({
  open,
  onClose,
  beneficiary,
  program,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    if (open && beneficiary) {
      setLoading(true);
      fetch(
        route('admin.cash-incentives.reports.individual', [program.id, beneficiary.id]),
        { headers: { Accept: 'application/json' } }
      )
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((json) => {
          if (json?.report) setReportData(json.report);
        })
        .catch((e) => console.error(e))
        .finally(() => setLoading(false));
    } else {
      setReportData(null);
    }
  }, [open, beneficiary]);

  if (!beneficiary) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Beneficiary Dossier & Audit Ledger</h3>
              <p className="text-[11px] text-slate-500 font-mono">{beneficiary.reference_code}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BeneficiaryStatusBadge status={beneficiary.status} />
            <ReleaseStatusBadge status={beneficiary.release?.status} />
          </div>
        </div>
      }
      footer={[
        <Button key="close" onClick={onClose}>
          Close
        </Button>,
        <Button
          key="print"
          type="primary"
          icon={<Printer size={14} />}
          onClick={() => window.open(route('admin.cash-incentives.reports.individual', [program.id, beneficiary.id]), '_blank')}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        >
          Print Official Dossier
        </Button>,
      ]}
      width={740}
    >
      <div className="space-y-4 py-2">
        {/* Profile Card */}
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="text-base font-bold text-slate-900">{beneficiary.full_name}</h4>
              <p className="text-xs text-slate-500">
                {beneficiary.student_id ? `Student ID: ${beneficiary.student_id} • ` : ''}
                {beneficiary.barangay}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">Program Grant</span>
              <span className="text-lg font-black text-emerald-900 font-mono">
                ₱{Number(program.amount_per_beneficiary).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <Descriptions size="small" column={{ xs: 1, sm: 2 }} className="mt-3 text-xs">
            <Descriptions.Item label="Education Status">
              <span className="font-semibold text-slate-700">{beneficiary.educational_status || 'N/A'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="School / University">
              <span>{beneficiary.school_name}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Course / Program">
              <span>{beneficiary.program}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Monthly Family Income">
              <span>₱{Number(beneficiary.monthly_family_income || 0).toLocaleString()}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <span>{beneficiary.email || 'N/A'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Mobile Number">
              <span>{beneficiary.mobile_number || 'N/A'}</span>
            </Descriptions.Item>
          </Descriptions>
        </div>

        {/* Financial Release Record */}
        {beneficiary.release ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Disbursement Record
              </span>
              <ReleaseStatusBadge status={beneficiary.release.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
              <div>
                <span className="text-slate-500 block">Actual Release Date:</span>
                <span className="font-semibold text-slate-800">
                  {beneficiary.release.actual_release_date || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Payroll / Receipt Ref:</span>
                <span className="font-mono font-bold text-slate-800">
                  {beneficiary.release.acknowledgment_reference || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Released By:</span>
                <span className="font-semibold text-slate-800">
                  {beneficiary.release.released_by || 'N/A'}
                </span>
              </div>
            </div>

            {beneficiary.release.remarks && (
              <p className="text-xs text-slate-600 border-t border-emerald-200/50 pt-2 mt-2">
                <strong>Disbursement Notes:</strong> {beneficiary.release.remarks}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-500">
            No disbursement released yet for this approved student.
          </div>
        )}

        {/* Audit Trail Timeline */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
            Official Audit Trail & Action History
          </span>
          <div className="rounded-xl border border-slate-200/80 bg-white p-4">
            {reportData?.audit_trail && reportData.audit_trail.length > 0 ? (
              <Timeline
                items={reportData.audit_trail.map((item: any) => ({
                  color:
                    item.to_status === 'approved'
                      ? 'green'
                      : item.to_status === 'released'
                      ? 'blue'
                      : item.to_status === 'rejected'
                      ? 'red'
                      : 'gray',
                  children: (
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-800 uppercase tracking-wide">
                          {item.action_type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-slate-400 font-mono">{item.created_at}</span>
                      </div>
                      <p className="text-slate-600">
                        Status transitioned to <strong className="uppercase">{item.to_status}</strong> by{' '}
                        <strong>{item.actor_name}</strong>
                      </p>
                      {item.reason && (
                        <p className="text-slate-500 italic bg-slate-50 p-1.5 rounded-sm border border-slate-100">
                          "{item.reason}"
                        </p>
                      )}
                    </div>
                  ),
                }))}
              />
            ) : (
              <p className="text-xs text-slate-400 text-center py-2">Loading audit timeline...</p>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
