export type ScholarshipType = {
    id: number;
    scholarship: string;
    target_beneficiary: string | null;
    benefit: string | null;
    /** The API returns this as a decimal string, so it is typed as a loose number. */
    amount: number | string | null;
    is_active: boolean;
    applications_count: number;
    created_at: string | null;
    updated_at: string | null;
};

export type ScholarshipTypePayload = {
    scholarship: string;
    target_beneficiary: string | null;
    benefit: string | null;
    amount: number | null;
    is_active: boolean;
};

/** Mirrors the `status` filter the `getData` endpoint understands. */
export type ScholarshipTypeStatusFilter = 'all' | 'active' | 'inactive';
