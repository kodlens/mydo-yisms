import StaffAuthLayout from '@/layouts/staff-auth-layout';
import { Head, router } from '@inertiajs/react';
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Input,
  Progress,
  Radio,
  Select,
  Table,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Banknote,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  GraduationCap,
  MapPin,
  Printer,
  Search,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { ReactElement, useMemo, useState } from 'react';

type WeeklyFinancial = {
  week_key: string;
  week_number: number;
  year: number;
  period_label: string;
  disbursed_amount: number;
  students_count: number;
  releases_count: number;
  programs_count: number;
  average_per_student: number;
};

type MonthlyFinancial = {
  month_key: string;
  month_name: string;
  year: number;
  month_number: number;
  disbursed_amount: number;
  students_count: number;
  releases_count: number;
  average_per_student: number;
};

type YearlyFinancial = {
  year: number;
  allocated_budget: number;
  disbursed_amount: number;
  remaining_budget: number;
  students_count: number;
  releases_count: number;
  programs_count: number;
  utilization_rate: number;
};

type BarangayItem = {
  barangay_name: string;
  barangay_code: string | null;
  enrolled_students: number;
  approved_students: number;
  rejected_students: number;
  pending_students: number;
  given_students: number;
  disbursed_amount: number;
  pending_releases: number;
  unclaimed_releases: number;
  percentage_of_total_disbursed: number;
};

type EducationalBreakdown = {
  status_name: string;
  enrolled_count: number;
  given_count: number;
  disbursed_amount: number;
};

type SchoolBreakdown = {
  school_name: string;
  enrolled_count: number;
  given_count: number;
  disbursed_amount: number;
};

type SexBreakdown = {
  sex: string;
  enrolled_count: number;
  given_count: number;
  disbursed_amount: number;
};

type ReportData = {
  filters: {
    program_id: string;
    year: string;
  };
  options: {
    programs: Array<{
      id: string;
      code: string;
      title: string;
      funding_year: number;
      allocated_budget: number;
    }>;
    years: number[];
  };
  kpis: {
    total_budget: number;
    total_disbursed: number;
    total_pending_amount: number;
    remaining_budget: number;
    utilization_rate: number;
    total_students_given: number;
    total_students_enrolled: number;
    total_registered_youth: number;
    total_barangays_given: number;
    total_barangays_enrolled: number;
  };
  financial: {
    weekly: WeeklyFinancial[];
    monthly: MonthlyFinancial[];
    yearly: YearlyFinancial[];
  };
  barangays: {
    total_barangays_count: number;
    barangays_given_count: number;
    barangays_pending_count: number;
    items: BarangayItem[];
  };
  students: {
    by_educational_status: EducationalBreakdown[];
    by_school: SchoolBreakdown[];
    by_sex: SexBreakdown[];
  };
};

type Props = {
  reportData: ReportData;
};

