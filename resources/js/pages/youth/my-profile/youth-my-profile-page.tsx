import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData, Youth } from '@/types';
import { Head } from '@inertiajs/react';
import { GraduationCap, Mail, MapPin, Phone, UserRound, Users, type LucideIcon } from 'lucide-react';
import { type ReactElement, type ReactNode } from 'react';

type Profile = Youth & { suffix?: string | null; school_address?: string | null; student_id?: string | null };

function display(value: unknown): string {
    if (typeof value === 'string') return value.trim();
    return typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

function formatDate(value?: string | null): string {
    if (!value) return '';
    // Preserve the stored calendar date across browser timezones.
    const date = new Date(value.slice(0, 10) + 'T00:00:00Z');
    return Number.isNaN(date.getTime())
        ? ''
        : new Intl.DateTimeFormat('en-PH', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
              timeZone: 'UTC',
          }).format(date);
}

function formatNumber(value: string | number | null | undefined, currency = false): string {
    if (!display(value) || !Number.isFinite(Number(value))) return '';
    return new Intl.NumberFormat(
        'en-PH',
        currency ? { style: 'currency', currency: 'PHP' } : { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    ).format(Number(value));
}

function Detail({ label, value }: { label: string; value: unknown }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1.5 text-sm leading-6 font-medium break-words text-slate-900">
                {display(value) || <span className="font-normal text-slate-500">Not provided</span>}
            </dd>
        </div>
    );
}

function ProfileSection({
    id,
    icon: Icon,
    title,
    description,
    children,
}: {
    id: string;
    icon: LucideIcon;
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <section aria-labelledby={id} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-5 sm:px-6">
                <span className="rounded-xl bg-teal-50 p-2.5 text-teal-700">
                    <Icon aria-hidden="true" size={20} />
                </span>
                <div>
                    <h2 id={id} className="font-semibold text-slate-950">
                        {title}
                    </h2>
                    <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
                </div>
            </div>
            <dl className="grid grid-cols-1 gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6">{children}</dl>
        </section>
    );
}

const YouthMyProfilePage = ({ youth }: { youth: Profile }) => {
    const fullName = [youth.fname, youth.mname, youth.lname, youth.suffix].map(display).filter(Boolean).join(' ');
    const initials = [youth.fname, youth.lname]
        .map((name) => display(name).charAt(0))
        .join('')
        .toUpperCase();
    const location = [youth.barangay?.brgyDesc, youth.city?.citymunDesc, youth.province?.provDesc].map(display).filter(Boolean).join(', ');
    const status = youth.is_active === true ? 'Active account' : youth.is_active === false ? 'Inactive account' : null;
    const updatedAt = formatDate(youth.updated_at);

    return (
        <>
            <Head title="My Profile" />
            <div className="mx-auto max-w-6xl space-y-6">
                <div>
                    <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase">Youth portal</p>
                    <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">My profile</h1>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Your personal details on record with MYDO.</p>
                </div>
                <section aria-label="Profile overview" className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="h-2 bg-gradient-to-r from-teal-600 via-cyan-600 to-sky-800" />
                    <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-7">
                        <div
                            aria-hidden="true"
                            className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-teal-50 text-2xl font-semibold text-teal-800 ring-1 ring-teal-100"
                        >
                            {initials || <UserRound size={30} />}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-3">
                                <h2 className="text-xl font-semibold break-words text-slate-950 sm:text-2xl">{fullName || 'Youth profile'}</h2>
                                {status && (
                                    <span
                                        className={
                                            'rounded-full px-2.5 py-1 text-xs font-medium ' +
                                            (youth.is_active ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600')
                                        }
                                    >
                                        {status}
                                    </span>
                                )}
                            </div>
                            <div className="mt-3 flex flex-col gap-x-5 gap-y-2 text-sm text-slate-600 sm:flex-row sm:flex-wrap">
                                <span className="flex min-w-0 items-start gap-2">
                                    <Mail size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-700" />
                                    <span className="break-all">{display(youth.email) || 'Email not provided'}</span>
                                </span>
                                <span className="flex items-start gap-2">
                                    <Phone size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-teal-700" />
                                    {display(youth.mobile_number) || 'Mobile number not provided'}
                                </span>
                            </div>
                            { location && (
                                <p className="mt-2 flex items-start gap-2 text-sm leading-6 text-slate-600">
                                    <MapPin size={16} aria-hidden="true" className="mt-1 shrink-0 text-teal-700" />
                                    <span className="break-words">{location}</span>
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs leading-5 text-slate-500 sm:px-7">
                        Viewing your saved profile{updatedAt ? ' · Last updated ' + updatedAt : ''}
                    </div>
                </section>
                <div className="grid items-start gap-6 lg:grid-cols-2">
                    <ProfileSection id="personal" icon={UserRound} title="Personal information" description="Your name and personal details.">
                        <Detail label="First name" value={youth.fname} />
                        <Detail label="Last name" value={youth.lname} />
                        <Detail label="Middle name" value={youth.mname} />
                        <Detail label="Suffix" value={youth.suffix} />
                        <Detail label="Date of birth" value={formatDate(youth.birth_date)} />
                        <Detail label="Sex" value={youth.sex} />
                        <Detail label="Civil status" value={youth.civil_status} />
                    </ProfileSection>
                    <ProfileSection id="address" icon={MapPin} title="Residential address" description="Your recorded home address.">
                        <Detail label="Province" value={youth.province?.provDesc} />
                        <Detail label="City / municipality" value={youth.city?.citymunDesc} />
                        <Detail label="Barangay" value={youth.barangay?.brgyDesc} />
                        <Detail label="ZIP code" value={youth.zip_code} />
                        <div className="sm:col-span-2">
                            <Detail label="House no. / street / purok" value={youth.street_address} />
                        </div>
                    </ProfileSection>
                    <ProfileSection id="education" icon={GraduationCap} title="Education" description="Your school and academic information.">
                        <div className="sm:col-span-2">
                            <Detail label="School name" value={youth.school_name} />
                        </div>
                        <div className="sm:col-span-2">
                            <Detail label="School address" value={youth.school_address} />
                        </div>
                        <Detail label="Program / course" value={youth.program} />
                        <Detail label="Year level" value={youth.year} />
                        <Detail label="Student ID" value={youth.student_id} />
                        <Detail label="Previous semester GWA" value={formatNumber(youth.previous_semester_gwa)} />
                    </ProfileSection>
                    <ProfileSection id="family" icon={Users} title="Family & guardian" description="Your family and guardian contact details.">
                        <div className="sm:col-span-2">
                            <Detail label="Parent / guardian name" value={youth.guardian_name} />
                        </div>
                        <Detail label="Guardian contact number" value={youth.guardian_contact_number} />
                        <Detail label="Monthly family income" value={formatNumber(youth.monthly_family_income, true)} />
                    </ProfileSection>
                </div>
            </div>
        </>
    );
};

YouthMyProfilePage.layout = (page: ReactNode) => (
    <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user} header="My Profile">
        {page}
    </YouthAuthLayout>
);

export default YouthMyProfilePage;
