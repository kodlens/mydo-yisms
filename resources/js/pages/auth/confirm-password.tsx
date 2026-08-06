// Components
import { Head, useForm } from '@inertiajs/react';
import { Button, Input } from 'antd';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <form onSubmit={submit}>
                <div className="space-y-6">
                    <div className="grid gap-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <Input.Password
                            id="password"
                            name="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            value={data.password}
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center">
                        <Button htmlType="submit" type="primary" loading={processing} className="w-full" disabled={processing}>
                            Confirm password
                        </Button>
                    </div>
                </div>
            </form>
        </AuthLayout>
    );
}
