import { ScholarshipType, ScholarshipTypePayload } from '@/types/scholarship';
import { App, Form, Input, InputNumber, Modal, Switch } from 'antd';
import axios from 'axios';
import { Gift, GraduationCap, Info, Pencil, PhilippinePeso, Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  data?: ScholarshipType;
  modalOpen: boolean;
  onClose: () => void;
  refetch: () => void;
};

const MAX_AMOUNT = 9999999999.99;

const ModalCreateEditScholarshipType = ({ data, modalOpen, onClose, refetch }: Props) => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<ScholarshipTypePayload>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const isEditing = (data?.id ?? 0) > 0;
  const isActiveValue = Form.useWatch('is_active', form);

  useEffect(() => {
    if (!modalOpen) return;

    setErrors({});

    if (isEditing) {
      // The API sends the amount as a decimal string, so normalise it for InputNumber.
      const parsedAmount = Number(data?.amount);

      form.setFieldsValue({
        scholarship: data?.scholarship ?? '',
        target_beneficiary: data?.target_beneficiary ?? '',
        benefit: data?.benefit ?? '',
        amount: Number.isFinite(parsedAmount) ? parsedAmount : null,
        is_active: !!data?.is_active,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ scholarship: '', target_beneficiary: '', benefit: '', amount: null, is_active: true });
    }
  }, [modalOpen, isEditing, data, form]);

  const onFinish = async (values: ScholarshipTypePayload) => {
    setLoading(true);

    try {
      // Trim the text fields and turn empty optional ones into null so the API clears them.
      const payload = {
        ...values,
        scholarship: (values.scholarship ?? '').trim(),
        target_beneficiary: values.target_beneficiary?.trim() ? values.target_beneficiary.trim() : null,
        benefit: values.benefit?.trim() ? values.benefit.trim() : null,
        amount: values.amount ?? null,
      };

      if (isEditing) {
        await axios.put(`/admin/scholarship-types/${data?.id}`, payload);
        notification.success({
          message: 'Scholarship updated',
          description: `“${payload.scholarship}” was saved successfully.`,
          placement: 'topRight',
        });
      } else {
        await axios.post('/admin/scholarship-types', payload);
        notification.success({
          message: 'Scholarship created',
          description: `“${payload.scholarship}” was added successfully.`,
          placement: 'topRight',
        });
      }

      onClose();
      refetch();
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
        notification.error({
          message: 'Please check the form',
          description: 'Some fields need attention before this scholarship can be saved.',
          placement: 'topRight',
        });
      } else {
        const description = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? err.message ?? 'Something went wrong. Please try again.')
          : 'Something went wrong. Please try again.';

        notification.error({
          message: isEditing ? 'Could not update scholarship' : 'Could not create scholarship',
          description,
          placement: 'topRight',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      forceRender
      open={modalOpen}
      width={680}
      centered
      title={
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
            {isEditing ? <Pencil size={17} /> : <Plus size={17} />}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold text-stone-900">{isEditing ? 'Edit scholarship' : 'New scholarship'}</span>
            <span className="mt-0.5 block text-xs font-normal text-stone-500">
              {isEditing ? 'Update the details below and save your changes.' : 'These details are what youth see when browsing scholarships.'}
            </span>
          </span>
        </div>
      }
      okText={isEditing ? 'Save changes' : 'Create scholarship'}
      cancelText="Cancel"
      onCancel={() => {
        if (!loading) onClose();
      }}
      okButtonProps={{ htmlType: 'submit', loading }}
      cancelButtonProps={{ disabled: loading }}
      maskClosable={!loading}
      closable={!loading}
      destroyOnHidden
      modalRender={(dom) => (
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={onFinish}
          requiredMark
          initialValues={{ scholarship: '', target_beneficiary: '', benefit: '', amount: null, is_active: true }}
        >
          {dom}
        </Form>
      )}
    >
      <div className="flex flex-col gap-1 pt-2">
        <Form.Item
          name="scholarship"
          label="Scholarship / program name"
          className="mb-4"
          validateStatus={errors.scholarship ? 'error' : ''}
          help={errors.scholarship?.[0]}
          rules={[
            { required: true, whitespace: true, message: 'Enter a scholarship or program name.' },
            { max: 255, message: 'Keep the name under 255 characters.' },
          ]}
        >
          <Input
            tabIndex={1}
            prefix={<GraduationCap size={15} className="text-stone-400" />}
            placeholder="e.g. STEM Scholarship"
            maxLength={255}
            showCount
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="target_beneficiary"
          label="Target beneficiaries"
          tooltip="Who is eligible to apply. Shown to youth when they review the program."
          className="mb-4"
          validateStatus={errors.target_beneficiary ? 'error' : ''}
          help={errors.target_beneficiary?.[0] ?? 'Optional. Describe who the program is for.'}
          rules={[{ max: 255, message: 'Keep this under 255 characters.' }]}
        >
          <Input.TextArea
            tabIndex={2}
            rows={3}
            placeholder="e.g. Senior high school students who are currently enrolled"
            maxLength={255}
            showCount
            disabled={loading}
          />
        </Form.Item>

        <Form.Item
          name="benefit"
          label="Benefits"
          tooltip="What the scholarship covers. Shown to youth when they review the program."
          className="mb-4"
          validateStatus={errors.benefit ? 'error' : ''}
          help={errors.benefit?.[0] ?? 'Optional. Describe what the award covers.'}
          rules={[{ max: 255, message: 'Keep this under 255 characters.' }]}
        >
          <Input.TextArea tabIndex={3} rows={3} placeholder="e.g. Tuition fees, books, and a monthly allowance" maxLength={255} showCount disabled={loading} />
        </Form.Item>

        <Form.Item
          name="amount"
          label="Amount"
          tooltip="Leave blank if the award value varies or is not a fixed peso amount."
          className="mb-4"
          validateStatus={errors.amount ? 'error' : ''}
          help={errors.amount?.[0] ?? 'Optional. The full peso value of the award.'}
          rules={[
            {
              type: 'number',
              min: 0,
              max: MAX_AMOUNT,
              message: `Enter an amount between 0 and ${MAX_AMOUNT.toLocaleString('en-PH')}.`,
            },
          ]}
        >
          <InputNumber
            className="w-full"
            prefix={<PhilippinePeso size={15} className="text-stone-400" />}
            tabIndex={4}
            placeholder="10000"
            min={0}
            max={MAX_AMOUNT}
            precision={2}
            step={500}
            formatter={(value) => (value === undefined || value === null ? '' : String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ','))}
            parser={(value) => Number(String(value ?? '').replace(/,/g, '')) as unknown as 0}
            disabled={loading}
          />
        </Form.Item>

        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
          <Form.Item
            name="is_active"
            valuePropName="checked"
            className="mb-0"
            validateStatus={errors.is_active ? 'error' : ''}
            help={errors.is_active?.[0]}
          >
            <Switch tabIndex={5} checkedChildren="Open" unCheckedChildren="Closed" disabled={loading} />
          </Form.Item>
          <div className="mt-3 flex items-start gap-2">
            <Info size={15} className="mt-0.5 shrink-0 text-stone-400" />
            <p className="text-xs leading-5 text-stone-500">
              {isActiveValue === false
                ? 'Closed programs are hidden from the youth listings. You can reopen it at any time.'
                : 'Open programs appear in the youth scholarship list and can receive applications.'}
            </p>
          </div>
        </div>

        {isEditing && (data?.applications_count ?? 0) > 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
            <Users size={15} className="mt-0.5 shrink-0 text-amber-700" />
            <p className="text-xs leading-5 text-amber-900">
              This program has {data?.applications_count} existing{' '}
              {data?.applications_count === 1 ? 'application' : 'applications'}, so it cannot be deleted. Close it instead to stop new
              applicants.
            </p>
          </div>
        )}

        {isEditing && (data?.applications_count ?? 0) === 0 && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-stone-200 bg-stone-50 p-3">
            <Gift size={15} className="mt-0.5 shrink-0 text-stone-400" />
            <p className="text-xs leading-5 text-stone-500">
              No one has applied to this program yet, so it can still be deleted without losing applicant records.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ModalCreateEditScholarshipType;