const formatCurrency = (val: number) => {
  return '₱' + Number(val || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function StaffReportsPage({ reportData }: Props) {
  const { kpis, financial, barangays, students, options, filters } = reportData;

  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [barangaySearch, setBarangaySearch] = useState('');
  const [selectedProgram, setSelectedProgram] = useState<string>(filters.program_id);
  const [selectedYear, setSelectedYear] = useState<string>(filters.year);

  const applyFilters = (newProgram: string, newYear: string) => {
    setSelectedProgram(newProgram);
    setSelectedYear(newYear);

    router.get(
      route('staff.reports.index'),
      {
        program_id: newProgram !== 'all' ? newProgram : undefined,
        year: newYear !== 'all' ? newYear : undefined,
      },
      { preserveState: true, replace: true }
    );
  };

  const handleExport = (type: 'financial' | 'barangay') => {
    const params = new URLSearchParams();
    if (selectedProgram && selectedProgram !== 'all') params.append('program_id', selectedProgram);
    if (selectedYear && selectedYear !== 'all') params.append('year', selectedYear);
    params.append('type', type);
    window.location.href = `${route('staff.reports.export')}?${params.toString()}`;
  };

  const filteredBarangays = useMemo(() => {
    if (!barangaySearch.trim()) return barangays.items;
    const q = barangaySearch.toLowerCase();
    return barangays.items.filter(
      (b) => b.barangay_name.toLowerCase().includes(q) || (b.barangay_code && b.barangay_code.includes(q))
    );
  }, [barangays.items, barangaySearch]);

  // Weekly Table Columns
  const weeklyColumns: ColumnsType<WeeklyFinancial> = [
    {
      title: 'Week Period',
      dataIndex: 'period_label',
      key: 'period_label',
      render: (val: string, record) => (
        <div>
          <span className="font-semibold text-stone-800">{val}</span>
          <p className="text-xs text-stone-500">ISO Week {record.week_number}, {record.year}</p>
        </div>
      ),
    },
    {
      title: 'Students Assisted',
      dataIndex: 'students_count',
      key: 'students_count',
      align: 'right',
      render: (val: number) => <span className="font-semibold text-emerald-700">{val} students</span>,
    },
    {
      title: 'Releases Count',
      dataIndex: 'releases_count',
      key: 'releases_count',
      align: 'right',
      render: (val: number) => <span>{val} disbursements</span>,
    },
    {
      title: 'Total Disbursed',
      dataIndex: 'disbursed_amount',
      key: 'disbursed_amount',
      align: 'right',
      render: (val: number) => <span className="font-bold text-stone-900">{formatCurrency(val)}</span>,
    },
    {
      title: 'Average / Student',
      dataIndex: 'average_per_student',
      key: 'average_per_student',
      align: 'right',
      render: (val: number) => <span className="text-stone-600">{formatCurrency(val)}</span>,
    },
  ];

  // Monthly Table Columns
  const monthlyColumns: ColumnsType<MonthlyFinancial> = [
    {
      title: 'Month & Year',
      dataIndex: 'month_name',
      key: 'month_name',
      render: (val: string) => <span className="font-bold text-stone-800">{val}</span>,
    },
    {
      title: 'Students Assisted',
      dataIndex: 'students_count',
      key: 'students_count',
      align: 'right',
      render: (val: number) => (
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
          <Users size={14} />
          {val} students
        </span>
      ),
    },
    {
      title: 'Disbursement Count',
      dataIndex: 'releases_count',
      key: 'releases_count',
      align: 'right',
      render: (val: number) => <span>{val} payouts</span>,
    },
    {
      title: 'Total Disbursed',
      dataIndex: 'disbursed_amount',
      key: 'disbursed_amount',
      align: 'right',
      render: (val: number) => <span className="font-black text-stone-900 text-base">{formatCurrency(val)}</span>,
    },
    {
      title: 'Average / Student',
      dataIndex: 'average_per_student',
      key: 'average_per_student',
      align: 'right',
      render: (val: number) => <span className="text-stone-600">{formatCurrency(val)}</span>,
    },
  ];

  // Yearly Table Columns
  const yearlyColumns: ColumnsType<YearlyFinancial> = [
    {
      title: 'Fiscal Year',
      dataIndex: 'year',
      key: 'year',
      render: (val: number) => <span className="font-black text-stone-900 text-base">FY {val}</span>,
    },
    {
      title: 'Allocated Budget',
      dataIndex: 'allocated_budget',
      key: 'allocated_budget',
      align: 'right',
      render: (val: number) => <span className="font-semibold text-stone-700">{formatCurrency(val)}</span>,
    },
    {
      title: 'Total Disbursed',
      dataIndex: 'disbursed_amount',
      key: 'disbursed_amount',
      align: 'right',
      render: (val: number) => <span className="font-bold text-emerald-700">{formatCurrency(val)}</span>,
    },
    {
      title: 'Remaining Balance',
      dataIndex: 'remaining_budget',
      key: 'remaining_budget',
      align: 'right',
      render: (val: number) => <span className="font-medium text-stone-600">{formatCurrency(val)}</span>,
    },
    {
      title: 'Students Assisted',
      dataIndex: 'students_count',
      key: 'students_count',
      align: 'right',
      render: (val: number) => <span className="font-semibold text-stone-800">{val} students</span>,
    },
    {
      title: 'Budget Utilization',
      dataIndex: 'utilization_rate',
      key: 'utilization_rate',
      align: 'right',
      render: (val: number) => (
        <div className="flex items-center justify-end gap-2">
          <Progress percent={val} size="small" style={{ width: 80 }} strokeColor="#059669" />
          <span className="text-xs font-bold text-stone-700">{val}%</span>
        </div>
      ),
    },
  ];

  // Barangay Table Columns
  const barangayColumns: ColumnsType<BarangayItem> = [
    {
      title: 'Barangay',
      dataIndex: 'barangay_name',
      key: 'barangay_name',
      render: (val: string, record) => (
        <div>
          <span className="font-bold text-stone-800">{val}</span>
          {record.barangay_code && (
            <p className="text-[11px] text-stone-400">Code: {record.barangay_code}</p>
          )}
        </div>
      ),
    },
    {
      title: 'Enrolled Youth',
      dataIndex: 'enrolled_students',
      key: 'enrolled_students',
      align: 'right',
      sorter: (a, b) => a.enrolled_students - b.enrolled_students,
      render: (val: number) => <span className="font-medium text-stone-700">{val}</span>,
    },
    {
      title: 'Approved',
      dataIndex: 'approved_students',
      key: 'approved_students',
      align: 'right',
      render: (val: number) => <span className="text-emerald-700 font-semibold">{val}</span>,
    },
    {
      title: 'Given Cash Incentives',
      dataIndex: 'given_students',
      key: 'given_students',
      align: 'right',
      sorter: (a, b) => a.given_students - b.given_students,
      render: (val: number) => (
        <Tag color={val > 0 ? 'green' : 'default'} className="font-bold px-2 py-0.5">
          {val} {val === 1 ? 'student' : 'students'}
        </Tag>
      ),
    },
    {
      title: 'Total Disbursed',
      dataIndex: 'disbursed_amount',
      key: 'disbursed_amount',
      align: 'right',
      sorter: (a, b) => a.disbursed_amount - b.disbursed_amount,
      render: (val: number) => (
        <span className="font-black text-stone-900">{formatCurrency(val)}</span>
      ),
    },
    {
      title: 'Pending Releases',
      dataIndex: 'pending_releases',
      key: 'pending_releases',
      align: 'right',
      render: (val: number) => (
        <span className={val > 0 ? 'text-amber-700 font-semibold' : 'text-stone-400'}>
          {val}
        </span>
      ),
    },
    {
      title: 'Disbursement Share',
      dataIndex: 'percentage_of_total_disbursed',
      key: 'percentage_of_total_disbursed',
      align: 'right',
      sorter: (a, b) => a.percentage_of_total_disbursed - b.percentage_of_total_disbursed,
      render: (val: number) => (
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs font-semibold text-stone-600">{val}%</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <Head title="MYDO Staff Reports & Analytics" />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header Title & Global Filters */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-emerald-100 p-2 text-emerald-800">
                <BarChart3 size={22} />
              </span>
              <h1 className="text-2xl font-black tracking-tight text-stone-900">
                MYDO Program Reports & Analytics
              </h1>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              Comprehensive financial disbursement tracking, barangay distribution reach, and youth student metrics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Program Filter */}
            <Select
              value={selectedProgram}
              onChange={(val) => applyFilters(val, selectedYear)}
              className="w-48"
              options={[
                { value: 'all', label: 'All Incentive Programs' },
                ...options.programs.map((p) => ({
                  value: p.id,
                  label: `${p.code} - ${p.title}`,
                })),
              ]}
            />

            {/* Year Filter */}
            <Select
              value={selectedYear}
              onChange={(val) => applyFilters(selectedProgram, val)}
              className="w-32"
              options={[
                { value: 'all', label: 'All Years' },
                ...options.years.map((y) => ({
                  value: String(y),
                  label: `Year ${y}`,
                })),
              ]}
            />

            {/* Export Dropdown */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'financial',
                    label: 'Export Financial Report (CSV)',
                    icon: <Download size={14} />,
                    onClick: () => handleExport('financial'),
                  },
                  {
                    key: 'barangay',
                    label: 'Export Barangay Distribution (CSV)',
                    icon: <Download size={14} />,
                    onClick: () => handleExport('barangay'),
                  },
                ],
              }}
            >
              <Button icon={<Download size={15} />}>Export</Button>
            </Dropdown>

            {/* Print Button */}
            <Button
              icon={<Printer size={15} />}
              onClick={() => window.print()}
              className="hidden sm:inline-flex"
            >
              Print
            </Button>
          </div>
        </div>

        {/* 4 Primary KPI Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Total Disbursed */}
          <Card className="rounded-2xl border-stone-200/80 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Total Disbursed
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-800">
                  {formatCurrency(kpis.total_disbursed)}
                </p>
              </div>
              <span className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
                <Banknote size={22} />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
              <span className="text-stone-500">Budget Utilization</span>
              <span className="font-bold text-emerald-700">{kpis.utilization_rate}%</span>
            </div>
          </Card>

          {/* 2. Total Budget */}
          <Card className="rounded-2xl border-stone-200/80 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Allocated Budget
                </p>
                <p className="mt-1 text-2xl font-black text-stone-900">
                  {formatCurrency(kpis.total_budget)}
                </p>
              </div>
              <span className="rounded-xl bg-stone-100 p-2.5 text-stone-700">
                <TrendingUp size={22} />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
              <span className="text-stone-500">Remaining Balance</span>
              <span className="font-bold text-stone-700">{formatCurrency(kpis.remaining_budget)}</span>
            </div>
          </Card>

          {/* 3. Barangays Given Cash Incentives */}
          <Card className="rounded-2xl border-stone-200/80 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Barangays Reached
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-stone-900">
                    {barangays.barangays_given_count}
                  </span>
                  <span className="text-xs font-medium text-stone-500">
                    of {barangays.total_barangays_count} covered
                  </span>
                </div>
              </div>
              <span className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                <MapPin size={22} />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
              <span className="text-stone-500">Given Incentives</span>
              <Tag color="green" className="mr-0 font-bold">
                {barangays.barangays_given_count} Barangays
              </Tag>
            </div>
          </Card>

          {/* 4. Students Count Assisted */}
          <Card className="rounded-2xl border-stone-200/80 shadow-2xs hover:shadow-xs transition">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Students Assisted
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-stone-900">
                    {kpis.total_students_given}
                  </span>
                  <span className="text-xs font-medium text-stone-500">
                    / {kpis.total_students_enrolled} enrolled
                  </span>
                </div>
              </div>
              <span className="rounded-xl bg-purple-50 p-2.5 text-purple-700">
                <GraduationCap size={22} />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3 text-xs">
              <span className="text-stone-500">Total Registered Youth</span>
              <span className="font-bold text-stone-800">{kpis.total_registered_youth} registered</span>
            </div>
          </Card>
        </div>

        {/* Tabbed Reports Section */}
        <Card className="rounded-2xl border-stone-200/80 shadow-2xs overflow-hidden">
          <Tabs
            defaultActiveKey="financial"
            items={[
              {
                key: 'financial',
                label: (
                  <span className="flex items-center gap-2 font-bold px-1">
                    <Banknote size={16} />
                    Financial Reports (Weekly, Monthly, Yearly)
                  </span>
                ),
                children: (
                  <div className="py-2">
                    {/* Timeframe selector */}
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-stone-900">
                          Financial Disbursements Summary
                        </h3>
                        <p className="text-xs text-stone-500">
                          Track released cash incentives and disbursement pacing across time intervals.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Radio.Group
                          value={timeframe}
                          onChange={(e) => setTimeframe(e.target.value)}
                          optionType="button"
                          buttonStyle="solid"
                        >
                          <Radio.Button value="weekly">Weekly</Radio.Button>
                          <Radio.Button value="monthly">Monthly</Radio.Button>
                          <Radio.Button value="yearly">Yearly</Radio.Button>
                        </Radio.Group>
                      </div>
                    </div>

                    {/* Table based on selected timeframe */}
                    {timeframe === 'weekly' && (
                      <Table
                        columns={weeklyColumns}
                        dataSource={financial.weekly}
                        rowKey="week_key"
                        pagination={{ pageSize: 8 }}
                        locale={{
                          emptyText: (
                            <Empty
                              description="No weekly disbursement releases found for the selected period."
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                          ),
                        }}
                      />
                    )}

                    {timeframe === 'monthly' && (
                      <Table
                        columns={monthlyColumns}
                        dataSource={financial.monthly}
                        rowKey="month_key"
                        pagination={{ pageSize: 8 }}
                        locale={{
                          emptyText: (
                            <Empty
                              description="No monthly disbursement releases found for the selected period."
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                          ),
                        }}
                      />
                    )}

                    {timeframe === 'yearly' && (
                      <Table
                        columns={yearlyColumns}
                        dataSource={financial.yearly}
                        rowKey="year"
                        pagination={false}
                        locale={{
                          emptyText: (
                            <Empty
                              description="No yearly program allocations found."
                              image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                          ),
                        }}
                      />
                    )}
                  </div>
                ),
              },
              {
                key: 'barangays',
                label: (
                  <span className="flex items-center gap-2 font-bold px-1">
                    <MapPin size={16} />
                    Barangay Distribution ({barangays.barangays_given_count} Given)
                  </span>
                ),
                children: (
                  <div className="py-2">
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-base font-bold text-stone-900">
                          Barangay Cash Incentive Distribution
                        </h3>
                        <p className="text-xs text-stone-500">
                          Count of barangays given cash incentives and detailed student assistance breakdown.
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <Input
                          placeholder="Search barangay..."
                          prefix={<Search size={15} className="text-stone-400" />}
                          value={barangaySearch}
                          onChange={(e) => setBarangaySearch(e.target.value)}
                          allowClear
                          className="w-64"
                        />
                      </div>
                    </div>

                    {/* Quick status bar */}
                    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl bg-stone-50 p-3 text-xs">
                      <span className="font-semibold text-stone-700">Barangay Coverage Status:</span>
                      <Tag color="green" className="font-bold">
                        {barangays.barangays_given_count} Received Cash Incentives
                      </Tag>
                      <Tag color="amber" className="font-bold">
                        {barangays.barangays_pending_count} Pending Releases
                      </Tag>
                      <span className="text-stone-400">|</span>
                      <span className="text-stone-600">
                        Total {barangays.total_barangays_count} Barangays with participating youth
                      </span>
                    </div>

                    <Table
                      columns={barangayColumns}
                      dataSource={filteredBarangays}
                      rowKey="barangay_name"
                      pagination={{ pageSize: 10 }}
                      locale={{
                        emptyText: (
                          <Empty
                            description="No barangay records match your filter."
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ),
                      }}
                    />
                  </div>
                ),
              },
              {
                key: 'students',
                label: (
                  <span className="flex items-center gap-2 font-bold px-1">
                    <Users size={16} />
                    Student Demographics ({kpis.total_students_given} Assisted)
                  </span>
                ),
                children: (
                  <div className="py-2">
                    <div className="mb-6">
                      <h3 className="text-base font-bold text-stone-900">
                        Student Demographics & Beneficiary Breakdown
                      </h3>
                      <p className="text-xs text-stone-500">
                        Analysis of youth beneficiaries by educational level, school institution, and profile attributes.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                      {/* By Educational Level */}
                      <Card
                        title={
                          <div className="flex items-center gap-2">
                            <GraduationCap size={18} className="text-emerald-700" />
                            <span className="font-bold text-stone-900">By Educational Status</span>
                          </div>
                        }
                        size="small"
                        className="rounded-xl border-stone-200"
                      >
                        <div className="divide-y divide-stone-100">
                          {students.by_educational_status.length === 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data available" />
                          ) : (
                            students.by_educational_status.map((item) => (
                              <div key={item.status_name} className="flex items-center justify-between py-2.5 text-xs">
                                <div>
                                  <p className="font-bold text-stone-800">{item.status_name}</p>
                                  <p className="text-stone-500">{item.enrolled_count} youth enrolled</p>
                                </div>
                                <div className="text-right">
                                  <Tag color="green" className="font-bold">
                                    {item.given_count} given incentives
                                  </Tag>
                                  <p className="mt-0.5 font-bold text-stone-900">
                                    {formatCurrency(item.disbursed_amount)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>

                      {/* By School / University */}
                      <Card
                        title={
                          <div className="flex items-center gap-2">
                            <Sparkles size={18} className="text-blue-700" />
                            <span className="font-bold text-stone-900">Top Schools & Institutions</span>
                          </div>
                        }
                        size="small"
                        className="rounded-xl border-stone-200"
                      >
                        <div className="divide-y divide-stone-100">
                          {students.by_school.length === 0 ? (
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data available" />
                          ) : (
                            students.by_school.map((item) => (
                              <div key={item.school_name} className="flex items-center justify-between py-2.5 text-xs">
                                <div className="max-w-[60%]">
                                  <p className="truncate font-bold text-stone-800" title={item.school_name}>
                                    {item.school_name}
                                  </p>
                                  <p className="text-stone-500">{item.enrolled_count} students</p>
                                </div>
                                <div className="text-right">
                                  <Tag color="blue" className="font-bold">
                                    {item.given_count} given
                                  </Tag>
                                  <p className="mt-0.5 font-bold text-stone-900">
                                    {formatCurrency(item.disbursed_amount)}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </Card>
                    </div>

                    {/* By Gender / Sex */}
                    <div className="mt-6">
                      <Card
                        title={
                          <div className="flex items-center gap-2">
                            <Users size={18} className="text-purple-700" />
                            <span className="font-bold text-stone-900">Gender Distribution</span>
                          </div>
                        }
                        size="small"
                        className="rounded-xl border-stone-200"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                          {students.by_sex.map((item) => (
                            <div key={item.sex} className="rounded-lg bg-stone-50 p-3">
                              <p className="text-xs text-stone-500 uppercase tracking-wider">{item.sex}</p>
                              <p className="mt-1 text-xl font-black text-stone-900">
                                {item.given_count}{' '}
                                <span className="text-xs font-normal text-stone-500">
                                  / {item.enrolled_count} enrolled
                                </span>
                              </p>
                              <p className="mt-1 text-xs font-semibold text-emerald-700">
                                {formatCurrency(item.disbursed_amount)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </Card>
      </div>
    </>
  );
}

StaffReportsPage.layout = (page: ReactElement) => (
  <StaffAuthLayout user={page.props.auth.user}>{page}</StaffAuthLayout>
);
