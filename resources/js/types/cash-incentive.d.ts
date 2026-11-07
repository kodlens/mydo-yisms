export interface CashIncentiveProgram {
  id: number;
  code: string;
  title: string;
  description?: string | null;
  funding_year: number;
  amount_per_beneficiary: number;
  allocated_budget: number;
  max_beneficiaries: number;
  selection_start_date?: string | null;
  selection_end_date?: string | null;
  release_start_date?: string | null;
  release_end_date?: string | null;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  created_at: string;
  total_beneficiaries_count?: number;
  approved_beneficiaries_count?: number;
  released_count?: number;
  released_amount?: number;
  remaining_budget?: number;
  budget_utilization_rate?: number;
}

export interface CashIncentiveProgramSummary {
  allocated_budget: number;
  amount_per_beneficiary: number;
  max_beneficiaries: number;
  total_selected_count: number;
  pending_review_count: number;
  approved_count: number;
  rejected_count: number;
  committed_amount: number;
  released_count: number;
  released_amount: number;
  remaining_budget: number;
  pending_release_count: number;
  scheduled_release_count: number;
  unclaimed_release_count: number;
  cancelled_release_count: number;
  budget_utilization_rate: number;
  release_rate: number;
}

export interface CashIncentiveRelease {
  id: number;
  status: 'pending' | 'scheduled' | 'released' | 'unclaimed' | 'cancelled';
  amount: number;
  scheduled_release_date?: string | null;
  actual_release_date?: string | null;
  acknowledgment_reference?: string | null;
  supporting_document_url?: string | null;
  released_by?: string | null;
  remarks?: string | null;
  cancellation_reason?: string | null;
}

export interface CashIncentiveBeneficiary {
  id: number;
  youth_profile_id: number;
  status: 'pending' | 'approved' | 'rejected';
  selected_at?: string | null;
  selected_by?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  rejection_reason?: string | null;
  remarks?: string | null;

  reference_code?: string | null;
  student_id?: string | null;
  full_name: string;
  sex?: string | null;
  civil_status?: string | null;
  mobile_number?: string | null;
  email?: string | null;
  monthly_family_income?: number | null;
  barangay: string;
  school_name: string;
  program: string;
  educational_status?: string | null;

  release?: CashIncentiveRelease | null;
}

export interface AvailableYouth {
  id: number;
  reference_code?: string | null;
  student_id?: string | null;
  full_name: string;
  email?: string | null;
  mobile_number?: string | null;
  sex?: string | null;
  birth_date?: string | null;
  civil_status?: string | null;
  monthly_family_income?: number | null;
  barangay: string;
  brgy_code?: string | null;
  school_name: string;
  program: string;
  year_level?: number | null;
  is_graduated: boolean;
  educational_status: string;
}
