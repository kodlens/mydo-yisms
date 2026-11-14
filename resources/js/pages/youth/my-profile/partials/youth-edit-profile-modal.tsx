import { Youth } from '@/types';
import { router } from '@inertiajs/react';
import { App, Form, Input, InputNumber, Modal, Select } from 'antd';
import { BookOpen, Building2, GraduationCap, Hash, Phone, UserRound, Users, Wallet } from 'lucide-react';
import { useEffect, useState } from 'react';

type Profile = Youth & { suffix?: string | null; school_address?: string | null; student_id?: string | null };

type Props = {
  open: boolean;
  onClose: () => void;
  youth: Profile;
};

type FormValues = {
  mobile_number: string;
  school_name: string;
  school_address?: string;
  program: string;
  year: number;
  student_id?: string;
  is_graduated?: boolean;
  guardian_name: string;
  guardian_contact_number: string;
  monthly_family_income: number;
};

const yearLevelOptions = [
  { value: 1, label: '1st Year College' },
  { value: 2, label: '2nd Year College' },
  { value: 3, label: '3rd Year College' },
  { value: 4, label: '4th Year College' },
  { value: 5, label: '5th Year College' },
];

export default function YouthEditProfileModal({ open, onClose, youth }: Props) {
  const [form] = Form.useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        mobile_number: youth.mobile_number || '',
        school_name: youth.school_name || '',
        school_address: youth.school_address || '',
        program: youth.program || '',
        year: youth.year ? Number(youth.year) : 1,
        student_id: youth.student_id || '',
        is_graduated: false,
        guardian_name: youth.guardian_name || '',
        guardian_contact_number: youth.guardian_contact_number || '',
        monthly_family_income: youth.monthly_family_income ? Number(youth.monthly_family_income) : 0,
      });
    }
  }, [open, youth, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const payload = {
        mobile_number: values.mobile_number,
        school_name: values.school_name.trim(),
        school_address: values.school_address?.trim() || null,
        program: values.program.trim(),
        year: values.year,
        student_id: values.student_id?.trim() || null,
        is_graduated: false,
        guardian_name: values.guardian_name,
        guardian_contact_number: values.guardian_contact_number,
        monthly_family_income: values.monthly_family_income,
      };

      router.put(route('youth.youth-my-profile.update'), payload, {
        preserveScroll: true,
        onSuccess: () => {
          message.success('Profile details updated successfully.');
          onClose();
        },
        onError: () => {
          message.error('Please check the form for errors.');
        },
        onFinish: () => {
          setLoading(false);
        },
      });
    } catch {
      // validation failed
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
            <UserRound className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">Update Profile Details</h3>
            <p className="text-xs text-slate-500 font-normal">
              Keep your contact, educational, and guardian records up to date with MYDO.
            </p>
          </div>
        </div>
      }
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={loading}
      okText="Save Changes"
      cancelText="Cancel"
      width={640}
      destroyOnClose
      okButtonProps={{
        className: '!bg-teal-700 hover:!bg-teal-800 !border-teal-700',
      }}
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        {/* Contact Number */}
        <Form.Item
          name="mobile_number"
          label={<span className="font-medium text-slate-700">Active Mobile Number</span>}
          rules={[
            { required: true, message: 'Please enter your mobile number.' },
            { pattern: /^(09|\+639)[0-9]{9}$/, message: 'Must be a valid Philippine mobile number (09XXXXXXXXX).' },
          ]}
        >
          <Input size="large" prefix={<Phone className="h-4 w-4 text-slate-400" />} placeholder="09XXXXXXXXX" />
        </Form.Item>

        {/* College Educational Details */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <GraduationCap className="h-4 w-4 text-teal-700" />
            <span>College Academic Background</span>
          </div>

          <div className="space-y-3">
            <Form.Item
              name="school_name"
              label={<span className="text-xs font-medium text-slate-700">College / University Name</span>}
              rules={[{ required: true, message: 'College or university name is required.' }]}
            >
              <Input
                size="large"
                prefix={<GraduationCap className="h-4 w-4 text-slate-400" />}
                placeholder="e.g. Bukidnon State University"
              />
            </Form.Item>

            <div className="grid gap-3 sm:grid-cols-2">
              <Form.Item
                name="program"
                label={<span className="text-xs font-medium text-slate-700">Degree Program / Course</span>}
                rules={[{ required: true, message: 'Degree program is required.' }]}
              >
                <Input
                  size="large"
                  prefix={<BookOpen className="h-4 w-4 text-slate-400" />}
                  placeholder="e.g. BS Information Technology"
                />
              </Form.Item>

              <Form.Item
                name="year"
                label={<span className="text-xs font-medium text-slate-700">College Year Level</span>}
                rules={[{ required: true, message: 'College year level is required.' }]}
              >
                <Select size="large" options={yearLevelOptions} placeholder="Select year level" />
              </Form.Item>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Form.Item
                name="student_id"
                label={<span className="text-xs font-medium text-slate-700">Student ID (Optional)</span>}
              >
                <Input
                  size="large"
                  prefix={<Hash className="h-4 w-4 text-slate-400" />}
                  placeholder="e.g. 2024-00123"
                />
              </Form.Item>

              <Form.Item
                name="school_address"
                label={<span className="text-xs font-medium text-slate-700">Campus / Address (Optional)</span>}
              >
                <Input
                  size="large"
                  prefix={<Building2 className="h-4 w-4 text-slate-400" />}
                  placeholder="City / Municipality"
                />
              </Form.Item>
            </div>
          </div>
        </div>

        {/* Guardian Information */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <Users className="h-4 w-4 text-teal-700" />
            <span>Family & Guardian</span>
          </div>

          <Form.Item
            name="guardian_name"
            label={<span className="text-xs font-medium text-slate-700">Parent / Guardian Full Name</span>}
            rules={[{ required: true, message: 'Guardian name is required.' }]}
          >
            <Input size="large" placeholder="Full name of parent or legal guardian" />
          </Form.Item>

          <div className="grid gap-3 sm:grid-cols-2">
            <Form.Item
              name="guardian_contact_number"
              label={<span className="text-xs font-medium text-slate-700">Guardian Contact Number</span>}
              rules={[
                { required: true, message: 'Guardian contact number is required.' },
                { pattern: /^(09|\+639)[0-9]{9}$/, message: 'Must be a valid Philippine mobile number (09XXXXXXXXX).' },
              ]}
            >
              <Input size="large" prefix={<Phone className="h-4 w-4 text-slate-400" />} placeholder="09XXXXXXXXX" />
            </Form.Item>

            <Form.Item
              name="monthly_family_income"
              label={<span className="text-xs font-medium text-slate-700">Monthly Household Income (₱)</span>}
              rules={[{ required: true, message: 'Monthly family income is required.' }]}
            >
              <InputNumber
                size="large"
                className="w-full"
                min={0}
                placeholder="10000"
                formatter={(val) => (val ? `₱ ${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                parser={(val) => val!.replace(/₱\s?|(,*)/g, '') as unknown as number}
              />
            </Form.Item>
          </div>
        </div>
      </Form>
    </Modal>
  );
}
