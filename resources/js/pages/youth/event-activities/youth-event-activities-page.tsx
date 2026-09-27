import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Modal } from 'antd';
import {
    ArrowDown,
    ArrowRight,
    CalendarDays,
    Clock3,
    Compass,
    GraduationCap,
    HeartHandshake,
    MapPin,
    Search,
    Sparkles,
    Sprout,
    Trophy,
    Users,
} from 'lucide-react';
import { ReactElement, ReactNode, useState } from 'react';

type Activity = {
    id: number;
    title: string;
    category: { id: number; name: string };
    starts_at: string;
    ends_at: string;
    venue_name: string;
    venue_address: string | null;
    summary: string | null;
    description: string;
    requirements: string | null;
    eligibility_notes: string | null;
    is_featured: boolean;
    capacity: number | null;
    participants_count: number;
    has_joined: boolean;
    requires_registration: boolean;
    registration_opens_at: string | null;
    registration_closes_at: string | null;
};

function registrationStatus(activity: Activity) {
    const now = Date.now();
    if (!activity.requires_registration) return 'No registration required';
    if (new Date(activity.starts_at).getTime() <= now) return 'Registration closed';
    if (activity.registration_closes_at && new Date(activity.registration_closes_at).getTime() <= now) return 'Registration closed';
    if (activity.registration_opens_at && new Date(activity.registration_opens_at).getTime() > now) return 'Registration opens soon';
    if (activity.capacity !== null && activity.participants_count >= activity.capacity) return 'Registration full';
    return 'Registration open';
}

