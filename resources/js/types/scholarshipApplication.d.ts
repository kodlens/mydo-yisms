export type ScholarshipApplication = {
    id:number
    youth_profile_id:number
    scholarship_type_id:number
    coe_path: string
    cog_path: string
    cedula_path: string
    school_id_path: string
    psa_path: string
    status: string;
    rejection_reason: boolean
    reviewed_by: number
    reviewed_at: Date
    submitted_at: Date
    created_at: Date
    updated_at: Date
}
