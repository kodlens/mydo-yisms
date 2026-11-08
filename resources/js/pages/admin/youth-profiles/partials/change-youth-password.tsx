import { App, Button, Form, Input, Modal } from 'antd';
import { useState } from 'react';
import { EyeInvisibleOutlined, EyeTwoTone, LockOutlined } from '@ant-design/icons';
import { ExtendedYouth } from './admin-youth-profile-drawer';
import axios from 'axios';

type Props = {
  youth: ExtendedYouth;
  onSuccess?: () => void;
  trigger?: (open: () => void) => React.ReactNode;
};

export default function ChangeYouthPassword({ youth, onSuccess, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [form] = Form.useForm();
  const { notification } = App.useApp();

  const handleOpen = () => {
    setErrors({});
    form.resetFields();
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setErrors({});
    form.resetFields();
  };

  const onFinish = (values: { password: string; password_confirmation: string }) => {
    setLoading(true);
    setErrors({});

    axios
      .post(`/admin/youth-profiles/${youth.id}/change-password`, values)
      .then((res) => {
        if (res.data.status === 'changed') {
          notification.success({
            message: 'Youth Password Changed',
            description: `Password for ${fullName} has been updated successfully.`,
            duration: 3,
            showProgress: true,
          });
          onSuccess?.();
          handleClose();
        }
      })
      .catch((err) => {
        if (err.response?.status === 422 && err.response.data?.errors) {
          setErrors(err.response.data.errors);
        } else {
          notification.error({
            message: 'Failed to change youth password',
            description: err.response?.data?.message || 'Please check the form and try again.',
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fullName = [youth.fname, youth.mname, youth.lname, youth.suffix].filter(Boolean).join(' ') || 'Youth Member';

  return (
    <>
      {trigger ? (
        trigger(handleOpen)
      ) : (
        <Button
          loading={loading}
          onClick={handleOpen}
          icon={<LockOutlined />}
          title={`Change password for ${fullName}`}
          aria-label={`Change password for ${fullName}`}
        />
      )}

      <Modal
        open={open}
        title={
          <div className="flex items-center gap-2 text-slate-800">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <LockOutlined />
            </div>
            <div>
              <span className="font-bold text-sm block">Change Youth Account Password</span>
              <span className="text-xs text-slate-500 font-normal">
                {fullName} • Ref: {youth.reference_code || `#${youth.id}`}
              </span>
            </div>
          </div>
        }
        okText="Save New Password"
        cancelText="Cancel"
        okButtonProps={{
          autoFocus: true,
          htmlType: 'submit',
          loading: loading,
          className: '!bg-green-700 hover:!bg-green-800',
        }}
        onCancel={handleClose}
        destroyOnClose
        modalRender={(dom) => (
          <Form
            layout="vertical"
            form={form}
            name="change_youth_password_form"
            autoComplete="off"
            initialValues={{
              password: '',
              password_confirmation: '',
            }}
            clearOnDestroy
            onFinish={onFinish}
          >
            {dom}
          </Form>
        )}
      >
        <div className="py-2 space-y-2">
          <p className="text-xs text-slate-500 mb-4">
            Reset or assign a new password for this youth user account. The youth member can use this new password to sign in to their portal.
          </p>

          <Form.Item
            name="password"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter a new password.' },
              { min: 6, message: 'Password must be at least 6 characters.' },
            ]}
            validateStatus={errors.password ? 'error' : ''}
            help={errors.password ? (errors.password[0] as string) : ''}
          >
            <Input.Password
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              placeholder="Enter new password (min. 6 characters)"
            />
          </Form.Item>

          <Form.Item
            name="password_confirmation"
            label="Confirm New Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm the new password.' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match.'));
                },
              }),
            ]}
            validateStatus={errors.password_confirmation ? 'error' : ''}
            help={errors.password_confirmation ? (errors.password_confirmation[0] as string) : ''}
          >
            <Input.Password
              iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
              placeholder="Re-type new password"
            />
          </Form.Item>
        </div>
      </Modal>
    </>
  );
}
