import { ActivityCategory } from "./activity-category";

export type ActivityStatus = 'draft' | 'published' | 'cancelled' | 'archived';

export type Activity = {
    id: number;
    activity_category_id: number;
    /** Eager-loaded `category` relation; null when the relation was not loaded. */
    category: ActivityCategory | null;
    created_by: number | null;
    title: string;
    slug: string;
    summary: string | null;
    description: string;
    cover_image_path: string | null;
    venue_name: string;
    venue_address: string | null;
    /** Stored in UTC; converted to the viewer's timezone for display. */
    starts_at: string;
    ends_at: string;
    registration_opens_at: string | null;
    registration_closes_at: string | null;
    /** Null means unlimited capacity. */
    capacity: number | null;
    requires_registration: boolean;
    requires_approval: boolean;
    eligibility_notes: string | null;
    requirements: string | null;
    status: ActivityStatus;
    published_at: string | null;
    is_featured: boolean;
    created_at: string | null;
    updated_at: string | null;
    /** Added by the list endpoint via withCount; absent on single-row responses. */
    registrations_count?: number;
    /** Sign-ups still waiting for a staff decision. */
    pending_registrations_count?: number;
    /** Sign-ups that still reserve a slot, i.e. pending + approved. */
    approved_registrations_count?: number;
    volunteer_assignments_count?: number;
};

export type ActivityPayload = {
    activity_category_id: number;
    title: string;
    slug: string;
    summary: string | null;
    description: string;
    cover_image_path: string | null;
    venue_name: string;
    venue_address: string | null;
    starts_at: string;
    ends_at: string;
    registration_opens_at: string | null;
    registration_closes_at: string | null;
    capacity: number | null;
    requires_registration: boolean;
    requires_approval: boolean;
    eligibility_notes: string | null;
    requirements: string | null;
    status: ActivityStatus;
    is_featured: boolean;
};

export type ActivityStatusFilter = 'all' | ActivityStatus;
