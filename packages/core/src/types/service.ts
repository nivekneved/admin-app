export interface ItineraryItem {
    time?: string
    title: string
    description: string
}

export interface MealPlan {
    id: string
    label: string
    price?: number
}

export interface RoomType {
    id?: string
    name?: string
    type?: string
    price?: number
    price_per_night?: number
    weekday_price?: number
    weekend_price?: number
    prices?: Record<string, number>
    total_units?: number
    size?: string
    bed?: string
    view?: string
    features?: string[]
    image_url?: string
    max_occupancy?: number
    images?: string[]
    meal_plan?: string
    cancellation_policy?: string
    deposit_policy?: string
    is_active?: boolean
    min_stay_days?: number
    min_stay?: number
    max_adults?: number
    max_children?: number
    child_age_limit?: number
}

export type Service = {
    id: string
    name: string
    location: string
    base_price: number
    image_url: string
    duration_days?: number
    duration_hours?: number
    duration?: string
    service_type: string
    rating?: number
    region?: string
    amenities?: string[] | string
    is_seasonal_deal?: boolean
    deal_note?: string
    description?: string
    short_description?: string
    max_group_size?: number
    max_adults?: number
    max_children?: number
    child_age_limit?: number
    room_types?: RoomType[]
    itinerary?: ItineraryItem[]
    stock?: number
    status?: string
    cta_text?: string
    cta_link?: string
    gallery_images?: string[]
    meta_title?: string
    meta_description?: string
    seo_keywords?: string
    special_features?: unknown
    seasonality?: string
    highlights?: string[]
    included?: string[]
    not_included?: string[]
    cancellation_policy?: string
    terms_and_conditions?: string
    thumbnail_url?: string
    banner_url?: string
    featured?: boolean
    priority?: number
    secondary_image_url?: string
    child_price?: number
    meal_plans?: MealPlan[]
    lowestPrice?: number
    price?: number
    category?: string
}

export type PricingFormula = 'pax_based' | 'room_based' | 'fixed' | 'per_unit'

export interface AgeGroupModifiers {
    adult: number
    teen: number
    child: number
    infant: number
}

export interface ServiceTypeDefinition {
    id: string
    label: string
    formula: PricingFormula
    pax_logic: AgeGroupModifiers
    link_pattern?: string
}

export interface ServiceConfig {
    types: ServiceTypeDefinition[]
}
