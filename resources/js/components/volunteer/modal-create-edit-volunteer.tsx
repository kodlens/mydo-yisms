import { Volunteer, VolunteerPayload, VolunteerStatus } from '@/types/volunteer';
import { App, Form, Input, Modal, Radio } from 'antd';
import axios from 'axios';
import { HandHeart, Info, Mail, Pencil, Phone, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  data?: Volunteer;
  modalOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  /** Endpoint prefix, so the admin and staff panels share this modal. */
  basePath?: string;
};

const ModalCreateEditVolunteer = ({ data, modalOpen, onClose, refetch, basePath = '/admin/volunteers' }: Props) => {
  const { notification } = App.useApp();
  const [form] = Form.useForm<VolunteerPayload>();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const isEditing = (data?.id ?? 0) > 0;

  useEffect(() => {
    if (!modalOpen) return;

    setErrors({});

    if (isEditing) {
      form.setFieldsValue({
        motivation: data?.motivation ?? '',
        skills: data?.skills ?? '',
        availability: data?.availability ?? '',
        emergency_contact_name: data?.emergency_contact_name ?? '',
        emergency_contact_number: data?.emergency_contact_number ?? '',
        status: data?.status ?? 'pending',
      });
    } else {
      form.resetFields();
      form.setFieldsValue({
        motivation: '',
        skills: '',
        availability: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        status: 'pending',
      });
    }
  }, [modalOpen, isEditing, data, form]);

  const onFinish = async (values: VolunteerPayload) => {
    setLoading(true);

    try {
      const payload = {
        ...values,
        motivation: values.motivation?.trim() ? values.motivation.trim() : null,
        skills: values.skills?.trim() ? values.skills.trim() : null,
        availability: values.availability?.trim() ? values.availability.trim() : null,
        emergency_contact_name: values.emergency_contact_name?.trim() ? values.emergency_contact_name.trim() : null,
        emergency_contact_number: values.emergency_contact_number?.trim() ? values.emergency_contact_number.trim() : null,
      };

      if (isEditing) {
        await axios.put(`${basePath}/${data?.id}`, payload);
        notification.success({
          message: 'Volunteer updated',
          description: `${data?.full_name} was saved successfully.`,
          placement: 'topRight',
        });
      } else {
        await axios.post(basePath, payload);
        notification.success({
          message: 'Volunteer registered',
          description: `${payload.email} was added to the volunteer program.`,
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
          description: 'Some fields need attention before this volunteer can be saved.',
          placement: 'topRight',
        });
      } else {
        const description = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? err.message ?? 'Something went wrong. Please try again.')
          : 'Something went wrong. Please try again.';

        notification.error({
          message: isEditing ? 'Could not update volunteer' : 'Could not register volunteer',
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
      width={640}
      centered
      title={
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-700">
            {isEditing ? <Pencil size={17} /> : <Plus size={17} />}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold text-stone-900">{isEditing ? 'Edit volunteer' : 'Register a volunteer'}</span>
            <span className="mt-0.5 block text-xs font-normal text-stone-500">
              {isEditing ? 'Update the volunteer record and review status.' : 'Add a youth who already has an account to the volunteer program.'}
            </span>
          </span>
        </div>
      }
      okText={isEditing ? 'Save changes' : 'Register volunteer'}
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
          initialValues={{ motivation: '', skills: '', availability: '', emergency_contact_name: '', emergency_contact_number: '', status: 'pending' }}
        >
          {dom}
        </Form>
      )}
    >
      <div className="flex flex-col gap-1 pt-2">
        {isEditing ? (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-stone-200 bg-stone-50/70 p-3">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-700 ring-1 ring-stone-200">
              <HandHeart size={16} />
            </span>
            <div className="min-w-0 text-sm">
              <p className="truncate font-semibold text-stone-900">{data?.full_name}</p>
              <p className="truncate text-xs text-stone-500">{data?.email}</p>
            </div>
          </div>
        ) : (
          <Form.Item
            name="email"
            label="Youth email address"
            tooltip="The youth must already have an account. This links the volunteer record to their profile."
            className="mb-4"
            validateStatus={errors.email ? 'error' : ''}
            help={errors.email?.[0] ?? 'Must match an existing youth account.'}
            rules={[
              { required: true, message: 'Enter the youth email address.' },
              { type: 'email', message: 'Enter a valid email address.' },
            ]}
          >
            <Input tabIndex={1} prefix={<Mail size={15} className="text-stone-400" />} placeholder="youth@example.com" disabled={loading} />
          </Form.Item>
        )}

        <Form.Item
          name="motivation"
          label="Motivation"
          tooltip="Why the youth wants to volunteer. Shown to staff reviewing the record."
          className="mb-4"
          validateStatus={errors.motivation ? 'error' : ''}
          help={errors.motivation?.[0] ?? 'Optional for staff-registered volunteers.'}
          rules={[{ max: 2000, message: 'Keep this under 2000 characters.' }]}
        >
          <Input.TextArea
            tabIndex={2}
            rows={3}
            placeholder="e.g. I want to help clean up our barangay and gain experience for my scholarship application."
            maxLength={2000}
            disabled={loading}
          />
        </Form.Item>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <Form.Item
            name="skills"
            label="Skills"
            className="mb-0"
            validateStatus={errors.skills ? 'error' : ''}
            help={errors.skills?.[0] ?? 'Optional.'}
            rules={[{ max: 255, message: 'Keep this under 255 characters.' }]}
          >
            <Input tabIndex={3} placeholder="e.g. First aid, driving, tutoring" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="availability"
            label="Availability"
            className="mb-0"
            validateStatus={errors.availability ? 'error' : ''}
            help={errors.availability?.[0] ?? 'Optional.'}
            rules={[{ max: 255, message: 'Keep this under 255 characters.' }]}
          >
            <Input tabIndex={4} placeholder="e.g. Weekday mornings" disabled={loading} />
          </Form.Item>
        </div>

        <div className="mb-4 grid gap-4 sm:grid-cols-2">
          <Form.Item
            name="emergency_contact_name"
            label="Emergency contact"
            className="mb-0"
            validateStatus={errors.emergency_contact_name ? 'error' : ''}
            help={errors.emergency_contact_name?.[0]}
          >
            <Input tabIndex={5} placeholder="Full name" disabled={loading} />
          </Form.Item>

          <Form.Item
            name="emergency_contact_number"
            label="Contact number"
            className="mb-0"
            validateStatus={errors.emergency_contact_number ? 'error' : ''}
            help={errors.emergency_contact_number?.[0]}
          >
            <Input tabIndex={6} prefix={<Phone size={15} className="text-stone-400" />} placeholder="09XX XXX XXXX" disabled={loading} />
          </Form.Item>
        </div>

        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-4">
          <Form.Item
            name="status"
            label="Volunteer status"
            className="mb-0"
            validateStatus={errors.status ? 'error' : ''}
            help={errors.status?.[0]}
          >
            <Radio.Group>
              {(['pending', 'active', 'inactive'] as VolunteerStatus[]).map((value) => (
                <Radio.Button key={value} value={value} disabled={loading}>
                  {value.charAt(0).toUpperCase() + value.slice(1)}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>
          <div className="mt-3 flex items-start gap-2">
            <Info size={15} className="mt-0.5 shrink-0 text-stone-400" />
            <p className="text-xs leading-5 text-stone-500">
              Active volunteers can be assigned to activities. Inactive volunteers keep their service hours but are not assigned new work.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreateEditVolunteer;
