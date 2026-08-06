import FormSection from '@/components/form-section'
import { Form, Upload } from 'antd'
import { FileText, UploadCloud } from 'lucide-react'


type Props = {
  errors: Record<string, unknown[]>;
}

const UploadDocument = ( { errors } : Props  ) => {
  return (
    <>

      <FormSection icon={FileText} title="Document Uploads">
        <div className="grid gap-4 md:grid-cols-2">
          <Form.Item label="Certificate of Registration"
            name="cor"
            validateStatus={errors.cor ? "error" : ""}
            help={errors.cor ? errors.cor[0] as string : ""}>
            <Upload.Dragger beforeUpload={() => false} maxCount={1} accept=".pdf,.jpg,.jpeg,.png">
              <div className="flex flex-col items-center py-5 text-center">
                <UploadCloud className="mb-3 h-8 w-8 text-emerald-700" />
                <p className="text-sm font-semibold text-slate-800">Upload Certificate of Registration</p>
                <p className="mt-1 text-xs text-slate-500">PDF, JPG, or PNG only</p>
              </div>
            </Upload.Dragger>
          </Form.Item>

          <Form.Item label="PSA Birth Certificate"
            name="psa"
            validateStatus={errors.psa ? "error" : ""}
            help={errors.psa ? errors.psa[0] as string : ""}>
            <Upload.Dragger beforeUpload={() => false} maxCount={1} accept=".pdf,.jpg,.jpeg,.png">
              <div className="flex flex-col items-center py-5 text-center">
                <UploadCloud className="mb-3 h-8 w-8 text-emerald-700" />
                <p className="text-sm font-semibold text-slate-800">Upload PSA Birth Certificate</p>
                <p className="mt-1 text-xs text-slate-500">PDF, JPG, or PNG only</p>
              </div>
            </Upload.Dragger>
          </Form.Item>
        </div>
      </FormSection>

    </>
  )
}

export default UploadDocument
