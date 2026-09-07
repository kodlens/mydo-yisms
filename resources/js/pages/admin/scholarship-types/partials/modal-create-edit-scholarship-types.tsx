import { Modal, Form, Input, App, InputNumber, Checkbox } from 'antd'
import { useEffect, useState } from 'react'
import { User } from '@/types'
import axios from 'axios'
import { GraduationCap, PhilippinePeso  } from 'lucide-react'
import TextArea from 'antd/es/input/TextArea'
import { ScholarshipType } from '@/types/scholarship'


type Props = {
  data?: ScholarshipType
  modalOpen: boolean
  onClose: () => void
  refetch: () => void
}
const ModalCreateEditScholarshipType = ({ data, modalOpen, onClose, refetch }: Props) => {
  // const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { notification } = App.useApp();
  const [form] = Form.useForm()

  useEffect(() => {
    if(!modalOpen) return

    setErrors({})
    if (data) {
      form.setFieldsValue(data)
    } else {
      form.resetFields()
    }
  }, [modalOpen])

  /* ===================== SUBMIT ===================== */

  const onFinish = async (values: User) => {
    setLoading(true)
    try {
      if ((data ? data.id : 0) > 0) {
        await axios.put(`/admin/scholarship-types/${data?.id}`, values)
        notification.success({
          message: 'Updated',
          description: 'Scholarship type updated successfully',
        })
      } else {
        await axios.post('/admin/scholarship-types', values)
        notification.success({
          message: 'Saved',
          description: 'Scholarship type created successfully',
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
        open={modalOpen}
        width={720}
        title="MANAGE SCHOLAR TYPES"
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
              scholarship: null,
              target_beneficiary: null,
              benefit: null,
              is_active: false
            }}
          >
            {dom}
          </Form>
        )}
      >
        <div className="flex flex-col">

          <div className='border-t-2 border-b-2 border-blue-600 py-4 px-2'>

            <Form.Item name="scholarship"
              label="Scholarship/Program"
              className='w-full'
              validateStatus={errors.scholarship ? 'error' : ''}
              help={errors.scholarship?.[0] as string}
            >
              <Input
                tabIndex={1}
                prefix={<GraduationCap size={15}  />}
                placeholder='Scholarship'
              />
            </Form.Item>

            <Form.Item name="target_beneficiary"
              label="Target Beneficiary"
              className='w-full'
              validateStatus={errors.target_beneficiary ? 'error' : ''}
              help={errors.target_beneficiary?.[0] as string}>
              <TextArea
                rows={3}
                tabIndex={5}
                placeholder='Target Beneficiary'/>
            </Form.Item>

            <Form.Item name="benefit"
              label="Benefit"
              className='w-full'
              validateStatus={errors.benefit ? 'error' : ''}
              help={errors.benefit?.[0] as string}>
              <TextArea
                rows={3}
                tabIndex={5}
                placeholder='Benefit'/>
            </Form.Item>

            <Form.Item name="amount"
              label="Amount"
              className='w-full'
              validateStatus={errors.amount ? 'error' : ''}
              help={errors.amount?.[0] as string}>
              <InputNumber
                className='w-full'
                prefix={<PhilippinePeso size={15} />}
                tabIndex={5}
                placeholder='10000'/>
            </Form.Item>

            <Form.Item
              name="is_active"
              valuePropName="checked"
              className="w-full"
              validateStatus={errors.is_active ? "error" : ""}
              help={errors.is_active ? errors.is_active[0] as string : ""}
            >
              <Checkbox>Active</Checkbox>
            </Form.Item>

          </div>

        </div>
      </Modal>
    </>
  )
}

export default ModalCreateEditScholarshipType
