import { Button, Form, Input } from 'antd';
import { ArrowRight, CheckCircle2, Hash, Keyboard } from 'lucide-react';
import { useState } from 'react';

type Props = {
  onSubmit: (code: string, remarks?: string) => void;
  loading?: boolean;
};

export default function ManualCodeEntry({ onSubmit, loading = false }: Props) {
  const [form] = Form.useForm();
  const [code, setCode] = useState('');

  const handleFinish = (values: { reference_code: string; remarks?: string }) => {
    const cleanCode = values.reference_code.trim().toUpperCase();
    if (!cleanCode) return;
    onSubmit(cleanCode, values.remarks);
    form.resetFields();
    setCode('');
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
          <Keyboard className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Manual Code Entry</h3>
          <p className="text-xs text-slate-500">
            Type the 10-character reference code (e.g., YD-XXXX-XXXX) or student ID
          </p>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="mt-4"
        initialValues={{ reference_code: '', remarks: '' }}
      >
        <Form.Item
          name="reference_code"
          label={<span className="text-xs font-bold text-slate-700">Youth Reference Code / ID</span>}
          rules={[{ required: true, message: 'Please enter a reference code or student ID' }]}
          className="mb-3"
        >
          <Input
            size="large"
            placeholder="e.g., YD-7K9A-3M2P"
            prefix={<Hash className="h-4 w-4 text-slate-400 mr-1" />}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            className="!h-11 rounded-lg font-mono text-sm uppercase tracking-wider hover:border-emerald-600 focus:border-emerald-600"
            autoComplete="off"
            autoFocus
          />
        </Form.Item>

        <Form.Item
          name="remarks"
          label={<span className="text-xs font-semibold text-slate-600">Optional Remarks</span>}
          className="mb-4"
        >
          <Input
            placeholder="e.g., Walk-in participant, verified via student card"
            maxLength={100}
            className="rounded-lg text-xs"
          />
        </Form.Item>

        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          size="large"
          className="flex !h-11 w-full items-center justify-center gap-2 rounded-lg !bg-emerald-700 font-bold !text-white shadow-sm hover:!bg-emerald-800"
        >
          <span>Record Attendance</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Form>
    </div>
  );
}
