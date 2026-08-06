import { Head, useForm } from '@inertiajs/react';
import { Button, Input } from 'antd';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import AuthLayout from '@/layouts/auth-layout';

interface ResetPasswordProps {
    token: string;
    email: string;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email }: ResetPasswordProps) {
    const { data, setData, post, processing, errors, reset } = useForm<ResetPasswordForm>({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthLayout title="Reset password" description="Please enter your new password below">
            <Head title="Reset password" />

            <form onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            readOnly
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="password" className="text-sm font-medium">Password</label>
                        <Input.Password
                            id="password"
                            name="password"
                            autoComplete="new-password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoFocus
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <label htmlFor="password_confirmation" className="text-sm font-medium">Confirm password</label>
                        <Input.Password
                            id="password_confirmation"
                            name="password_confirmation"
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} className="mt-2" />
                    </div>

                    <Button htmlType="submit" type="primary" loading={processing} className="mt-4 w-full" disabled={processing}>
                        Reset password
                    </Button>
                </div>
            </form>
        </AuthLayout>
    );
}
