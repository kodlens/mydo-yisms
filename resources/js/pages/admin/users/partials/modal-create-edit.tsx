import SelectBarangay from '@/components/select-barangay';
import SelectCity from '@/components/select-city';
import SelectProvince from '@/components/select-province';
import { SK_POSITION_OPTIONS } from '@/pages/staff/sk-officials/staff-sk-officials-page';
import { User } from '@/types';
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined } from '@ant-design/icons';
import { App, Form, FormInstance, Input, Modal, Select } from 'antd';
import axios from 'axios';
import { FileLock, Keyboard, KeyRound, Mail, MapPin, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type Props = {
  user?: User;
  modalOpen: boolean;
  onClose: () => void;
  refetch: () => void;
  form: FormInstance;
};

const ModalCreateEditUser = ({ user, modalOpen, onClose, refetch, form }: Props) => {
  const [open, setOpen] = useState(modalOpen);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { notification } = App.useApp();

  const selectedRole = Form.useWatch('role', form);
  const provCode = Form.useWatch('provCode', form) || '';
  const citymunCode = Form.useWatch('citymunCode', form) || '';
  const isSkRole = selectedRole === 'sk';

  useEffect(() => {
    setOpen(modalOpen);
    setErrors({});
    if (user) {
      form.setFieldsValue({
        ...user,
        sk_position: user.sk_position || (user.role === 'sk' ? 'SK Chairperson' : undefined),
        provCode: user.provCode || undefined,
        citymunCode: user.citymunCode || undefined,
        brgyCode: user.brgyCode || undefined,
        street_address: user.street_address || '',
      });
    } else {
      form.resetFields();
    }
  }, [modalOpen, user, form]);

  const onFinish = async (values: User) => {
    setLoading(true);
    setErrors({});
    try {
      if ((user ? user.id : 0) > 0) {
        await axios.put(`/admin/users/${user?.id}`, values);
        notification.success({
          message: 'Updated',
          description: 'User updated successfully',
        });
      } else {
        await axios.post('/admin/users', values);
        notification.success({
          message: 'Saved',
          description: 'User created successfully',
        });
      }
      setLoading(false);
      onClose();
      refetch();
    } catch (err) {
      setLoading(false);
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setErrors(err.response.data.errors ?? {});
      }
    }
  };

  return (
    <Modal
      forceRender
      open={open}
      width={740}
      title="MANAGE USER"
      okText="Save"
      cancelText="Cancel"
      onCancel={() => onClose()}
      okButtonProps={{ htmlType: 'submit', loading: loading }}
      destroyOnHidden
      modalRender={(dom) => (
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          onFinish={onFinish}
          onValuesChange={(changedValues) => {
            if ('provCode' in changedValues) {
              form.setFieldsValue({ citymunCode: undefined, brgyCode: undefined });
            } else if ('citymunCode' in changedValues) {
              form.setFieldsValue({ brgyCode: undefined });
            } else if ('role' in changedValues && changedValues.role === 'sk' && !form.getFieldValue('sk_position')) {
              form.setFieldsValue({ sk_position: 'SK Chairperson' });
            }
          }}
          initialValues={{
            username: null,
            email: null,
            fname: null,
            mname: null,
            sex: 'MALE',
            role: null,
          }}
        >
          {dom}
        </Form>
      )}
    >
      <div className="flex flex-col">
        <div className="border-t-2 border-b-2 border-blue-600 px-2 py-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <Form.Item
              name="username"
              label="Username"
              className="w-full"
              validateStatus={errors.username ? 'error' : ''}
              help={errors.username?.[0]}
            >
              <Input tabIndex={1} prefix={<UserOutlined />} placeholder="e.g. jdelacruz" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              className="w-full"
              validateStatus={errors.email ? 'error' : ''}
              help={errors.email?.[0]}
            >
              <Input tabIndex={2} prefix={<Mail size={15} />} placeholder="e.g. juan@mail.com" />
            </Form.Item>
          </div>

          {(user ? user.id : 0) === 0 && (
            <div className="mb-4 rounded-md bg-gray-50 p-4">
              <Form.Item
                name="password"
                label="Password"
                validateStatus={errors.password ? 'error' : ''}
                help={errors.password?.[0]}
              >
                <Input.Password
                  tabIndex={3}
                  prefix={<KeyRound size={15} />}
                  placeholder="Password"
                  iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="password_confirmation"
                label="Confirm Password"
                validateStatus={errors.password_confirmation ? 'error' : ''}
                help={errors.password_confirmation?.[0]}
              >
                <Input.Password
                  tabIndex={4}
                  prefix={<Keyboard size={15} />}
                  placeholder="Confirm Password"
                  iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>
            </div>
          )}

          <div className="flex gap-4">
            <Form.Item
              name="lname"
              label="Last Name"
              className="w-full"
              validateStatus={errors.lname ? 'error' : ''}
              help={errors.lname?.[0]}
            >
              <Input tabIndex={5} prefix={<UserIcon size={15} />} placeholder="e.g. Dela Cruz" />
            </Form.Item>

            <Form.Item
              name="fname"
              label="First Name"
              className="w-full"
              validateStatus={errors.fname ? 'error' : ''}
              help={errors.fname?.[0]}
            >
              <Input tabIndex={6} prefix={<UserIcon size={15} />} placeholder="e.g. Juan" />
            </Form.Item>
          </div>

          <div className="flex gap-4">
            <Form.Item name="mname" label="Middle Name" className="w-full">
              <Input tabIndex={7} prefix={<UserIcon size={15} />} placeholder="Middlename" />
            </Form.Item>

            <Form.Item
              name="role"
              label="Role"
              className="w-full"
              validateStatus={errors.role ? 'error' : ''}
              help={errors.role?.[0]}
            >
              <Select
                tabIndex={8}
                placeholder="e.g. STAFF, ADMIN, SK OFFICIAL"
                prefix={<FileLock size={15} />}
                options={[
                  { value: 'staff', label: 'STAFF' },
                  { value: 'admin', label: 'ADMINISTRATOR' },
                  { value: 'sk', label: 'SK OFFICIAL' },
                ]}
              />
            </Form.Item>
          </div>

          {isSkRole && (
            <div className="mt-2 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4">
              <div className="mb-3 flex items-center gap-2">
                <MapPin size={15} className="text-indigo-700" />
                <p className="text-xs font-bold tracking-wide text-indigo-950 uppercase">
                  SK Position &amp; Assigned Barangay
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Form.Item
                  name="sk_position"
                  label="SK Position"
                  validateStatus={errors.sk_position ? 'error' : undefined}
                  help={errors.sk_position?.[0]}
                  rules={[{ required: true, message: 'Please select the SK position.' }]}
                >
                  <Select placeholder="Select SK Position" options={SK_POSITION_OPTIONS} />
                </Form.Item>

                <Form.Item
                  name="provCode"
                  label="Province"
                  validateStatus={errors.provCode ? 'error' : undefined}
                  help={errors.provCode?.[0]}
                  rules={[{ required: true, message: 'Province is required.' }]}
                >
                  <SelectProvince />
                </Form.Item>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Form.Item
                  name="citymunCode"
                  label="City / Municipality"
                  validateStatus={errors.citymunCode ? 'error' : undefined}
                  help={errors.citymunCode?.[0]}
                  rules={[{ required: true, message: 'City / Municipality is required.' }]}
                >
                  <SelectCity provinceCode={provCode} />
                </Form.Item>

                <Form.Item
                  name="brgyCode"
                  label="Barangay Leading"
                  validateStatus={errors.brgyCode ? 'error' : undefined}
                  help={errors.brgyCode?.[0]}
                  rules={[{ required: true, message: 'Assigned barangay is required.' }]}
                >
                  <SelectBarangay provinceCode={provCode} cityCode={citymunCode} />
                </Form.Item>
              </div>

              <Form.Item
                name="street_address"
                label="Purok / Street / Barangay Hall Address (Optional)"
                validateStatus={errors.street_address ? 'error' : undefined}
                help={errors.street_address?.[0]}
                className="mb-0"
              >
                <Input placeholder="e.g. Purok 1, Near Barangay Hall" />
              </Form.Item>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ModalCreateEditUser;
