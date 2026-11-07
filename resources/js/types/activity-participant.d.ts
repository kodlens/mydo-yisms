/** One youth sign-up on the participants table. */
export type ActivityParticipant = {
    id: number;
    youth_profile_id: number;
    full_name: string;
    email: string | null;
    mobile_number: string | null;
    barangay: string | null;
    /** pending, approved, rejected, or cancelled. */
    status: 'pending' | 'approved' | 'rejected' | 'cancelled';
    has_attended?: boolean;
    attended_at?: string | null;
    registered_at: string | null;
    reviewed_at: string | null;
    rejection_reason: string | null;
};

/** Summary of the activity the participants belong to, shown above the table. */
export type ActivityParticipantSummary = {
    id: number;
    title: string;
    /** Null means unlimited capacity. */
    capacity: number | null;
    requires_approval: boolean;
    /** Sign-ups holding a slot: pending + approved. */
    reserved_count: number;
    /** Null when capacity is unlimited. */
    slots_left: number | null;
};

/** Filter on the participants table. '' means every status. */
export type ParticipantStatusFilter = '' | ActivityParticipant['status'];
