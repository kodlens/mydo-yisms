import FormSection from '@/components/form-section'
import { Form, Upload } from 'antd'
import { FileText, UploadCloud } from 'lucide-react'


type Props = {
  errors: Record<string, unknown[]>;
}

const documents = [
  {
    name: 'coe',
    label: 'Certification of Enrolment (COE)',
    uploadText: 'Upload Certification of Enrolment',
  },
  {
    name: 'cog',
    label: 'Certification of Grades (COG)',
    uploadText: 'Upload Certification of Grades',
  },
  {
    name: 'cedula',
    label: 'Cedula',
    uploadText: 'Upload Cedula',
  },
  {
    name: 'school_id',
    label: 'School ID',
    uploadText: 'Upload School ID',
  },
  {
    name: 'psa',
    label: 'PSA Birth Certificate',
    uploadText: 'Upload PSA Birth Certificate',
  },
];

const UploadDocument = ( { errors } : Props  ) => {
  return (
    <>

      <FormSection icon={FileText} title="Document Uploads">
        <div className="grid gap-4 md:grid-cols-2">
          {documents.map((document) => (
            <Form.Item
              key={document.name}
              label={document.label}
              name={document.name}
              validateStatus={errors[document.name] ? "error" : ""}
              help={errors[document.name] ? errors[document.name][0] as string : ""}
            >
              <Upload.Dragger beforeUpload={() => false} maxCount={1} accept=".pdf,.jpg,.jpeg,.png">
                <div className="flex flex-col items-center py-5 text-center">
                  <UploadCloud className="mb-3 h-8 w-8 text-emerald-700" />
                  <p className="text-sm font-semibold text-slate-800">{document.uploadText}</p>
                  <p className="mt-1 text-xs text-slate-500">PDF, JPG, or PNG only</p>
                </div>
              </Upload.Dragger>
            </Form.Item>
          ))}
        </div>
      </FormSection>

    </>
  )
}

export default UploadDocument
