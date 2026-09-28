export type VolunteerStatus = 'pending' | 'active' | 'inactive';

export type VolunteerAssignmentStatus = 'assigned' | 'completed' | 'cancelled';

export type Volunteer = {
    id: number;
    youth_profile_id: number;
    full_name: string;
    lname: string | null;
    fname: string | null;
    email: string | null;
    mobile_number: string | null;
    school_name: string | null;
    brgyCode: string | null;
    status: VolunteerStatus;
    motivation: string | null;
    skills: string | null;
    availability: string | null;
    emergency_contact_name: string | null;
    emergency_contact_number: string | null;
    approved_at: string | null;
    registered_at: string | null;
    assignments_count: number;
    /** Credited service hours summed across every attendance record. */
    total_hours: number;
};

export type VolunteerAttendance = {
    id: number;
    time_in: string | null;
    time_out: string | null;
    hours_rendered: number | null;
    method: 'manual' | 'qr';
    remarks: string | null;
};

export type VolunteerAssignment = {
    id: number;
    activity_id: number;
    activity_title: string | null;
    activity_category: string | null;
    activity_starts_at: string | null;
    activity_status: string | null;
    role: string | null;
    status: VolunteerAssignmentStatus;
    assigned_at: string | null;
    attendance: VolunteerAttendance | null;
};

export type SelectableActivity = {
    id: number;
    title: string;
    status: string;
    starts_at: string | null;
};

export type VolunteerDetail = {
    volunteer: Volunteer;
    assignments: VolunteerAssignment[];
    available_activities: SelectableActivity[];
};

export type VolunteerPayload = {
    email?: string;
    motivation: string | null;
    skills: string | null;
    availability: string | null;
    emergency_contact_name: string | null;
    emergency_contact_number: string | null;
    status: VolunteerStatus;
};

export type VolunteerStatusFilter = 'all' | VolunteerStatus;
