import { useForm } from '@inertiajs/react';
import { Button, Input, Modal, type InputRef } from 'antd';
import { FormEventHandler, useRef, useState } from 'react';

// Components...
import InputError from '@/components/input-error';

import HeadingSmall from '@/components/heading-small';

export default function DeleteUser() {
    const [open, setOpen] = useState(false);
    const passwordInput = useRef<InputRef>(null);
    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({ password: '' });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setOpen(false);
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Delete account" description="Delete your account and all of its resources" />
            <div className="space-y-4 rounded-lg border border-red-100 bg-red-50 p-4 dark:border-red-200/10 dark:bg-red-700/10">
                <div className="relative space-y-0.5 text-red-600 dark:text-red-100">
                    <p className="font-medium">Warning</p>
                    <p className="text-sm">Please proceed with caution, this cannot be undone.</p>
                </div>

                <Button danger type="primary" onClick={() => setOpen(true)}>
                    Delete account
                </Button>
                <Modal
                    title="Are you sure you want to delete your account?"
                    open={open}
                    onCancel={closeModal}
                    footer={null}
                    destroyOnHidden
                >
                    <p className="mb-6 text-sm text-slate-600">
                        Once your account is deleted, all of its resources and data will also be permanently deleted. Please enter your password
                        to confirm you would like to permanently delete your account.
                    </p>
                        <form className="space-y-6" onSubmit={deleteUser}>
                            <div className="grid gap-2">
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>

                                <Input.Password
                                    id="password"
                                    name="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Password"
                                    autoComplete="current-password"
                                />

                                <InputError message={errors.password} />
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button onClick={closeModal}>Cancel</Button>
                                <Button danger htmlType="submit" loading={processing} type="primary" disabled={processing}>
                                    Delete account
                                </Button>
                            </div>
                        </form>
                </Modal>
            </div>
        </div>
    );
}
