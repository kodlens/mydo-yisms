import { ScholarshipType, ScholarshipTypePayload } from '@/types/scholarship';
import { App, Form, Input, InputNumber, Modal, Switch } from 'antd';
import axios, { isAxiosError } from 'axios';
import { GraduationCap, Sparkles, Users, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: (messageText: string) => void;
  scholarship?: ScholarshipType;
};

export default function StaffScholarshipModal({ open, onClose, onSuccess, scholarship }: Props) {
  const [form] = Form.useForm<ScholarshipTypePayload>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { notification } = App.useApp();

  const isEditing = Boolean(scholarship);

  useEffect(() => {
    if (open) {
      setErrors({});
      if (scholarship) {
        form.setFieldsValue({
          scholarship: scholarship.scholarship,
          target_beneficiary: scholarship.target_beneficiary ?? '',
          benefit: scholarship.benefit ?? '',
          amount: scholarship.amount !== null && scholarship.amount !== undefined ? Number(scholarship.amount) : null,
          is_active: Boolean(scholarship.is_active),
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          scholarship: '',
          target_beneficiary: '',
          benefit: '',
          amount: null,
          is_active: true,
        });
      }
    }
  }, [open, scholarship, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      setErrors({});

      const payload = {
        scholarship: values.scholarship?.trim(),
        target_beneficiary: values.target_beneficiary?.trim() || null,
        benefit: values.benefit?.trim() || null,
        amount: values.amount !== null && values.amount !== undefined ? Number(values.amount) : null,
        is_active: Boolean(values.is_active),
      };

      if (isEditing && scholarship) {
        const response = await axios.put<{ success: boolean; message: string }>(
          route('staff.scholarships.update', scholarship.id),
          payload
        );
        onSuccess(response.data.message || 'Scholarship program updated successfully.');
      } else {
        const response = await axios.post<{ success: boolean; message: string }>(
          route('staff.scholarships.store'),
          payload
        );
        onSuccess(response.data.message || 'Scholarship program created successfully.');
      }

      onClose();
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 422) {
        const validationErrors = err.response.data.errors ?? {};
        setErrors(validationErrors);
      } else if (isAxiosError(err)) {
        notification.error({
          message: 'Error saving scholarship',
          description: err.response?.data?.message || 'Something went wrong. Please check your inputs.',
          placement: 'topRight',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {isEditing ? 'Edit Scholarship Program' : 'Create New Scholarship Program'}
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              {isEditing
                ? 'Update program details, eligibility criteria, and financial grant amount.'
                : 'Define a new scholarship grant for municipal youth beneficiaries.'}
            </p>
          </div>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText={isEditing ? 'Save Changes' : 'Create Scholarship'}
      cancelText="Cancel"
      width={600}
      destroyOnClose
      okButtonProps={{
        className: '!bg-emerald-700 hover:!bg-emerald-800 !border-emerald-700',
      }}
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        <Form.Item
          name="scholarship"
          label={<span className="font-medium text-slate-700">Scholarship Program Title</span>}
          validateStatus={errors.scholarship ? 'error' : ''}
          help={errors.scholarship ? errors.scholarship[0] : 'The official name of the scholarship grant.'}
          rules={[{ required: true, message: 'Please enter the scholarship program name.' }]}
        >
          <Input
            size="large"
            placeholder="e.g. Tertiary Educational Assistance Program (TEAP)"
            prefix={<Sparkles className="h-4 w-4 text-slate-400" />}
          />
        </Form.Item>

        <Form.Item
          name="target_beneficiary"
          label={<span className="font-medium text-slate-700">Target Beneficiaries</span>}
          validateStatus={errors.target_beneficiary ? 'error' : ''}
          help={errors.target_beneficiary ? errors.target_beneficiary[0] : 'Who is eligible to apply for this scholarship?'}
        >
          <Input
            size="large"
            placeholder="e.g. Enrolled College Students residing in Don Carlos with low household income"
            prefix={<Users className="h-4 w-4 text-slate-400" />}
          />
        </Form.Item>

        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item
            name="benefit"
            label={<span className="font-medium text-slate-700">Benefit Summary</span>}
            validateStatus={errors.benefit ? 'error' : ''}
            help={errors.benefit ? errors.benefit[0] : 'e.g. Tuition fee subsidy, semestral stipend'}
          >
            <Input size="large" placeholder="e.g. Semestral Educational Grant" />
          </Form.Item>

          <Form.Item
            name="amount"
            label={<span className="font-medium text-slate-700">Grant Amount (PHP)</span>}
            validateStatus={errors.amount ? 'error' : ''}
            help={errors.amount ? errors.amount[0] : 'Fixed amount per approved beneficiary.'}
          >
            <InputNumber
              size="large"
              className="w-full"
              min={0}
              placeholder="e.g. 5000"
              prefix={<Wallet className="h-4 w-4 text-slate-400 mr-1" />}
              formatter={(val) => (val ? `₱ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
              parser={(val) => val!.replace(/₱\s?|(,*)/g, '') as unknown as number}
            />
          </Form.Item>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Program Acceptance Status</p>
              <p className="text-xs text-slate-500">
                When active, eligible registered youth can see and apply for this scholarship in their portal.
              </p>
            </div>
            <Form.Item name="is_active" valuePropName="checked" noStyle>
              <Switch checkedChildren="Active" unCheckedChildren="Inactive" className="bg-slate-300" />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
