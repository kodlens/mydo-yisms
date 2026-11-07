import { Tag } from 'antd';
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock,
  HelpCircle,
  XCircle,
} from 'lucide-react';

export function BeneficiaryStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'approved':
      return (
        <Tag color="success" className="inline-flex items-center gap-1 font-semibold uppercase text-[11px] px-2 py-0.5">
          <CheckCircle2 size={12} /> Approved
        </Tag>
      );
    case 'rejected':
      return (
        <Tag color="error" className="inline-flex items-center gap-1 font-semibold uppercase text-[11px] px-2 py-0.5">
          <XCircle size={12} /> Rejected
        </Tag>
      );
    default:
      return (
        <Tag color="warning" className="inline-flex items-center gap-1 font-semibold uppercase text-[11px] px-2 py-0.5">
          <Clock size={12} /> Pending Review
        </Tag>
      );
  }
}

export function ReleaseStatusBadge({ status }: { status?: string | null }) {
  switch (status) {
    case 'released':
      return (
        <Tag color="cyan" className="inline-flex items-center gap-1 font-semibold uppercase text-[11px] px-2 py-0.5 bg-emerald-50 text-emerald-700 border-emerald-300">
          <CheckCircle2 size={12} /> Cash Released
        </Tag>
      );
    case 'scheduled':
      return (
        <Tag color="blue" className="inline-flex items-center gap-1 font-semibold uppercase text-[11px] px-2 py-0.5">
          <CalendarClock size={12} /> Scheduled
        </Tag>
      );
    case 'unclaimed':
      return (
        <Tag color="orange" className="inline-flex items-center gap-1 font-semibold uppercase text-[11px] px-2 py-0.5">
          <HelpCircle size={12} /> Unclaimed
        </Tag>
      );
    case 'cancelled':
      return (
        <Tag color="default" className="inline-flex items-center gap-1 font-semibold uppercase text-[11px] px-2 py-0.5 text-slate-500">
          <AlertCircle size={12} /> Cancelled
        </Tag>
      );
    default:
      return (
        <Tag color="gold" className="inline-flex items-center gap-1 font-semibold uppercase text-[11px] px-2 py-0.5">
          <Clock size={12} /> Pending Release
        </Tag>
      );
  }
}
