export type ActivityCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
};

export type ActivityCategoryPayload = {
    name: string;
    slug: string;
    description: string | null;
    is_active: boolean;
};
