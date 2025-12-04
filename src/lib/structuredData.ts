/**
 * Structured Data (JSON-LD) für SEO
 * Schema.org Markup für bessere Google-Darstellung
 */

export interface OrganizationData {
  name: string
  description: string
  url: string
  logo?: string
  contactEmail?: string
  socialLinks?: string[]
}

export interface ServiceData {
  id: string
  name: string
  description: string
  price?: string
  url?: string
}

/**
 * Organisation Schema für die Webseite
 */
export function generateOrganizationSchema(data: OrganizationData) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: data.name,
    description: data.description,
    url: data.url,
    logo: data.logo,
    contactPoint: data.contactEmail
      ? {
          '@type': 'ContactPoint',
          email: data.contactEmail,
          contactType: 'customer service',
        }
      : undefined,
    sameAs: data.socialLinks,
  }
}

/**
 * WebSite Schema mit Suchfunktion
 */
export function generateWebSiteSchema(url: string, name: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: name,
    description: description,
    url: url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Service Schema für angebotene Dienstleistungen
 */
export function generateServiceSchema(data: ServiceData, provider: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: data.name,
    description: data.description,
    provider: {
      '@type': 'Organization',
      name: provider,
    },
    offers: data.price
      ? {
          '@type': 'Offer',
          price: data.price,
          priceCurrency: 'EUR',
        }
      : undefined,
    url: data.url,
  }
}

/**
 * BreadcrumbList Schema für Navigation
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string; position: number }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item) => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url,
    })),
  }
}

/**
 * Article Schema für News-Beiträge
 */
export function generateArticleSchema(article: {
  title: string
  description: string
  datePublished: string
  dateModified?: string
  authorName: string
  url: string
  imageUrl?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified || article.datePublished,
    author: {
      '@type': 'Person',
      name: article.authorName,
    },
    url: article.url,
    image: article.imageUrl,
  }
}

/**
 * Helper: JSON-LD Script Tag generieren
 */
export function generateJsonLdScript(data: object) {
  return {
    __html: JSON.stringify(data, null, 2),
  }
}
