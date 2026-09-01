// Components
import { Head, useForm } from '@inertiajs/react';
import { Button, Input } from 'antd';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';

export default function ForgotPassword({ status }: { status?: string }) {
  const { data, setData, post, processing, errors } = useForm({
    email: '',
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();

    post(route('password.email'));
  };

  return (
    <>
     <Head title="Forgot password" />
      <div className='min-h-screen flex items-center justify-center '>
        <div className='bg-white p-6 border shadow-lg w-xl rounded-2xl'>
          {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}

          <div>
            <img src='/images/e-kabataan.png' height={100} width={100} className='block mx-auto' />
          </div>
          <div className='font-bold text-2xl my-4 text-center'>
            Change Password
          </div>
          <div className="space-y-6">
            <form onSubmit={submit}>
              <div className="grid gap-2">
                <label htmlFor="email" className="text-sm font-medium">Email address</label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="off"
                  value={data.email}
                  autoFocus
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="email@example.com"
                />

                <InputError message={errors.email} />
              </div>

              <div className="my-6 flex items-center justify-start">
                <Button htmlType="submit" type="primary" loading={processing} className="w-full" disabled={processing}>
                  Email password reset link
                </Button>
              </div>
            </form>

            <div className="text-muted-foreground space-x-1 text-center text-sm">
              <span>Or, return to</span>
              <TextLink href={route('student-login')}>log in</TextLink>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
