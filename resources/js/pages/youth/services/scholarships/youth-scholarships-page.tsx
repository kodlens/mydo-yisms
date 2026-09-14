import YouthAuthLayout from '@/layouts/youth-auth-layout';
import { SharedData } from '@/types';
import { ScholarshipType } from '@/types/scholarship';
import { Head } from '@inertiajs/react';
import { Alert, Button, Empty, Input, Modal, Pagination, Skeleton } from 'antd';
import axios from 'axios';
import { ArrowRight, Gift, GraduationCap, Search, Users, Wallet } from 'lucide-react';
import { ReactElement, ReactNode, useEffect, useState } from 'react';

type Scholarship = ScholarshipType & {
    target_beneficiary?: string | null;
    benefit?: string | null;
    amount?: string | number | null;
};

type PaginatedResponse = {
    data: Scholarship[];
    current_page: number;
    per_page: number;
    total: number;
};

const formatAmount = (amount: Scholarship['amount']) =>
    amount !== null && amount !== undefined && amount !== '' && Number.isFinite(Number(amount))
        ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(Number(amount))
        : 'Amount not specified';

const YouthScholarshipPage = () => {
    const [data, setData] = useState<PaginatedResponse>();
    const [selected, setSelected] = useState<Scholarship | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [query, setQuery] = useState('');
    const [retry, setRetry] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError(false);

        axios
            .get<PaginatedResponse>('/youth/services/get-youth-scholarships', {
                params: { search: query, perpage: perPage, page },
                signal: controller.signal,
            })
            .then((response) => {
                setData(response.data);
            })
            .catch(() => {
                if (!controller.signal.aborted) setError(true);
            })
            .finally(() => {
                if (!controller.signal.aborted) setLoading(false);
            });

        return () => controller.abort();
    }, [page, perPage, query, retry]);

    const handleSearch = (value: string) => {
        setQuery(value.trim());
        setPage(1);
    };

    const clearSearch = () => {
        setSearch('');
        handleSearch('');
    };

    return (
        <>
            <Head title="Scholarships" />
            <div className="mx-auto flex max-w-7xl flex-col gap-6">
                <header className="flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="mb-2 text-xs font-semibold tracking-widest text-teal-700 uppercase">Youth services / Education</p>
                        <h1 className="text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">Find your scholarship</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-500">
                            A little support can take you further. Explore programs built to help you continue your education.
                        </p>
                    </div>
                    <div
                        aria-hidden="true"
                        className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-teal-100 bg-teal-50 text-teal-700 sm:flex"
                    >
                        <GraduationCap size={40} strokeWidth={1.5} />
                    </div>
                </header>
                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">
                    <section aria-labelledby="scholarship-list-heading">
                        <div className="mb-5 rounded-2xl border border-stone-200 bg-white p-4 sm:p-5">
                            <label htmlFor="scholarship-search" className="mb-2 block text-sm font-semibold text-stone-800">
                                Which scholarship are you looking for?
                            </label>
                            <Input.Search
                                id="scholarship-search"
                                placeholder="Search by scholarship name"
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                onSearch={handleSearch}
                                onClear={clearSearch}
                                allowClear
                                size="large"
                                enterButton={
                                    <span className="inline-flex items-center gap-2">
                                        <Search size={16} aria-hidden="true" />
                                        Search
                                    </span>
                                }
                            />
                        </div>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <h2 id="scholarship-list-heading" className="text-base font-semibold text-stone-900">
                                Available scholarships
                            </h2>
                            <p className="text-xs text-stone-500" role="status">
                                {loading ? (
                                    'Finding scholarships...'
                                ) : error ? (
                                    'Unable to load results'
                                ) : (
                                    <>
                                        {data?.total ?? 0} programs {query ? <>matching &quot;{query}&quot;</> : 'to explore'}
                                    </>
                                )}
                            </p>
                        </div>
                        {error ? (
                            <Alert
                                type="error"
                                showIcon
                                title="Unable to load scholarships"
                                description="Please try again to see the available programs."
                                action={<Button onClick={() => setRetry((value) => value + 1)}>Try again</Button>}
                            />
                        ) : loading ? (
                            <div aria-label="Loading scholarships" aria-busy="true" className="grid gap-4">
                                {[0, 1, 2].map((key) => (
                                    <div key={key} className="rounded-2xl border border-stone-200 bg-white p-6">
                                        <Skeleton active paragraph={{ rows: 3 }} />
                                    </div>
                                ))}
                            </div>
                        ) : !data?.data.length ? (
                            <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-12">
                                <Empty
                                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                                    description={
                                        <div>
                                            <p className="font-semibold text-stone-800">
                                                {query ? 'No matching scholarships' : 'No scholarships available yet'}
                                            </p>
                                            <p className="mt-2 text-sm text-stone-500">
                                                {query
                                                    ? 'Try another name or clear your search to explore all programs.'
                                                    : 'Check back later for new scholarship opportunities.'}
                                            </p>
                                        </div>
                                    }
                                >
                                    {query && <Button onClick={clearSearch}>Clear search</Button>}
                                </Empty>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {data.data.map((scholarship) => (
                                    <article
                                        key={scholarship.id}
                                        className="grid min-w-0 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-colors focus-within:border-teal-500 hover:border-teal-300 md:grid-cols-[minmax(0,1fr)_220px]"
                                    >
                                        <div className="min-w-0 p-5 sm:p-6">
                                            <div className="mb-4 flex items-center gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                                    <GraduationCap size={22} aria-hidden="true" />
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" aria-hidden="true" />
                                                    Available scholarship
                                                </span>
                                            </div>
                                            <h3 className="text-xl leading-7 font-semibold break-words text-stone-900">{scholarship.scholarship}</h3>
                                            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                                                <div className="min-w-0">
                                                    <dt className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                                                        <Users size={14} aria-hidden="true" />
                                                        Who this is for
                                                    </dt>
                                                    <dd className="mt-2 line-clamp-3 text-sm leading-6 break-words text-stone-500">
                                                        {scholarship.target_beneficiary || 'Beneficiary details not specified.'}
                                                    </dd>
                                                </div>
                                                <div className="min-w-0">
                                                    <dt className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                                                        <Gift size={14} aria-hidden="true" />
                                                        What it covers
                                                    </dt>
                                                    <dd className="mt-2 line-clamp-3 text-sm leading-6 break-words text-stone-500">
                                                        {scholarship.benefit || 'Benefit details not specified.'}
                                                    </dd>
                                                </div>
                                            </dl>
                                        </div>
                                        <div className="flex min-w-0 flex-col justify-between gap-6 border-t border-stone-100 bg-stone-50/80 p-5 sm:p-6 md:border-t-0 md:border-l">
                                            <div>
                                                <p className="flex items-center gap-2 text-xs font-medium text-stone-500">
                                                    <Wallet size={14} aria-hidden="true" />
                                                    Financial support
                                                </p>
                                                <p className="mt-2 text-2xl font-semibold break-words text-teal-950 tabular-nums">
                                                    {formatAmount(scholarship.amount)}
                                                </p>
                                            </div>
                                            <Button
                                                type="primary"
                                                size="large"
                                                block
                                                onClick={() => setSelected(scholarship)}
                                                aria-label={'View details and apply for ' + scholarship.scholarship}
                                            >
                                                <span className="inline-flex items-center gap-2">
                                                    View & apply <ArrowRight size={16} aria-hidden="true" />
                                                </span>
                                            </Button>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}

                        {!loading && !error && !!data?.total && (
                            <div className="mt-6 flex justify-end border-t border-stone-200 pt-5">
                                <Pagination
                                    current={data.current_page}
                                    pageSize={Number(data.per_page)}
                                    total={data.total}
                                    onChange={(nextPage, nextPerPage) => {
                                        setPage(nextPerPage !== perPage ? 1 : nextPage);
                                        setPerPage(nextPerPage);
                                    }}
                                    showSizeChanger
                                    responsive
                                    showTotal={(total, range) => range[0] + '-' + range[1] + ' of ' + total + ' scholarships'}
                                />
                            </div>
                        )}
                    </section>
                    <aside aria-label="Scholarship guidance" className="space-y-4 xl:sticky xl:top-6">
                        <div className="overflow-hidden rounded-2xl bg-teal-950 p-6 text-white">
                            <span className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-teal-200">
                                <GraduationCap size={23} aria-hidden="true" />
                            </span>
                            <h2 className="text-lg font-semibold">Your next step starts here.</h2>
                            <p className="mt-2 text-sm leading-6 text-teal-100">Take a moment to find the support that fits your goals.</p>
                            <ol className="mt-6 space-y-5">
                                {[
                                    ['Explore', 'Compare available scholarship programs.'],
                                    ['Review', 'Check who the program supports and what it covers.'],
                                    ['Choose', 'Open a scholarship to review the full details before applying.'],
                                ].map(([title, description], index) => (
                                    <li key={title} className="flex gap-3">
                                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-teal-700 text-xs font-medium text-teal-200">
                                            {index + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium">{title}</p>
                                            <p className="mt-1 text-xs leading-5 text-teal-100">{description}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="rounded-2xl border border-stone-200 bg-white p-5">
                            <h2 className="text-sm font-semibold text-stone-900">Before you apply</h2>
                            <p className="mt-2 text-xs leading-6 text-stone-500">
                                Read the beneficiary details carefully. Each scholarship may support a different group of students.
                            </p>
                        </div>
                    </aside>
                </div>
            </div>

            <Modal
                open={!!selected}
                onCancel={() => setSelected(null)}
                title="Scholarship details"
                footer={<Button onClick={() => setSelected(null)}>Back to scholarships</Button>}
                width={600}
            >
                {selected && (
                    <div className="pt-3">
                        <h2 className="text-xl font-semibold break-words text-stone-900">{selected.scholarship}</h2>
                        <div className="my-5 rounded-xl bg-teal-50 p-4">
                            <p className="text-xs font-medium text-teal-800">Financial support</p>
                            <p className="mt-1 text-2xl font-semibold text-teal-950">{formatAmount(selected.amount)}</p>
                        </div>
                        <dl className="mb-6 space-y-5">
                            <div>
                                <dt className="font-semibold text-stone-900">Who this is for</dt>
                                <dd className="mt-1 leading-6 break-words whitespace-pre-wrap text-stone-600">
                                    {selected.target_beneficiary || 'Beneficiary details not specified.'}
                                </dd>
                            </div>
                            <div>
                                <dt className="font-semibold text-stone-900">What it covers</dt>
                                <dd className="mt-1 leading-6 break-words whitespace-pre-wrap text-stone-600">
                                    {selected.benefit || 'Benefit details not specified.'}
                                </dd>
                            </div>
                        </dl>
                        <Alert
                            type="info"
                            showIcon
                            title="Online applications are not available yet"
                            description="You can review this scholarship now. No application has been submitted."
                        />
                    </div>
                )}
            </Modal>
        </>
    );
};

YouthScholarshipPage.layout = (page: ReactNode) => (
    <YouthAuthLayout user={(page as ReactElement<SharedData>).props.auth.user}>{page}</YouthAuthLayout>
);

export default YouthScholarshipPage;
