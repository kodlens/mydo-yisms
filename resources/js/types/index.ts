import { LucideIcon } from 'lucide-react';

export interface Auth {
    user: User;
}

export interface BreadcrumbItem {
    title: string;
    href: string;
}

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon | null;
    isActive?: boolean;
}

export interface SharedData {
    name: string;
    quote: { message: string; author: string };
    auth: Auth;
    [key: string]: unknown;
}

export interface User {
    id: number;
    name: string;
    lname: string;
    fname: string;
    mname: string;
    sex: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown; // This allows for additional properties...
}

export interface Student extends User {
    birth_date?: string | null;
    civil_status?: string | null;
    mobile_number?: string | null;
    provCode?: string | null;
    citymunCode?: string | null;
    brgyCode?: string | null;
    street_address?: string | null;
    zip_code?: string | null;
    school_name?: string | null;
    program?: string | null;
    year?: number | string | null;
    previous_semester_gwa?: number | string | null;
    guardian_name?: string | null;
    guardian_contact_number?: string | null;
    monthly_family_income?: number | string | null;
    coe_path?: string | null;
    cog_path?: string | null;
    cedula_path?: string | null;
    school_id_path?: string | null;
    psa_path?: string | null;
    registration_status?: string | null;
    is_active?: boolean;
    province?: {
        provCode: string;
        provDesc: string;
    } | null;
    city?: {
        citymunCode: string;
        citymunDesc: string;
    } | null;
    barangay?: {
        brgyCode: string;
        brgyDesc: string;
    } | null;
}
