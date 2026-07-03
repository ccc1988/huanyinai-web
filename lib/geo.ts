import { company, industries, cases } from "./data";

/** Organization JSON-LD */
export function getOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: company.fullName,
    alternateName: company.shortName,
    description: company.description,
    foundingDate: company.foundingDate,
    url: company.website,
    email: company.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: company.location,
      addressCountry: "CN",
    },
    knowsAbout: [
      "AI 智能体",
      "RPA 自动化",
      "AI 文档处理",
      "企业 AI 转型",
      "物流 AI",
      "跨境电商 AI",
    ],
  };
}

/** Service JSON-LD for industry pages */
export function getServiceJsonLd(slug: string) {
  const industry = industries.find((i) => i.slug === slug);
  if (!industry) return null;

  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: industry.title,
    description: industry.solutionSummary,
    serviceType: industry.title,
    provider: {
      "@type": "Organization",
      name: company.fullName,
    },
    areaServed: "CN",
  };
}

/** CaseStudy JSON-LD for case detail pages */
export function getCaseStudyJsonLd(slug: string) {
  const caseItem = cases.find((c) => c.slug === slug);
  if (!caseItem) return null;

  return {
    "@context": "https://schema.org",
    "@type": "CaseStudy",
    name: caseItem.title,
    description: caseItem.oneLiner,
    about: caseItem.industry,
    creator: {
      "@type": "Organization",
      name: company.fullName,
    },
    mentions: caseItem.relatedCustomers.map((name) => ({
      "@type": "Organization",
      name,
    })),
  };
}

/** FAQPage JSON-LD */
export function getFaqJsonLd(faq: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

/** BlogPosting JSON-LD */
export function getBlogPostJsonLd(post: {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  slug: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: company.fullName,
    },
    mainEntityOfPage: `${company.website}/blog/${post.slug}`,
  };
}
