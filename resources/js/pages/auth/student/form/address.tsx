import FormSection from '@/components/form-section'
import { Form, Input, Select } from 'antd'
import { BookOpen } from 'lucide-react'
import React from 'react'

type Props = {
  errors: Record<string, unknown[]>;
}
const Address = ( { errors } : Props ) => {


  const yearOptions = [
    { value: '1', label: '1st Year' },
    { value: '2', label: '2nd Year' },
    { value: '3', label: '3rd Year' },
    { value: '4', label: '4th Year' },
  ];


  return (
    <>
      <FormSection icon={BookOpen} title="Educational Information">
        <div className="flex gap-4 md:flex-row md:gap-4 flex-col">
          <div className="w-full">
            <Form.Item
              name="school_name"
              label="School name"
              validateStatus={errors.school_name ? "error" : ""}
              help={errors.school_name ? errors.school_name[0] as string : ""}
            >
              <Input placeholder="Name of school" />
            </Form.Item>
          </div>

          <div className="w-full">
            <Form.Item
              name="program"
              label="Program"
              validateStatus={errors.program ? "error" : ""}
              help={errors.program ? errors.program[0] as string : ""}
            >
              <Input placeholder="Bachelor of Science in Information Technology" />
            </Form.Item>
          </div>

          <div>
            <Form.Item
              name="year"
              label="Year"
              validateStatus={errors.year ? "error" : ""}
              help={errors.year ? errors.year[0] as string : ""}
            >
              <Select allowClear options={yearOptions} placeholder="Select year level" />
            </Form.Item>
          </div>
        </div>
      </FormSection>
    </>
  )
}

export default Address
