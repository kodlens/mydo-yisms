export type ScholarshipApplication = {
    id: number;
    youth_profile_id: number;
    scholarship_type_id: number;
    academic_year_id?: number;
    reference?: string | null;
    coe_path?: string | null;
    cog_path?: string | null;
    cedula_path?: string | null;
    school_id_path?: string | null;
    psa_path?: string | null;
    status: 'pending' | 'approved' | 'rejected' | 'draft' | string;
    rejection_reason?: string | null;
    reviewed_by?: number | null;
    reviewed_at?: string | null;
    submitted_at?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
};
