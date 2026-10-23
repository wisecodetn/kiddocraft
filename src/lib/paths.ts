// Storefront URL scheme. Path segments stay French in both languages; slugs are translated.
type Slugged = { slugFr: string; slugAr: string };

/** The same page in both languages: paths differ when slugs are translated. */
export type PagePaths = { fr: string; ar: string };

export const paths = {
  home: { fr: "/", ar: "/" },
  shop: { fr: "/boutique", ar: "/boutique" },
  blog: { fr: "/blog", ar: "/blog" },
  cart: { fr: "/panier", ar: "/panier" },
  about: { fr: "/a-propos", ar: "/a-propos" },
  category: (c: Slugged) => ({ fr: `/categorie/${c.slugFr}`, ar: `/categorie/${c.slugAr}` }),
  product: (p: Slugged) => ({ fr: `/produit/${p.slugFr}`, ar: `/produit/${p.slugAr}` }),
  post: (p: Slugged) => ({ fr: `/blog/${p.slugFr}`, ar: `/blog/${p.slugAr}` }),
};
