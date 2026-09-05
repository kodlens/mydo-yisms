import { App, Button, Form, Input } from "antd";
import { ReactElement, ReactNode, useState } from "react";
import { LockOutlined, SaveOutlined } from "@ant-design/icons";
import axios from "axios";
import { SharedData } from "@/types";
import StudentAuthLayout from "@/layouts/youth-auth-layout";

export default function ChangePassword() {

  const [errors, setErrors] = useState<Record<string, unknown[]>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [form] = Form.useForm()
  const { modal } = App.useApp();



  const submit = (values: object) => {
    setLoading(true)
    setErrors({})
    axios.post('/change-password', values).then(res => {
      setLoading(false)

      if (res.data.status === "changed") {
        modal.success({
          title: "Success!",
          content: <div>Password successfully changed.</div>,
          onOk() {
            form.setFieldValue('old_password', '')
            form.setFieldValue('password', '')
            form.setFieldValue('password_confirmation', '')
          },
        });
      }
    }).catch(err => {
      setLoading(false)

      if (err.response.status === 422) {
        setErrors(err.response.data.errors)
      }
    })
  }


  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[980px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-amber-50 via-white to-orange-50 px-6 py-6">
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-amber-100/60 blur-2xl" />
          <div className="pointer-events-none absolute -left-8 -bottom-14 h-36 w-36 rounded-full bg-orange-100/70 blur-2xl" />
          <div className="relative flex items-start gap-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-600 shadow-sm">
              <LockOutlined className="text-xl" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-700">Security Settings</p>
              <h1 className="mt-1 text-2xl font-semibold leading-tight text-slate-900">Change Password</h1>
              <p className="mt-1 text-sm text-slate-600">Use a strong password and keep it private.</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Form form={form} layout="vertical"
            onFinish={submit}
            autoComplete='off'
            initialValues={{
              old_password: '',
              password: '',
              password_confirmation: '',

            }}>

            <Form.Item label="Current Password"
              name="old_password"
              validateStatus={errors?.old_password ? 'error' : ''}
              help={errors?.old_password ? errors?.old_password[0] as string : ''}
            >
              <Input.Password placeholder="Current Password" size="large" />
            </Form.Item>

            <div className="grid gap-4 md:grid-cols-2">
              <Form.Item label="New Password" name="password"
                validateStatus={errors?.password ? 'error' : ''}
                help={errors?.password ? errors?.password[0] as string : ''}
              >
                <Input.Password placeholder="New Password" size="large" />
              </Form.Item>

              <Form.Item label="Confirm New Password" name="password_confirmation"
                validateStatus={errors?.password_confirmation ? 'error' : ''}
                help={errors?.password_confirmation ? errors?.password_confirmation[0] as string : ''}
              >
                <Input.Password placeholder="Confirm New Password" size="large" />
              </Form.Item>
            </div>

            <div className="mt-2 flex justify-end">
              <Button
                htmlType="submit"
                type="primary"
                icon={<SaveOutlined />}
                size='large'
                loading={loading}>
                Update Password
              </Button>
            </div>

          </Form>
        </div>
      </div>
    </div>
  )
}


ChangePassword.layout = (page: ReactNode) => (
  <StudentAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>
    {page}
  </StudentAuthLayout>
)
