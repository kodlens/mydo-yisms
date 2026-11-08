import { CashIncentiveProgram } from '@/types/cash-incentive';
import { useForm } from '@inertiajs/react';
import {
  Alert,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
} from 'antd';
import dayjs from 'dayjs';
import { Coins, Sparkles } from 'lucide-react';
import { useEffect } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  program?: CashIncentiveProgram | null;
};

export default function AdminProgramCreateEditModal({ open, onClose, program }: Props) {
  const isEditing = !!program;

  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: program?.title ?? '',
    code: program?.code ?? '',
    description: program?.description ?? '',
    funding_year: program?.funding_year ?? new Date().getFullYear(),
    amount_per_beneficiary: program?.amount_per_beneficiary ?? 5000,
    allocated_budget: program?.allocated_budget ?? 500000,
    max_beneficiaries: program?.max_beneficiaries ?? 100,
    selection_start_date: program?.selection_start_date ?? null,
    selection_end_date: program?.selection_end_date ?? null,
    release_start_date: program?.release_start_date ?? null,
    release_end_date: program?.release_end_date ?? null,
    status: program?.status ?? 'active',
  });

  useEffect(() => {
    if (program) {
      setData({
        title: program.title,
        code: program.code,
        description: program.description ?? '',
        funding_year: program.funding_year,
        amount_per_beneficiary: program.amount_per_beneficiary,
        allocated_budget: program.allocated_budget,
        max_beneficiaries: program.max_beneficiaries,
        selection_start_date: program.selection_start_date ?? null,
        selection_end_date: program.selection_end_date ?? null,
        release_start_date: program.release_start_date ?? null,
        release_end_date: program.release_end_date ?? null,
        status: program.status,
      });
    } else {
      reset();
    }
  }, [program, open]);

  const minRequiredBudget = Number(data.max_beneficiaries || 0) * Number(data.amount_per_beneficiary || 0);

  const handleSubmit = () => {
    if (isEditing) {
      put(route('admin.cash-incentives.update', program.id), {
        onSuccess: () => onClose(),
      });
    } else {
      post(route('admin.cash-incentives.store'), {
        onSuccess: () => {
          reset();
          onClose();
        },
      });
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 text-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
            <Coins size={18} />
          </div>
          <span className="font-bold text-base">
            {isEditing ? `Edit Program: ${program.title}` : 'Create Cash Incentive Program'}
          </span>
        </div>
      }
      footer={[
        <Button key="cancel" onClick={onClose} disabled={processing}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          loading={processing}
          className="!bg-emerald-600 hover:!bg-emerald-700"
        >
          {isEditing ? 'Save Changes' : 'Create Program'}
        </Button>,
      ]}
      width={720}
      destroyOnClose
    >
      <div className="py-2 space-y-4">
        {Object.keys(errors).length > 0 && (
          <Alert
            type="error"
            showIcon
            message="Please resolve validation errors below"
            description={
              <ul className="list-disc pl-4 text-xs mt-1">
                {Object.values(errors).map((err, i) => (
                  <li key={i}>{String(err)}</li>
                ))}
              </ul>
            }
          />
        )}

        <Form layout="vertical" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Form.Item label="Program Title" required validateStatus={errors.title ? 'error' : ''} help={errors.title}>
                <Input
                  placeholder="e.g. 2026 Academic Excellence Incentive Grant"
                  value={data.title}
                  onChange={(e) => setData('title', e.target.value)}
                />
              </Form.Item>
            </div>

            <div>
              <Form.Item label="Program Code" help={errors.code || 'Leave blank for auto-generation'}>
                <Input
                  placeholder="e.g. CIP-2026-001"
                  value={data.code}
                  onChange={(e) => setData('code', e.target.value.toUpperCase())}
                />
              </Form.Item>
            </div>
          </div>

          <Form.Item label="Description & Guidelines" help={errors.description}>
            <Input.TextArea
              rows={2}
              placeholder="Program objectives, eligibility criteria summary, and disbursement schedule details..."
              value={data.description}
              onChange={(e) => setData('description', e.target.value)}
            />
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Form.Item label="Funding Year" required help={errors.funding_year}>
                <InputNumber
                  className="w-full"
                  min={2020}
                  max={2050}
                  value={data.funding_year}
                  onChange={(val) => setData('funding_year', val || new Date().getFullYear())}
                />
              </Form.Item>
            </div>

            <div>
              <Form.Item label="Per Student Amount (₱)" required help={errors.amount_per_beneficiary}>
                <InputNumber
                  className="w-full"
                  min={100}
                  step={500}
                  formatter={(val) => `₱ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(val) => Number(val?.replace(/\₱\s?|(,*)/g, '') || 0)}
                  value={data.amount_per_beneficiary}
                  onChange={(val) => setData('amount_per_beneficiary', Number(val || 0))}
                />
              </Form.Item>
            </div>

            <div>
              <Form.Item label="Target Quota" required help={errors.max_beneficiaries}>
                <InputNumber
                  className="w-full"
                  min={1}
                  max={10000}
                  value={data.max_beneficiaries}
                  onChange={(val) => setData('max_beneficiaries', Number(val || 0))}
                />
              </Form.Item>
            </div>

            <div>
              <Form.Item label="Status" required help={errors.status}>
                <Select
                  value={data.status}
                  onChange={(val) => setData('status', val)}
                  options={[
                    { value: 'active', label: 'Active (Open)' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

          <div>
            <Form.Item
              label={
                <div className="flex items-center justify-between w-full">
                  <span>Total Allocated Budget (₱)</span>
                  <span className="text-xs font-normal text-slate-500">
                    Min required: <strong>₱{minRequiredBudget.toLocaleString()}</strong>
                  </span>
                </div>
              }
              required
              help={errors.allocated_budget}
            >
              <InputNumber
                className="w-full"
                min={minRequiredBudget}
                step={5000}
                formatter={(val) => `₱ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(val) => Number(val?.replace(/\₱\s?|(,*)/g, '') || 0)}
                value={data.allocated_budget}
                onChange={(val) => setData('allocated_budget', Number(val || 0))}
              />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Selection Window</span>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  placeholder="Selection Start"
                  className="w-full"
                  value={data.selection_start_date ? dayjs(data.selection_start_date) : null}
                  onChange={(d) => setData('selection_start_date', d ? d.format('Y-m-d') : null)}
                />
                <DatePicker
                  placeholder="Selection End"
                  className="w-full"
                  value={data.selection_end_date ? dayjs(data.selection_end_date) : null}
                  onChange={(d) => setData('selection_end_date', d ? d.format('Y-m-d') : null)}
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-3 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Disbursement Schedule</span>
              <div className="grid grid-cols-2 gap-2">
                <DatePicker
                  placeholder="Release Start"
                  className="w-full"
                  value={data.release_start_date ? dayjs(data.release_start_date) : null}
                  onChange={(d) => setData('release_start_date', d ? d.format('Y-m-d') : null)}
                />
                <DatePicker
                  placeholder="Release End"
                  className="w-full"
                  value={data.release_end_date ? dayjs(data.release_end_date) : null}
                  onChange={(d) => setData('release_end_date', d ? d.format('Y-m-d') : null)}
                />
              </div>
            </div>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
