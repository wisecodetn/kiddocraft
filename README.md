# KiddoCraft

Boutique en ligne de jeux créatifs pour enfants (tuiles magnétiques, jeux de construction, kits créatifs, jeux éducatifs) — Next.js 16 + PostgreSQL.

- **Français** (langue principale) : `http://localhost:3210/`
- **Arabe** (RTL) : `http://localhost:3210/ar`
- **Administration** (100 % en français) : `http://localhost:3210/admin`

## Démarrage local (sans Docker)

Prérequis : Node.js 20.9+ et PostgreSQL (ici PostgreSQL 18 local, port 5432).

```bash
npm install            # installe les dépendances et génère le client Prisma
npm run db:deploy      # applique les migrations (npm run db:migrate en développement)
npm run db:seed        # catégories, produits, articles de démo + compte admin
npm run dev            # http://localhost:3210
```

La configuration est dans `.env` (modèle : `.env.example`) :

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL (base `kiddocraft`, utilisateur `kiddocraft`) |
| `NEXT_PUBLIC_SITE_URL` | URL publique : liens canoniques, sitemap, données structurées. **À changer en production** (`https://kiddocraft.tn`) |
| `SESSION_SECRET` | Signe le cookie de session admin (32 caractères min.). **À changer en production** |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Premier compte admin créé par le seed |

Créer un autre admin ou réinitialiser un mot de passe :

```bash
npm run admin:create -- email@exemple.tn "mot-de-passe-solide" "Nom"
```

Le port 3210 est utilisé car 3000, 3001 et 3100 sont déjà pris sur cette machine (modifiable dans `package.json`).

## Ce que fait la boutique

- **Commande en 1 minute, sans compte** : panier (tiroir latéral + page panier), formulaire court (nom, téléphone, gouvernorat, ville, adresse), **paiement à la livraison**, bouton « Commander maintenant » qui mène directement au paiement.
- Prix, stock et frais de livraison recalculés côté serveur ; le stock est réservé de façon atomique (pas de survente) et remis en stock si la commande est annulée.
- Livraison payante ou offerte au-delà d'un seuil (réglable dans l'admin), jauge « plus que X DT pour la livraison offerte ».
- Filtres par âge et tri (prix, nouveautés) sur la boutique et les catégories.

## Administration (`/admin`)

- **Tableau de bord** : commandes en attente, chiffre d'affaires du mois, stock faible, dernières commandes.
- **Commandes** : recherche, filtres par statut, fiche client (appel / WhatsApp en un clic), changement de statut.
- **Produits / Catégories / Blog** : formulaires bilingues côte à côte (français + arabe), photos (envoi multiple, réordonnancement, textes alternatifs), adresses (slugs) générées automatiquement dans chaque langue, champs SEO avec compteur de caractères et **aperçu Google** en direct.
- **Paramètres** : frais de livraison, seuil de gratuité, bandeau d'annonce (FR/AR), téléphone, WhatsApp, e-mail, réseaux sociaux, mot de passe.

Les images envoyées sont converties en WebP optimisé (1600 px max) et stockées dans `uploads/` (hors `public/`, servies par `/uploads/…`).

## SEO

- Une URL par langue avec slugs traduits (`/produit/tuiles-magnetiques-…` ↔ `/ar/produit/بلاطات-مغناطيسية-…`), `hreflang` fr / ar / x-default et lien canonique sur chaque page ; un slug ouvert dans la mauvaise langue redirige (308) vers la bonne URL.
- Titres et méta-descriptions personnalisables par page et par langue (repli automatique sur le nom / l'accroche).
- Données structurées JSON-LD : `OnlineStore`, `WebSite`, `Product` (prix TND, disponibilité, livraison, âge), `BreadcrumbList`, `CollectionPage`/`ItemList`, `Blog`/`BlogPosting`, `FAQPage`.
- `sitemap.xml` (toutes les pages dans les deux langues avec alternates et images), `robots.txt`, Open Graph / Twitter, manifeste, favicon.
- Rendu serveur, pages statiques régénérées dès qu'un contenu change dans l'admin, images `next/image` (AVIF/WebP), polices auto-hébergées.

## Structure

```
prisma/              schéma, migrations, seed (données de démo FR/AR)
messages/            textes de l'interface (fr.json, ar.json)
src/app/[locale]/    boutique (accueil, boutique, catégorie, produit, blog, panier, commande, à propos)
src/app/admin/       administration (connexion + panneau)
src/components/      composants boutique, mise en page, admin
src/lib/             accès base de données, SEO, auth, uploads, requêtes
scripts/             génération des visuels de marque et des illustrations de démo
```

Les illustrations de produits de démo (`public/images/seed`) sont générées par `node scripts/placeholder-images.mjs` ; remplacez-les par de vraies photos depuis l'admin. Les visuels de marque (`public/brand`, favicon) viennent du logo et de la bannière via `node scripts/brand-assets.mjs`.

## Production

```bash
npm run build
npm run start
```

Avant la mise en ligne : changer `NEXT_PUBLIC_SITE_URL`, `SESSION_SECRET` et le mot de passe admin, renseigner les vrais contacts dans **Paramètres**, et sauvegarder régulièrement la base et le dossier `uploads/`.
