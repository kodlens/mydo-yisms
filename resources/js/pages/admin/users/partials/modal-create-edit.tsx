import { Modal, Form, Input, Select, App, FormInstance } from 'antd'
import { useEffect, useState } from 'react'
import { EyeInvisibleOutlined, EyeTwoTone, UserOutlined } from '@ant-design/icons'
import { User } from '@/types'
import axios from 'axios'
import { FileLock, Keyboard, KeyRound, Mail, User as UserIcon } from 'lucide-react'


type Props = {
  user?: User
  modalOpen: boolean
  onClose: () => void
  refetch: () => void
  form: FormInstance
}
const ModalCreateEditUser = ({ user, modalOpen, onClose, refetch, form }: Props) => {
  // const [form] = Form.useForm()
  const [open, setOpen] = useState(modalOpen)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { notification } = App.useApp();


  useEffect(() => {
    setOpen(modalOpen)
    setErrors({})
    if (user) {
      form.setFieldsValue(user)
    } else {
      form.resetFields()
    }
  }, [modalOpen])

  /* ===================== SUBMIT ===================== */

  const onFinish = async (values: User) => {
    setLoading(true)
    try {
      if ((user ? user.id : 0) > 0) {
        await axios.put(`/admin/users/${user?.id}`, values)
        notification.success({
          message: 'Updated',
          description: 'User updated successfully',
        })
      } else {
        await axios.post('/admin/users', values)
        notification.success({
          message: 'Saved',
          description: 'User created successfully',
        })
      }
      setLoading(false)
      onClose()
      refetch()
    } catch (err) {
      setLoading(false)
      if (axios.isAxiosError(err) && err.response?.status === 422) {
        setErrors(err.response.data.errors)
      }
    }
  }

  return (
    <>
      {/* MODAL */}
      <Modal
        forceRender
        open={open}
        width={720}
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
            initialValues={{
              username: null,
              email: null,
              fname: null,
              mname: null,
              sex: 'MALE',
              role: null
            }}
          >

            {dom}
          </Form>
        )}
      >
        <div className="flex flex-col">

          <div className='border-t-2 border-b-2 border-blue-600 py-4 px-2'>

            <div className='flex gap-4 flex-col md:flex-row'>
              <Form.Item name="username" label="Username"
                className='w-full'
                validateStatus={errors.username ? 'error' : ''}
                help={errors.username?.[0]}
              >
                <Input
                  tabIndex={1}
                  prefix={<UserOutlined  />}
                  placeholder='e.g. jdelacruz'
                />
              </Form.Item>

              <Form.Item name="email" label="Email"
                className='w-full'
                validateStatus={errors.email ? 'error' : ''}
                help={errors.email?.[0]}>
                <Input
                  tabIndex={2}
                  prefix={<Mail size={15}/>}
                  placeholder='e.g. juan@mail.com'/>
              </Form.Item>
            </div>

            {(user ? user.id : 0) === 0 && (
              <div className="mb-4 rounded-md bg-gray-50 p-4">
                <Form.Item name="password" label="Password"
                  validateStatus={errors.password ? 'error' : ''}
                  help={errors.password?.[0]}>
                  <Input.Password
                    tabIndex={3}
                    prefix={<KeyRound size={15}/>}
                    placeholder='Password'
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
                    prefix={<Keyboard size={15}/>}
                    placeholder='Confirm Password'
                    iconRender={(v) => (v ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>
              </div>
            )}


            <div className='flex gap-4'>
              <Form.Item name="lname" label="Last Name"
                className='w-full'
                validateStatus={errors.lname ? 'error' : ''}
                help={errors.lname?.[0]}>
                <Input
                  tabIndex={5}
                  prefix={<UserIcon size={15}/>}
                  placeholder='e.g. Dela Cruz'/>
              </Form.Item>

              <Form.Item name="fname" label="First Name"
                className='w-full'
                validateStatus={errors.fname ? 'error' : ''}
                help={errors.fname?.[0]}>
                <Input
                  tabIndex={6}
                  prefix={<UserIcon size={15}/>}
                  placeholder='e.g. Juan'/>
              </Form.Item>

            </div>

            <div className='flex gap-4'>
              <Form.Item name="mname" label="Middle Name"
                className='w-full'>
                <Input
                  tabIndex={7}
                  prefix={<UserIcon size={15}/>}
                  placeholder='Middlename'/>
              </Form.Item>

              <Form.Item name="role" label="Role"
                className='w-full'
                validateStatus={errors.role ? 'error' : ''}
                help={errors.role?.[0]}>
                <Select
                  tabIndex={8}
                  placeholder="e.g. STAFF, ADMIN"
                  prefix={<FileLock size={15}/>}
                  options={[
                    { value: 'staff', label: 'STAFF' },
                    { value: 'admin', label: 'ADMINISTRATOR' },
                  ]}
                />
              </Form.Item>
            </div>
          </div>

        </div>
      </Modal>
    </>
  )
}

export default ModalCreateEditUser