function Availability({ activity }: { activity: Activity }) {
    const slotsLeft = activity.capacity === null ? null : Math.max(0, activity.capacity - activity.participants_count);
    return (
        <div className="mt-4 space-y-1 text-xs text-slate-600">
            <p className="font-semibold text-teal-800">{activity.has_joined ? 'You are registered' : registrationStatus(activity)}</p>
            {activity.requires_registration && (
                <>
                    <p>
                        {activity.participants_count}
                        {activity.capacity !== null ? ' / ' + activity.capacity : ''} slots reserved
                    </p>
                    <p>{slotsLeft === null ? 'No participant limit' : slotsLeft + ' slots left'}</p>
                </>
            )}
        </div>
    );
}
function JoinButton({ activity, processing, onJoin }: { activity: Activity; processing: boolean; onJoin: (activity: Activity) => void }) {
    if (!activity.requires_registration) return null;
    const label = activity.has_joined ? 'Registered' : registrationStatus(activity);
    return (
        <button
            type="button"
            disabled={processing || activity.has_joined || label !== 'Registration open'}
            onClick={() => onJoin(activity)}
            className="mt-3 w-full rounded-lg bg-teal-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-600"
        >
            {activity.has_joined ? 'Registered' : processing ? 'Please wait...' : label === 'Registration open' ? 'Join activity' : label}
        </button>
    );
}
const themes = {
    Leadership: { color: 'bg-teal-900 text-teal-100', icon: Users, label: 'LEAD THE CHANGE' },
    Environment: { color: 'bg-[#e2ecda] text-[#39563a]', icon: Sprout, label: 'GROW SOMETHING GOOD' },
    'Skills & learning': { color: 'bg-[#e8e4f5] text-[#62518e]', icon: GraduationCap, label: 'MAKE ROOM TO LEARN' },
    Sports: { color: 'bg-[#fae6cd] text-[#955820]', icon: Trophy, label: 'PLAY. CONNECT. REPEAT.' },
    Community: { color: 'bg-[#dcebf2] text-[#365f79]', icon: HeartHandshake, label: 'TOGETHER, WE DO MORE' },
};
function dateLabel(date: string, options: Intl.DateTimeFormatOptions) {
    return new Date(date).toLocaleString('en-US', { ...options, timeZone: 'Asia/Manila' });
}
function activityTime(activity: Activity) {
    const time = { hour: 'numeric', minute: '2-digit' } as const;
    const sameDay = dateLabel(activity.starts_at, { dateStyle: 'short' }) === dateLabel(activity.ends_at, { dateStyle: 'short' });
    const end = dateLabel(activity.ends_at, sameDay ? time : { ...time, month: 'short', day: 'numeric', year: 'numeric' });
    return dateLabel(activity.starts_at, time) + ' - ' + end;
}
function Artwork({ activity, featured = false }: { activity: Activity; featured?: boolean }) {
    const theme = themes[activity.category.name as keyof typeof themes] ?? themes.Community;
    const Icon = theme.icon;
    return (
        <div aria-hidden="true" className={`relative flex items-end overflow-hidden ${theme.color} ${featured ? 'min-h-72 p-8' : 'h-44 p-5'}`}>
            <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full border-[35px] border-current opacity-[0.07]" />
            <div className="absolute -bottom-20 left-5 h-48 w-48 rounded-full border border-current opacity-20" />
            <Icon className={`absolute right-5 bottom-5 -rotate-12 opacity-20 ${featured ? 'h-40 w-40' : 'h-24 w-24'}`} strokeWidth={1} />
            <div className="relative">
                <Icon size={featured ? 34 : 25} strokeWidth={1.5} />
                <p className={`mt-4 max-w-52 font-black tracking-tight ${featured ? 'text-4xl leading-none' : 'text-xl leading-tight'}`}>
                    {theme.label}
                </p>
                {featured && <p className="mt-5 text-xs tracking-[0.18em]">YOUR VOICE. YOUR COMMUNITY.</p>}
            </div>
        </div>
    );
}
const YouthEventActivitiesPage = ({ activities = [] }: { activities?: Activity[] }) => {
    const [category, setCategory] = useState<string>('All activities');
    const [query, setQuery] = useState('');
    const [sort, setSort] = useState('soonest');
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const selected = activities.find((activity) => activity.id === selectedId) ?? null;
    const { post, processing, errors, clearErrors } = useForm<{ activity?: string }>({});
    const [joinedTitle, setJoinedTitle] = useState('');
    const [modal, contextHolder] = Modal.useModal();
    function joinActivity(activity: Activity) {
        modal.confirm({
            centered: true,
            title: 'Join this activity?',
            content: `You will be registered for "${activity.title}" using your youth profile.`,
            okText: 'Yes, join activity',
            cancelText: 'Cancel',
            onOk: () => {
                clearErrors();
                setJoinedTitle('');
                return new Promise<void>((resolve) => {
                    post(route('youth.youth-services.events-activities.join', activity.id), {
                        preserveScroll: true,
                        onSuccess: () => setJoinedTitle(activity.title),
                        onFinish: () => resolve(),
                    });
                });
            },
        });
    }
    const feedback = (
        <>
            {errors.activity && (
                <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                    {errors.activity}
                </p>
            )}
            {joinedTitle && (
                <p role="status" className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">
                    You are registered for {joinedTitle}.
                </p>
            )}
        </>
    );
    const categories = ['All activities', ...new Set(activities.map((activity) => activity.category.name))];
    const ordered = [...activities].sort((a, b) => a.starts_at.localeCompare(b.starts_at));
    const featured = ordered.find((activity) => activity.is_featured) ?? ordered[0];
    const filtered = ordered.filter(
        (item) =>
            (category === 'All activities' || item.category.name === category) &&
            `${item.title} ${item.category.name} ${item.venue_name}`.toLowerCase().includes(query.trim().toLowerCase()),
    );
    if (sort === 'latest') filtered.reverse();
    return (
        <>
            <Head title="Events & Activities" />
            {contextHolder}
            <div className="mx-auto max-w-7xl space-y-8 text-slate-800">
                <header className="flex flex-wrap items-end justify-between gap-5">
                    <div>
                        <p className="mb-2 flex items-center gap-2 text-xs font-bold tracking-[0.18em] text-teal-700">
                            <Compass size={16} /> YOUR NEXT EXPERIENCE
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Get involved. Be inspired.</h1>
                        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                            Discover activities, learn something new, and make a difference with your fellow youth.
                        </p>
                    </div>
                    <a
                        href="#activities"
                        className="inline-flex items-center gap-2 rounded-xl bg-teal-800 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-900"
                    >
                        Explore activities <ArrowDown size={16} />
                    </a>
                </header>
                {feedback}
                {featured && (
                    <section
                        aria-labelledby="featured-title"
                        className="grid overflow-hidden rounded-2xl border border-white bg-white shadow-sm md:grid-cols-[0.85fr_1.15fr]"
                    >
                        <Artwork activity={featured} featured />
                        <div className="p-6 sm:p-8">
                            <p className="flex items-center gap-2 text-xs font-bold tracking-widest text-teal-700 uppercase">
                                <Sparkles size={15} /> In the spotlight
                            </p>
                            <h2 id="featured-title" className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                {featured.title}
                            </h2>
                            <p className="mt-3 text-sm leading-6 text-slate-500">{featured.summary ?? featured.description}</p>
                            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                                <span className="flex items-center gap-2">
                                    <CalendarDays size={16} className="text-teal-700" />
                                    {dateLabel(featured.starts_at, { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className="flex items-center gap-2">
                                    <MapPin size={16} className="text-teal-700" />
                                    {featured.venue_name}
                                </span>
                            </div>
                            <Availability activity={featured} />
                            <JoinButton activity={featured} processing={processing} onJoin={joinActivity} />
                            <button
                                onClick={() => setSelectedId(featured.id)}
                                className="mt-6 inline-flex items-center gap-3 rounded-lg bg-teal-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-900"
                            >
                                View activity <ArrowRight size={16} />
                            </button>
                        </div>
                    </section>
                )}
                <section id="activities" aria-labelledby="activities-title" className="scroll-mt-5">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div>
                            <h2 id="activities-title" className="text-xl font-bold text-slate-950">
                                Find your next activity
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">A little curiosity can take you somewhere new.</p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search aria-hidden="true" size={17} className="absolute top-3.5 left-3.5 text-slate-400" />
                            <input
                                type="search"
                                aria-label="Search activities"
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search activities or venues..."
                                className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
                            />
                        </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-2" aria-label="Activity categories">
                        {categories.map((item) => (
                            <button
                                key={item}
                                aria-pressed={category === item}
                                onClick={() => setCategory(item)}
                                className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${category === item ? 'border-teal-800 bg-teal-800 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-teal-600 hover:text-teal-800'}`}
                            >
                                {item}
                            </button>
                        ))}
                    </div>
                    <div className="my-5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                        <p role="status">
                            {filtered.length} {filtered.length === 1 ? 'activity' : 'activities'} to explore
                        </p>
                        <label className="flex items-center gap-2">
                            Sort by
                            <select
                                value={sort}
                                onChange={(event) => setSort(event.target.value)}
                                className="rounded-lg border border-slate-200 bg-white px-2 py-2 font-medium text-slate-700"
                            >
                                <option value="soonest">Soonest first</option>
                                <option value="latest">Latest date first</option>
                            </select>
                        </label>
                    </div>
                    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {filtered.map((activity) => (
                            <article
                                key={activity.id}
                                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md motion-reduce:transform-none motion-reduce:transition-none"
                            >
                                <Artwork activity={activity} />
                                <div className="flex flex-1 flex-col p-5">
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <p className="text-[11px] font-bold tracking-wider text-teal-700 uppercase">{activity.category.name}</p>
                                            <h3 className="mt-2 text-lg leading-6 font-bold text-slate-900">{activity.title}</h3>
                                        </div>
                                        <div className="min-w-12 rounded-lg bg-slate-50 px-2 py-1.5 text-center">
                                            <p className="text-[10px] font-bold text-teal-700 uppercase">
                                                {dateLabel(activity.starts_at, { month: 'short' })}
                                            </p>
                                            <p className="text-xl font-bold">{dateLabel(activity.starts_at, { day: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{activity.summary ?? activity.description}</p>
                                    <div className="mt-4 space-y-2 text-xs text-slate-500">
                                        <p className="flex items-center gap-2">
                                            <Clock3 size={14} className="shrink-0" />
                                            {activityTime(activity)}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <MapPin size={14} className="shrink-0" />
                                            {activity.venue_name}
                                        </p>
                                    </div>
                                    <Availability activity={activity} />
                                    <JoinButton activity={activity} processing={processing} onJoin={joinActivity} />
                                    <div className="mt-auto pt-5">
                                        <button
                                            aria-label={`View details for ${activity.title}`}
                                            onClick={() => setSelectedId(activity.id)}
                                            className="flex w-full items-center justify-between border-t border-slate-100 pt-4 text-sm font-semibold text-teal-800 hover:text-teal-600"
                                        >
                                            View details <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                    {filtered.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                            <Search className="mx-auto text-teal-700" size={30} />
                            <h3 className="mt-4 text-lg font-semibold">
                                {activities.length ? 'No matching activities' : 'Good things are on the way'}
                            </h3>
                            <p className="mt-2 text-sm text-slate-500">
                                {activities.length
                                    ? 'Try another keyword or explore a different category.'
                                    : 'Check back here for new activities from the youth office.'}
                            </p>
                            {activities.length > 0 && (
                                <button
                                    onClick={() => {
                                        setQuery('');
                                        setCategory('All activities');
                                    }}
                                    className="mt-4 text-sm font-semibold text-teal-700 underline"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </section>
                <aside className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-teal-900/10 bg-teal-50 p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-xl bg-white p-3 text-teal-700">
                            <HeartHandshake size={26} />
                        </div>
                        <div>
                            <h2 className="font-bold text-teal-950">Your next chapter starts with you.</h2>
                            <p className="mt-1 text-sm text-teal-800/80">Keep your youth profile up to date for future activity applications.</p>
                        </div>
                    </div>
                    <Link
                        href={route('youth.youth-my-profile.index')}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:underline"
                    >
                        View my profile <ArrowRight size={16} />
                    </Link>
                </aside>
            </div>
            <Modal centered open={selected !== null} onCancel={() => setSelectedId(null)} footer={null} title="Activity details" width={620}>
                {selected && (
                    <div className="space-y-5 py-3">
                        <Artwork activity={selected} />
                        <div>
                            <p className="text-xs font-semibold tracking-wider text-teal-700 uppercase">{selected.category.name}</p>
                            <h2 className="mt-2 text-2xl font-bold text-slate-900">{selected.title}</h2>
                            <p className="mt-3 leading-6 whitespace-pre-line text-slate-600">{selected.description}</p>
                        </div>
                        <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                            <p className="flex items-center gap-2">
                                <CalendarDays size={16} />
                                {dateLabel(selected.starts_at, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </p>
                            <p className="flex items-center gap-2">
                                <Clock3 size={16} />
                                {activityTime(selected)}
                            </p>
                            <p className="flex items-center gap-2">
                                <MapPin size={16} />
                                {selected.venue_name}
                            </p>
                        </div>
                        <Availability activity={selected} />
                        {selected.venue_address && <p className="text-sm text-slate-600">{selected.venue_address}</p>}
                        {selected.eligibility_notes && (
                            <div>
                                <h3 className="font-semibold">Who can join</h3>
                                <p className="whitespace-pre-line text-slate-600">{selected.eligibility_notes}</p>
                            </div>
                        )}
                        {selected.requirements && (
                            <div>
                                <h3 className="font-semibold">What to bring</h3>
                                <p className="whitespace-pre-line text-slate-600">{selected.requirements}</p>
                            </div>
                        )}
                        {feedback}
                        <JoinButton activity={selected} processing={processing} onJoin={joinActivity} />
                        {!selected.requires_registration && <p className="text-sm text-slate-600">No registration is required for this activity.</p>}
                    </div>
                )}
            </Modal>
        </>
    );
};
YouthEventActivitiesPage.layout = (page: ReactNode) => (
    <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user} header="Events & Activities">
        {page}
    </YouthAuthLayout>
);
export default YouthEventActivitiesPage;
