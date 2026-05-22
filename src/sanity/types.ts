export interface SanityImage {
  asset: { _ref: string; _type: 'reference' };
  hotspot?: { x: number; y: number };
}

export interface Category {
  _id: string;
  nameEs: string;
  nameEn: string;
  slug: string;
}

export interface DessertSize {
  _key: string;
  labelEs: string;
  labelEn: string;
  price: number;
}

export type AllergenKey =
  | 'dairy' | 'eggs' | 'gluten' | 'peanuts'
  | 'treeNuts' | 'soy' | 'sesame' | 'fish' | 'shellfish';

export interface Dessert {
  _id: string;
  nameEs: string;
  nameEn: string;
  slug: string;
  descriptionEs?: string;
  descriptionEn?: string;
  price: number;
  sizes?: DessertSize[];
  allergens?: AllergenKey[];
  mainImage: SanityImage;
  gallery?: SanityImage[];
  available: boolean;
  featured: boolean;
  category: Category;
}

export interface SiteSettings {
  heroVideo?: { asset: { url: string; mimeType: string } };
  heroPoster?: SanityImage;
  heroTitleEs: string;
  heroTitleEn: string;
  heroSubtitleEs?: string;
  heroSubtitleEn?: string;
  heroCtaEs: string;
  heroCtaEn: string;
  announcementEs?: string;
  announcementEn?: string;
  contactEmail?: string;
  contactPhone?: string;
  instagramUrl?: string;
  businessAddress?: string;
  salesTaxRate?: number;
}
