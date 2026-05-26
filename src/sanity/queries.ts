import { sanityClient } from './client';
import type { Dessert, Category, SiteSettings } from './types';

export async function getAllDesserts(): Promise<Dessert[]> {
  if (!sanityClient) return [];
  return sanityClient.fetch(`
    *[_type == "dessert" && available == true] | order(category->sortOrder asc, sortOrder asc, nameEs asc) {
      _id, nameEs, nameEn, "slug": slug.current,
      descriptionEs, descriptionEn, price,
      sizes[]{ _key, labelEs, labelEn, price },
      allergens, mainImage, gallery, featured,
      "category": category->{nameEs, nameEn, "slug": slug.current, sortOrder}
    }
  `);
}

export async function getDessertBySlug(slug: string): Promise<Dessert | null> {
  if (!sanityClient) return null;
  return sanityClient.fetch(
    `*[_type == "dessert" && slug.current == $slug][0] {
      _id, nameEs, nameEn, "slug": slug.current,
      descriptionEs, descriptionEn, price,
      sizes[]{ _key, labelEs, labelEn, price },
      allergens, mainImage, gallery, available,
      "category": category->{nameEs, nameEn, "slug": slug.current}
    }`,
    { slug }
  );
}

export async function getFeaturedDesserts(): Promise<Dessert[]> {
  if (!sanityClient) return [];
  return sanityClient.fetch(`
    *[_type == "dessert" && featured == true && available == true] | order(sortOrder asc) [0...6] {
      _id, nameEs, nameEn, "slug": slug.current, price,
      shortDescriptionEs, shortDescriptionEn,
      sizes[]{ _key, labelEs, labelEn, price },
      allergens, mainImage,
      "category": category->{nameEs, nameEn, "slug": slug.current}
    }
  `);
}

export async function getDessertsByCategorySlug(categorySlug: string): Promise<Dessert[]> {
  if (!sanityClient) return [];
  return sanityClient.fetch(
    `*[_type == "dessert" && available == true && category->slug.current == $categorySlug] | order(sortOrder asc, nameEs asc) {
      _id, nameEs, nameEn, "slug": slug.current,
      descriptionEs, descriptionEn, price,
      sizes[]{ _key, labelEs, labelEn, price },
      allergens, mainImage, gallery, featured,
      "category": category->{nameEs, nameEn, "slug": slug.current}
    }`,
    { categorySlug }
  );
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!sanityClient) return null;
  return sanityClient.fetch(
    `*[_type == "category" && slug.current == $slug][0] {
      _id, nameEs, nameEn, "slug": slug.current
    }`,
    { slug }
  );
}

export async function getAllCategories(): Promise<Category[]> {
  if (!sanityClient) return [];
  return sanityClient.fetch(`
    *[_type == "category"] | order(sortOrder asc) {
      _id, nameEs, nameEn, "slug": slug.current
    }
  `);
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (!sanityClient) return null;
  return sanityClient.fetch(`
    *[_type == "siteSettings"][0] {
      heroVideo { asset->{url, mimeType} },
      heroPoster, heroTitleEs, heroTitleEn,
      heroSubtitleEs, heroSubtitleEn, heroCtaEs, heroCtaEn,
      announcementEs, announcementEn,
      contactEmail, contactPhone, instagramUrl, businessAddress, salesTaxRate
    }
  `);
}
