import FormSection from '@/components/form-section'
import { App, Form, Upload, UploadProps } from 'antd'
import axios from 'axios';
import { FileText, UploadCloud } from 'lucide-react'
import { useState } from 'react';


type Props = {
  errors: Record<string, unknown[]>;
  xToken: string
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

const UploadDocument = ( { errors, xToken } : Props  ) => {

  const { notification } = App.useApp();
  const [ uploadErrors, setUploadErrors] = useState<Record<string, unknown[]>>({});

  const uploadProps: UploadProps = {
    name: "upload",
    action: "/temp-upload",
    headers: {
      "X-CSRF-TOKEN": xToken,
    },
    beforeUpload: (file) => {
      const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg'];
      const isAllowedType = allowedTypes.includes(file.type);
      const isUnder5MB = file.size / 1024 / 1024 <= 5;

      if (!isAllowedType) {
        notification.error({
          title: `${file.name} is not a valid file type`,
          placement: "topRight",
          description: `Please upload a PDF, JPG, JPEG, or PNG file.`,
        });
      }

      if (!isUnder5MB) {
        notification.error({
          title: `${file.name} is too large`,
          placement: "topRight",
          description: `Please upload a file not greater than 5MB.`,
        });
      }

      return (isAllowedType && isUnder5MB) || Upload.LIST_IGNORE;
    },

    onChange(info) {
      setUploadErrors({})

      if (info.file.status === "done") {
        notification.success(
          {
            title: 'File uploaded successfully',
            description: `${info.file.name} uploaded successfully`,
            placement: "topRight",
          }
        );
        //console.log(info.file.response.path);
        //form.setFieldValue("thumbnail", info.file.response);
      } else if (info.file.status === "error") {
        if (info.file.error.status === 422) {
          notification.error({
            title: `${info.file.name} file upload failed.`,
            placement: "topRight",
          });
          setUploadErrors(info.file.response.errors);
        } else {
          notification.error({
            title: `${info.file.name} file upload failed.`,
            placement: "topRight",
          });
        }
      }
    },
    onRemove(info) {
      axios
        .post("/temp-remove/" + info.response.filename)
        .then((res) => {
          if (res.data.status === "temp_deleted") {
            notification.success({
              message: `File removed successfully`,
            });
          }
        });
    },
  };


  console.log('token', xToken);


  return (
    <>

      <FormSection icon={FileText} title="Document Uploads">
        <div className="grid gap-4 md:grid-cols-2">
          {/* { documents.map((document) => (
            <Form.Item
              key={document.name}
              label={document.label}
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
          ))} */}

          <Form.Item
            name="coe"
            valuePropName="fileList"
            className="w-full"
            label="Upload thumbnail"
            getValueFromEvent={(e) => {
              // Normalize the value to fit what the Upload component expects
              if (Array.isArray(e)) {
                return e;
              }
              return e?.fileList;
            }}
            validateStatus={errors.upload ? "error" : ""}
            help={errors.upload ? errors.upload[0] as string : ""}
          >
            <Upload.Dragger
              maxCount={1} accept=".pdf,.jpg,.jpeg,.png"
              {...uploadProps}>
                <div className="flex flex-col items-center py-5 text-center">
                  <UploadCloud className="mb-3 h-8 w-8 text-emerald-700" />
                  <p className="text-sm font-semibold text-slate-800">{"Certificate of Enrolment"}</p>
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
