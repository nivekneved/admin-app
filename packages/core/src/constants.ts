import { 
  Users, 
  Baby, 
  Hotel, 
  Map, 
  PackageCheck, 
  Ship 
} from 'lucide-react';

export const AGE_GROUPS = [
  { key: 'price',        label: 'Adult',  ageRange: '18+',   color: 'slate', icon: Users },
  { key: 'price_infant', label: 'Infant', ageRange: '0–2',   color: 'purple', icon: Baby },
  { key: 'price_child',  label: 'Child',  ageRange: '3–11',  color: 'blue',  icon: Users },
  { key: 'price_teen',   label: 'Teen',   ageRange: '12–17', color: 'amber', icon: Users },
];

export const SERVICE_TYPES = [
  { value: 'hotel',         label: 'Hotels',       icon: Hotel,        priceType: 'per_night'  },
  { value: 'tour',          label: 'Tours',         icon: Map,          priceType: 'per_person' },
  { value: 'activity',      label: 'Activities',    icon: PackageCheck, priceType: 'per_person' },
  { value: 'land_activity', label: 'Land Packages', icon: PackageCheck, priceType: 'per_person' },
  { value: 'sea_activity',  label: 'Sea Packages',  icon: Ship,         priceType: 'per_person' },
  { value: 'cruise',        label: 'Cruises',       icon: Ship,         priceType: 'per_person' },
];

export const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];
