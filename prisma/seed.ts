// Demo catalogue for KiddoCraft (French + Arabic) and the first admin account.
// Safe to re-run (`npm run db:seed`): rows are matched by their French slug and only created when missing,
// so changes made in the admin are never overwritten.
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }) });
const img = (name: string) => `/images/seed/${name}.webp`;

// ---------------------------------------------------------------- categories

const categories = [
  {
    key: "magnetic",
    slugFr: "tuiles-magnetiques",
    slugAr: "بلاطات-مغناطيسية",
    nameFr: "Tuiles magnétiques",
    nameAr: "بلاطات مغناطيسية",
    descFr:
      "Les **tuiles magnétiques** sont le jeu de construction préféré des enfants : elles s'assemblent en un clic grâce aux aimants sécurisés. Tours, maisons, fusées… tout devient possible, et l'enfant développe sa **logique**, sa **motricité fine** et sa **vision en 3D** en s'amusant.",
    descAr:
      "**البلاطات المغناطيسية** هي لعبة البناء المفضّلة لدى الأطفال: تتركّب بسهولة بفضل مغناطيس آمن ومحكم. أبراج، منازل، صواريخ… كل شيء ممكن، ويطوّر الطفل **المنطق** و**المهارات الحركية الدقيقة** و**الرؤية ثلاثية الأبعاد** وهو يلعب.",
    metaTitleFr: "Tuiles magnétiques pour enfants en Tunisie",
    metaTitleAr: "بلاطات مغناطيسية للأطفال في تونس",
    metaDescFr: "Achetez des tuiles magnétiques pour enfants en Tunisie : sets de 32 à 100 pièces, aimants sécurisés, livraison partout et paiement à la livraison.",
    metaDescAr: "اشترِ بلاطات مغناطيسية للأطفال في تونس: مجموعات من 32 إلى 100 قطعة، مغناطيس آمن، توصيل لكل الولايات والدفع عند الاستلام.",
    image: img("cat-magnetic"),
    color: "blue",
    sortOrder: 1,
  },
  {
    key: "construction",
    slugFr: "jeux-de-construction",
    slugAr: "ألعاب-البناء",
    nameFr: "Jeux de construction",
    nameAr: "ألعاب البناء",
    descFr:
      "Châteaux, véhicules, ponts : nos **jeux de construction** invitent les enfants à imaginer de grands projets et à les réaliser pièce par pièce. Idéal pour apprendre la **patience**, la **planification** et le **travail d'équipe** entre frères et sœurs.",
    descAr:
      "قلاع، سيارات، جسور: **ألعاب البناء** لدينا تدعو الأطفال لتخيّل مشاريع كبيرة وإنجازها قطعة بقطعة. مثالية لتعلّم **الصبر** و**التخطيط** و**العمل الجماعي** بين الإخوة.",
    metaTitleFr: "Jeux de construction pour enfants",
    metaTitleAr: "ألعاب بناء للأطفال",
    metaDescFr: "Jeux de construction créatifs pour enfants de 3 à 12 ans : châteaux, véhicules et grands sets. Livraison en Tunisie, paiement à la livraison.",
    metaDescAr: "ألعاب بناء إبداعية للأطفال من 3 إلى 12 سنة: قلاع وسيارات ومجموعات كبيرة. توصيل في تونس والدفع عند الاستلام.",
    image: img("cat-construction"),
    color: "coral",
    sortOrder: 2,
  },
  {
    key: "craft",
    slugFr: "kits-creatifs",
    slugAr: "علب-الأنشطة-اليدوية",
    nameFr: "Kits créatifs",
    nameAr: "أنشطة يدوية",
    descFr:
      "Pompons, perles, crayons et cure-pipes : nos **kits créatifs** contiennent tout le nécessaire pour des heures de **bricolage** à la maison. Parfait pour les après-midis pluvieux et les anniversaires !",
    descAr:
      "كريات صوف، خرز، أقلام وأسلاك ملوّنة: **علب الأنشطة اليدوية** لدينا تحتوي على كل ما يلزم لساعات من **الإبداع** في المنزل. مثالية لأيام المطر وأعياد الميلاد!",
    metaTitleFr: "Kits créatifs et activités manuelles pour enfants",
    metaTitleAr: "علب أنشطة يدوية وإبداعية للأطفال",
    metaDescFr: "Kits de bricolage pour enfants : pompons, perles, bijoux et coffrets créatifs. Idées cadeaux livrées partout en Tunisie.",
    metaDescAr: "علب أنشطة يدوية للأطفال: كريات صوف، خرز، صنع الأساور وعلب إبداعية. أفكار هدايا مع توصيل لكامل تونس.",
    image: img("cat-craft"),
    color: "yellow",
    sortOrder: 3,
  },
  {
    key: "educational",
    slugFr: "jeux-educatifs",
    slugAr: "ألعاب-تعليمية",
    nameFr: "Jeux éducatifs",
    nameAr: "ألعاب تعليمية",
    descFr:
      "Inspirés de la pédagogie **Montessori**, nos jeux éducatifs accompagnent les tout-petits dans la découverte des **formes**, des **couleurs** et des **chiffres**, à leur rythme.",
    descAr:
      "مستوحاة من بيداغوجيا **مونتيسوري**، ترافق ألعابنا التعليمية الصغار في اكتشاف **الأشكال** و**الألوان** و**الأرقام** حسب نسقهم.",
    metaTitleFr: "Jeux éducatifs Montessori pour tout-petits",
    metaTitleAr: "ألعاب تعليمية مونتيسوري للصغار",
    metaDescFr: "Jeux éducatifs et Montessori pour enfants de 1 à 5 ans : formes, couleurs, chiffres et puzzles. Livraison en Tunisie.",
    metaDescAr: "ألعاب تعليمية ومونتيسوري للأطفال من سنة إلى 5 سنوات: أشكال، ألوان، أرقام وألغاز. توصيل في تونس.",
    image: img("cat-educational"),
    color: "green",
    sortOrder: 4,
  },
];

// ---------------------------------------------------------------- products

type SeedProduct = {
  cat: string;
  slugFr: string;
  slugAr: string;
  nameFr: string;
  nameAr: string;
  shortDescFr: string;
  shortDescAr: string;
  bulletsFr: string[];
  bulletsAr: string[];
  price: number;
  compareAtPrice?: number;
  stock: number;
  ageMin: number;
  ageMax: number;
  pieces?: number;
  featured?: boolean;
  images: string[];
  sku: string;
};

const products: SeedProduct[] = [
  {
    cat: "magnetic",
    sku: "KC-MAG-100",
    slugFr: "tuiles-magnetiques-grand-batisseur-100-pieces",
    slugAr: "بلاطات-مغناطيسية-البناء-الكبير-100-قطعة",
    nameFr: "Tuiles magnétiques Grand Bâtisseur – 100 pièces",
    nameAr: "بلاطات مغناطيسية البنّاء الكبير – 100 قطعة",
    shortDescFr: "Le grand set pour construire tours, maisons et châteaux en famille. Aimants puissants et sécurisés.",
    shortDescAr: "المجموعة الكبيرة لبناء الأبراج والمنازل والقلاع مع العائلة. مغناطيس قوي وآمن.",
    bulletsFr: ["100 pièces : carrés, triangles et grandes plaques", "Aimants scellés et bords arrondis", "Couleurs translucides qui jouent avec la lumière", "Livré dans une boîte de rangement"],
    bulletsAr: ["100 قطعة: مربعات ومثلثات وألواح كبيرة", "مغناطيس محكم الإغلاق وحواف مستديرة", "ألوان شفافة تتلاعب بالضوء", "يأتي في علبة تخزين"],
    price: 189,
    compareAtPrice: 229,
    stock: 24,
    ageMin: 3,
    ageMax: 10,
    pieces: 100,
    featured: true,
    images: ["grand-set", "grand-set-2"],
  },
  {
    cat: "magnetic",
    sku: "KC-MAG-060",
    slugFr: "tuiles-magnetiques-arc-en-ciel-60-pieces",
    slugAr: "بلاطات-مغناطيسية-قوس-قزح-60-قطعة",
    nameFr: "Tuiles magnétiques Arc-en-ciel – 60 pièces",
    nameAr: "بلاطات مغناطيسية قوس قزح – 60 قطعة",
    shortDescFr: "Le set idéal pour débuter : assez de pièces pour des tours vertigineuses et des formes en 3D.",
    shortDescAr: "المجموعة المثالية للبداية: قطع كافية لأبراج شاهقة وأشكال ثلاثية الأبعاد.",
    bulletsFr: ["60 pièces aux couleurs de l'arc-en-ciel", "Compatible avec toutes nos tuiles", "Guide d'idées de constructions inclus"],
    bulletsAr: ["60 قطعة بألوان قوس قزح", "متوافقة مع كل بلاطاتنا", "دليل أفكار للبناء مرفق"],
    price: 129,
    stock: 40,
    ageMin: 3,
    ageMax: 8,
    pieces: 60,
    featured: true,
    images: ["tower-set", "tower-set-2"],
  },
  {
    cat: "magnetic",
    sku: "KC-MAG-032",
    slugFr: "kit-decouverte-tuiles-magnetiques-32-pieces",
    slugAr: "علبة-الاكتشاف-بلاطات-مغناطيسية-32-قطعة",
    nameFr: "Kit Découverte – 32 tuiles magnétiques",
    nameAr: "علبة الاكتشاف – 32 بلاطة مغناطيسية",
    shortDescFr: "Un premier kit compact pour découvrir les formes et les aimants. Parfait comme cadeau.",
    shortDescAr: "علبة أولى صغيرة لاكتشاف الأشكال والمغناطيس. هدية مثالية.",
    bulletsFr: ["32 pièces : carrés et triangles", "Format voyage", "Idéal pour les petites mains"],
    bulletsAr: ["32 قطعة: مربعات ومثلثات", "حجم مناسب للسفر", "مثالية للأيدي الصغيرة"],
    price: 69,
    stock: 55,
    ageMin: 3,
    ageMax: 6,
    pieces: 32,
    images: ["starter-set", "car-set-2"],
  },
  {
    cat: "magnetic",
    sku: "KC-MAG-HOUSE",
    slugFr: "maison-magique-tuiles-magnetiques-46-pieces",
    slugAr: "المنزل-السحري-بلاطات-مغناطيسية-46-قطعة",
    nameFr: "Maison magique – 46 pièces",
    nameAr: "المنزل السحري – 46 قطعة",
    shortDescFr: "Construisez la maison de vos rêves avec portes, fenêtres et toits en triangle.",
    shortDescAr: "ابنِ منزل أحلامك بالأبواب والنوافذ والأسطح المثلثة.",
    bulletsFr: ["46 pièces dont portes et fenêtres", "Développe l'imagination et le jeu de rôle", "Fiches modèles incluses"],
    bulletsAr: ["46 قطعة منها أبواب ونوافذ", "ينمّي الخيال ولعب الأدوار", "بطاقات نماذج مرفقة"],
    price: 99,
    stock: 18,
    ageMin: 3,
    ageMax: 7,
    pieces: 46,
    images: ["house-set"],
  },
  {
    cat: "magnetic",
    sku: "KC-MAG-ROCKET",
    slugFr: "fusee-de-l-espace-tuiles-magnetiques-40-pieces",
    slugAr: "صاروخ-الفضاء-بلاطات-مغناطيسية-40-قطعة",
    nameFr: "Fusée de l'espace – 40 pièces",
    nameAr: "صاروخ الفضاء – 40 قطعة",
    shortDescFr: "3, 2, 1… décollage ! Un set pour les petits astronautes qui rêvent d'étoiles.",
    shortDescAr: "3، 2، 1… انطلاق! مجموعة لروّاد الفضاء الصغار الذين يحلمون بالنجوم.",
    bulletsFr: ["40 pièces dont hublots et ailerons", "Thème espace pour des histoires sans fin", "Se combine avec les autres sets"],
    bulletsAr: ["40 قطعة منها نوافذ وأجنحة", "موضوع الفضاء لقصص لا تنتهي", "يتركّب مع المجموعات الأخرى"],
    price: 89.9,
    stock: 3,
    ageMin: 4,
    ageMax: 8,
    pieces: 40,
    featured: true,
    images: ["rocket-set"],
  },
  {
    cat: "magnetic",
    sku: "KC-MAG-076",
    slugFr: "ponts-et-tours-tuiles-magnetiques-76-pieces",
    slugAr: "جسور-وأبراج-بلاطات-مغناطيسية-76-قطعة",
    nameFr: "Ponts & tours – 76 pièces",
    nameAr: "جسور وأبراج – 76 قطعة",
    shortDescFr: "Des petites tuiles pour des ponts, des arches et des défis d'équilibre.",
    shortDescAr: "بلاطات صغيرة لبناء الجسور والأقواس وتحديات التوازن.",
    bulletsFr: ["76 pièces de 3 tailles", "Défis d'équilibre et de symétrie", "Excellent pour la concentration"],
    bulletsAr: ["76 قطعة بثلاثة أحجام", "تحديات التوازن والتناظر", "ممتازة للتركيز"],
    price: 149,
    stock: 12,
    ageMin: 4,
    ageMax: 10,
    pieces: 76,
    images: ["bridge-set", "tower-set-2"],
  },
  {
    cat: "construction",
    sku: "KC-CON-CASTLE",
    slugFr: "chateau-des-aventuriers-120-pieces",
    slugAr: "قلعة-المغامرين-120-قطعة",
    nameFr: "Château des aventuriers – 120 pièces",
    nameAr: "قلعة المغامرين – 120 قطعة",
    shortDescFr: "Le grand projet du week-end : tours, remparts et pont-levis pour chevaliers et princesses.",
    shortDescAr: "مشروع عطلة نهاية الأسبوع: أبراج وأسوار وجسر متحرّك للفرسان والأميرات.",
    bulletsFr: ["120 pièces dont arches et portes", "Se joue à plusieurs", "Notice illustrée pas à pas"],
    bulletsAr: ["120 قطعة منها أقواس وأبواب", "يُلعب جماعيًا", "دليل مصوّر خطوة بخطوة"],
    price: 219,
    compareAtPrice: 249,
    stock: 9,
    ageMin: 5,
    ageMax: 12,
    pieces: 120,
    featured: true,
    images: ["castle-set", "grand-set-2"],
  },
  {
    cat: "construction",
    sku: "KC-CON-CARS",
    slugFr: "vehicules-magnetiques-36-pieces",
    slugAr: "سيارات-مغناطيسية-36-قطعة",
    nameFr: "Véhicules magnétiques – 36 pièces avec roues",
    nameAr: "سيارات مغناطيسية – 36 قطعة مع عجلات",
    shortDescFr: "Voitures, camions et bus qui roulent vraiment ! Les bases à roues se fixent sur toutes les tuiles.",
    shortDescAr: "سيارات وشاحنات وحافلات تتحرّك فعلًا! القواعد بالعجلات تُثبّت على كل البلاطات.",
    bulletsFr: ["36 pièces dont 2 bases à roues", "Roues silencieuses", "Idéal pour les fans de voitures"],
    bulletsAr: ["36 قطعة منها قاعدتان بعجلات", "عجلات صامتة", "مثالية لمحبّي السيارات"],
    price: 79,
    stock: 30,
    ageMin: 3,
    ageMax: 7,
    pieces: 36,
    featured: true,
    images: ["car-set", "car-set-2"],
  },
  {
    cat: "craft",
    sku: "KC-ART-POMPOM",
    slugFr: "kit-creatif-pompons-et-cure-pipes",
    slugAr: "علبة-إبداعية-كريات-صوف-وأسلاك",
    nameFr: "Kit créatif pompons & cure-pipes",
    nameAr: "علبة إبداعية كريات صوف وأسلاك ملوّنة",
    shortDescFr: "Pompons, yeux mobiles, cure-pipes et crayons pour créer des petits monstres rigolos.",
    shortDescAr: "كريات صوف، عيون متحرّكة، أسلاك وأقلام لصنع وحوش صغيرة مضحكة.",
    bulletsFr: ["Plus de 300 éléments", "Colle et ciseaux à bouts ronds inclus", "Livret de 20 idées"],
    bulletsAr: ["أكثر من 300 عنصر", "غراء ومقص بأطراف مستديرة", "كتيّب 20 فكرة"],
    price: 45,
    stock: 35,
    ageMin: 4,
    ageMax: 9,
    featured: true,
    images: ["craft-kit"],
  },
  {
    cat: "craft",
    sku: "KC-ART-BEADS",
    slugFr: "atelier-bijoux-perles-et-lettres",
    slugAr: "ورشة-الأساور-خرز-وحروف",
    nameFr: "Atelier bijoux – perles & lettres",
    nameAr: "ورشة الأساور – خرز وحروف",
    shortDescFr: "Bracelets prénoms, colliers colorés : un atelier bijoux complet pour créer et offrir.",
    shortDescAr: "أساور بالأسماء وقلائد ملوّنة: ورشة كاملة للإبداع والإهداء.",
    bulletsFr: ["Perles lettres, cœurs et étoiles", "Fil élastique et fermoirs", "Boîte de rangement à compartiments"],
    bulletsAr: ["خرز حروف وقلوب ونجوم", "خيط مطاطي ومشابك", "علبة تخزين بخانات"],
    price: 39.5,
    stock: 22,
    ageMin: 5,
    ageMax: 12,
    images: ["beads-kit"],
  },
  {
    cat: "craft",
    sku: "KC-ART-MEGA",
    slugFr: "mega-coffret-creatif-500-pieces",
    slugAr: "العلبة-الإبداعية-الكبرى-500-قطعة",
    nameFr: "Méga coffret créatif – 500 pièces",
    nameAr: "العلبة الإبداعية الكبرى – 500 قطعة",
    shortDescFr: "Le coffret cadeau ultime : peinture, pompons, gommettes, papier et bien plus.",
    shortDescAr: "علبة الهدايا المثالية: ألوان، كريات صوف، ملصقات، أوراق والمزيد.",
    bulletsFr: ["500 pièces créatives", "Valisette de transport", "Parfait pour les anniversaires"],
    bulletsAr: ["500 قطعة إبداعية", "حقيبة صغيرة للحمل", "مثالية لأعياد الميلاد"],
    price: 85,
    stock: 14,
    ageMin: 4,
    ageMax: 10,
    pieces: 500,
    featured: true,
    images: ["pompom-kit", "craft-kit"],
  },
  {
    cat: "educational",
    sku: "KC-EDU-SHAPES",
    slugFr: "planche-montessori-formes-et-couleurs",
    slugAr: "لوحة-مونتيسوري-الأشكال-والألوان",
    nameFr: "Planche Montessori formes & couleurs",
    nameAr: "لوحة مونتيسوري الأشكال والألوان",
    shortDescFr: "Une planche en bois à encastrer pour apprendre les formes et les couleurs dès 1 an.",
    shortDescAr: "لوحة خشبية للتركيب لتعلّم الأشكال والألوان من عمر السنة.",
    bulletsFr: ["Bois naturel et peinture à l'eau", "6 formes à grosses prises", "Développe la coordination œil-main"],
    bulletsAr: ["خشب طبيعي وطلاء مائي", "6 أشكال بمقابض كبيرة", "ينمّي التنسيق بين العين واليد"],
    price: 35,
    stock: 28,
    ageMin: 1,
    ageMax: 3,
    pieces: 6,
    featured: true,
    images: ["shapes-board"],
  },
  {
    cat: "educational",
    sku: "KC-EDU-PUZZLE",
    slugFr: "puzzle-des-chiffres-en-bois",
    slugAr: "لغز-الأرقام-الخشبي",
    nameFr: "Puzzle des chiffres en bois",
    nameAr: "لغز الأرقام الخشبي",
    shortDescFr: "Apprendre à compter de 1 à 4 en assemblant de grosses pièces colorées.",
    shortDescAr: "تعلّم العدّ من 1 إلى 4 بتركيب قطع ملوّنة كبيرة.",
    bulletsFr: ["Grosses pièces faciles à saisir", "Couleurs vives et chiffres en relief", "Bois certifié"],
    bulletsAr: ["قطع كبيرة سهلة الإمساك", "ألوان زاهية وأرقام بارزة", "خشب معتمد"],
    price: 29,
    stock: 40,
    ageMin: 2,
    ageMax: 5,
    pieces: 4,
    images: ["puzzle-numbers"],
  },
  {
    cat: "educational",
    sku: "KC-EDU-GEO",
    slugFr: "coffret-eveil-formes-geometriques",
    slugAr: "علبة-الإيقاظ-الأشكال-الهندسية",
    nameFr: "Coffret éveil formes géométriques",
    nameAr: "علبة الإيقاظ الأشكال الهندسية",
    shortDescFr: "Trier, empiler, nommer : un coffret d'éveil complet pour les tout-petits.",
    shortDescAr: "فرز، تكديس، تسمية: علبة إيقاظ متكاملة للصغار.",
    bulletsFr: ["24 formes en bois", "Boîte à trier", "Cartes d'activités"],
    bulletsAr: ["24 شكلًا خشبيًا", "علبة للفرز", "بطاقات أنشطة"],
    price: 55,
    stock: 0,
    ageMin: 1,
    ageMax: 4,
    pieces: 24,
    images: ["shapes-board", "starter-set"],
  },
];

function describeFr(p: SeedProduct) {
  return `## Pourquoi les enfants l'adorent
${p.bulletsFr.map((b) => `- ${b}`).join("\n")}

## Ce que votre enfant développe
- **Créativité** : il invente ses propres modèles, sans limite.
- **Motricité fine** : saisir, assembler et équilibrer les pièces.
- **Confiance en soi** : la fierté de réaliser sa propre création.

> Conseil KiddoCraft : jouez avec lui les 10 premières minutes, puis laissez-le inventer. C'est là que la magie opère !

*Âge recommandé : ${p.ageMin} à ${p.ageMax} ans. Utilisation sous la surveillance d'un adulte.*`;
}

function describeAr(p: SeedProduct) {
  return `## لماذا يحبّه الأطفال
${p.bulletsAr.map((b) => `- ${b}`).join("\n")}

## ما ينمّيه طفلك
- **الإبداع**: يخترع نماذجه الخاصة دون حدود.
- **المهارات الحركية الدقيقة**: الإمساك والتركيب وموازنة القطع.
- **الثقة بالنفس**: الفخر بإنجاز إبداعه الخاص.

> نصيحة كيدو كرافت: العب معه في الدقائق العشر الأولى ثم اتركه يبتكر. هنا يحدث السحر!

*السن المنصوح به: من ${p.ageMin} إلى ${p.ageMax} سنوات. يُستعمل تحت إشراف شخص بالغ.*`;
}

// ---------------------------------------------------------------- blog

const posts = [
  {
    slugFr: "bienfaits-des-tuiles-magnetiques-pour-enfant",
    slugAr: "فوائد-البلاطات-المغناطيسية-للطفل",
    titleFr: "7 bienfaits des tuiles magnétiques pour le développement de l'enfant",
    titleAr: "7 فوائد للبلاطات المغناطيسية في نموّ الطفل",
    excerptFr: "Bien plus qu'un jouet : les tuiles magnétiques stimulent la logique, la créativité et la confiance en soi. On vous explique pourquoi.",
    excerptAr: "أكثر من مجرّد لعبة: البلاطات المغناطيسية تحفّز المنطق والإبداع والثقة بالنفس. إليك السبب.",
    coverImage: img("blog-benefits"),
    publishedAt: new Date("2026-09-02T09:00:00Z"),
    contentFr: `Les tuiles magnétiques ont conquis les chambres d'enfants du monde entier, et ce n'est pas un hasard. Derrière leurs couleurs vives se cache un formidable outil d'apprentissage.

## 1. Elles développent la pensée en 3D
En transformant des formes plates (carrés, triangles) en cubes, pyramides et tours, l'enfant comprend intuitivement la **géométrie dans l'espace**.

## 2. Elles renforcent la motricité fine
Saisir, orienter et assembler les pièces fait travailler les petits muscles de la main, essentiels pour **l'écriture**.

## 3. Elles stimulent la créativité
Il n'y a pas de modèle imposé : une maison peut devenir un vaisseau spatial en quelques secondes.

## 4. Elles apprennent la persévérance
Une tour qui tombe ? On recommence, en mieux. L'enfant apprend que l'erreur fait partie du jeu.

## 5. Elles initient aux sciences
Pourquoi les aimants s'attirent-ils ? Pourquoi la lumière traverse-t-elle les tuiles ? Autant de questions qui éveillent la **curiosité scientifique**.

## 6. Elles favorisent le jeu partagé
Frères, sœurs, parents : chacun construit sa partie d'un grand projet commun.

## 7. Elles grandissent avec l'enfant
À 3 ans, on empile ; à 8 ans, on construit des châteaux à plusieurs étages. Un jouet qui dure des années !

> Envie d'essayer ? Le [Kit Découverte](/produit/kit-decouverte-tuiles-magnetiques-32-pieces) est parfait pour commencer.`,
    contentAr: `غزت البلاطات المغناطيسية غرف الأطفال في كل أنحاء العالم، وليس ذلك صدفة. وراء ألوانها الزاهية أداة تعلّم رائعة.

## 1. تنمّي التفكير ثلاثي الأبعاد
بتحويل الأشكال المسطّحة إلى مكعبات وأهرامات وأبراج، يفهم الطفل **الهندسة في الفضاء** بشكل طبيعي.

## 2. تقوّي المهارات الحركية الدقيقة
الإمساك بالقطع وتوجيهها وتركيبها يشغّل عضلات اليد الصغيرة الضرورية **للكتابة**.

## 3. تحفّز الإبداع
لا يوجد نموذج مفروض: قد يتحوّل المنزل إلى مركبة فضائية في ثوانٍ.

## 4. تعلّم المثابرة
سقط البرج؟ نعيد البناء بشكل أفضل. يتعلّم الطفل أن الخطأ جزء من اللعب.

## 5. تقدّم العلوم بطريقة ممتعة
لماذا يتجاذب المغناطيس؟ لماذا يعبر الضوء البلاطات؟ أسئلة توقظ **الفضول العلمي**.

## 6. تشجّع اللعب الجماعي
الإخوة والأولياء: كلّ يبني جزءًا من مشروع مشترك كبير.

## 7. تكبر مع الطفل
في الثالثة نكدّس، وفي الثامنة نبني قلاعًا من عدّة طوابق. لعبة تدوم سنوات!`,
  },
  {
    slugFr: "quel-jeu-de-construction-choisir-selon-l-age",
    slugAr: "أي-لعبة-بناء-تختار-حسب-السن",
    titleFr: "Quel jeu de construction choisir selon l'âge de votre enfant ?",
    titleAr: "أي لعبة بناء تختار حسب سنّ طفلك؟",
    excerptFr: "De 1 à 12 ans, les besoins changent. Notre guide simple pour offrir le bon jeu au bon moment.",
    excerptAr: "من سنة إلى 12 سنة تتغيّر الاحتياجات. دليلنا البسيط لاختيار اللعبة المناسبة في الوقت المناسب.",
    coverImage: img("blog-age"),
    publishedAt: new Date("2026-09-18T09:00:00Z"),
    contentFr: `Choisir un jeu adapté à l'âge de l'enfant, c'est la garantie qu'il ne sera ni frustré, ni lassé. Voici nos repères.

## De 1 à 3 ans : découvrir
Les tout-petits explorent avec les mains et la bouche. Privilégiez les **grosses pièces en bois**, les planches à encastrer et les jeux de tri des formes et couleurs.

## De 3 à 5 ans : construire
C'est l'âge d'or des **tuiles magnétiques** : les pièces s'assemblent facilement, sans frustration. Un set de 32 à 60 pièces est idéal.

## De 6 à 8 ans : relever des défis
L'enfant aime suivre des modèles puis les transformer. Les sets thématiques (véhicules, fusées, maisons) et les **kits créatifs** le passionnent.

## De 9 à 12 ans : réaliser de grands projets
Place aux grands sets de 100 pièces et plus, aux châteaux et aux créations de bijoux. L'enfant planifie et construit sur plusieurs jours.

### Notre astuce
Tous nos sets de tuiles magnétiques sont **compatibles entre eux** : commencez petit et agrandissez la collection au fil des anniversaires !`,
    contentAr: `اختيار لعبة تناسب سنّ الطفل يضمن أنه لن يشعر بالإحباط أو الملل. إليك مرجعنا.

## من سنة إلى 3 سنوات: الاكتشاف
يستكشف الصغار بأيديهم. اختر **القطع الخشبية الكبيرة** ولوحات التركيب وألعاب فرز الأشكال والألوان.

## من 3 إلى 5 سنوات: البناء
إنه العصر الذهبي **للبلاطات المغناطيسية**: تتركّب القطع بسهولة ودون إحباط. مجموعة من 32 إلى 60 قطعة مثالية.

## من 6 إلى 8 سنوات: التحدّيات
يحب الطفل اتباع النماذج ثم تغييرها. المجموعات ذات المواضيع و**علب الأنشطة اليدوية** تشدّه.

## من 9 إلى 12 سنة: المشاريع الكبيرة
حان وقت المجموعات الكبيرة من 100 قطعة فأكثر والقلاع وصنع الأساور.

### نصيحتنا
كل مجموعات البلاطات المغناطيسية لدينا **متوافقة فيما بينها**: ابدأ بمجموعة صغيرة ثم وسّعها مع كل عيد ميلاد!`,
  },
  {
    slugFr: "10-idees-de-constructions-avec-tuiles-magnetiques",
    slugAr: "10-أفكار-للبناء-بالبلاطات-المغناطيسية",
    titleFr: "10 idées de constructions faciles avec des tuiles magnétiques",
    titleAr: "10 أفكار سهلة للبناء بالبلاطات المغناطيسية",
    excerptFr: "En panne d'inspiration ? Voici 10 constructions à réaliser en famille, du plus simple au plus ambitieux.",
    excerptAr: "ينقصك الإلهام؟ إليك 10 أفكار للبناء مع العائلة، من الأبسط إلى الأكثر طموحًا.",
    coverImage: img("blog-ideas"),
    publishedAt: new Date("2026-10-05T09:00:00Z"),
    contentFr: `Vos enfants ont construit 100 fois la même tour ? Voici de quoi relancer l'imagination.

1. **Le cube magique** : 6 carrés, le premier défi en 3D.
2. **La pyramide** : 4 triangles et 1 carré.
3. **La maison** : des murs carrés et un toit en triangles.
4. **La tour arc-en-ciel** : une couleur par étage !
5. **Le garage** pour les petites voitures.
6. **La fusée** : un long corps et des ailerons en triangles.
7. **Le pont** entre deux tours.
8. **Le zoo** : des enclos pour les animaux en plastique.
9. **La lanterne** : placez une petite lampe à l'intérieur et éteignez la lumière.
10. **Le château** : tours, remparts et pont-levis pour les plus grands.

> Astuce : photographiez chaque création ! Votre enfant sera fier de son « album d'architecte ».`,
    contentAr: `بنى أطفالك نفس البرج مئة مرة؟ إليك ما يعيد إطلاق خيالهم.

1. **المكعّب السحري**: 6 مربعات، أول تحدٍّ ثلاثي الأبعاد.
2. **الهرم**: 4 مثلثات ومربع.
3. **المنزل**: جدران مربعة وسقف من المثلثات.
4. **برج قوس قزح**: لون لكل طابق!
5. **المرآب** للسيارات الصغيرة.
6. **الصاروخ**: جسم طويل وأجنحة مثلثة.
7. **الجسر** بين برجين.
8. **حديقة الحيوانات**: حظائر للحيوانات البلاستيكية.
9. **الفانوس**: ضع مصباحًا صغيرًا بالداخل وأطفئ الضوء.
10. **القلعة**: أبراج وأسوار وجسر متحرّك للكبار.

> نصيحة: صوّر كل إبداع! سيفخر طفلك بـ«ألبوم المهندس» الخاص به.`,
  },
  {
    slugFr: "activites-manuelles-a-la-maison-5-bricolages",
    slugAr: "أنشطة-يدوية-في-المنزل-5-أفكار",
    titleFr: "Activités manuelles à la maison : 5 bricolages pour un après-midi pluvieux",
    titleAr: "أنشطة يدوية في المنزل: 5 أفكار لعصر ممطر",
    excerptFr: "Pompons, perles et cure-pipes : 5 activités simples, sans écran, pour occuper les enfants avec le sourire.",
    excerptAr: "كريات صوف، خرز وأسلاك ملوّنة: 5 أنشطة بسيطة بعيدًا عن الشاشات لإسعاد الأطفال.",
    coverImage: img("blog-crafts"),
    publishedAt: new Date("2026-10-15T09:00:00Z"),
    contentFr: `Il pleut, les enfants tournent en rond ? Sortez le kit créatif !

## 1. Les petits monstres pompons
Collez des yeux mobiles sur des pompons, ajoutez des pattes en cure-pipes : chaque monstre a son prénom.

## 2. Le bracelet prénom
Avec des perles lettres, chaque enfant crée son bracelet… ou celui d'un copain.

## 3. La chenille arc-en-ciel
Des pompons collés en ligne sur un carton : simple et parfait pour les plus petits.

## 4. Les lunettes rigolotes
Un cure-pipe tordu en forme de lunettes, décoré de perles et de gommettes.

## 5. Le tableau de pompons
Dessinez une forme simple et remplissez-la de pompons de couleurs.

### Pour bien démarrer
- Protégez la table avec une vieille nappe.
- Préparez des petits bols pour trier les éléments.
- Laissez l'enfant décider : l'important, c'est le plaisir, pas le résultat parfait !`,
    contentAr: `السماء تمطر والأطفال يشعرون بالملل؟ أخرج العلبة الإبداعية!

## 1. الوحوش الصغيرة
ألصق عيونًا متحرّكة على كريات الصوف وأضف أرجلًا من الأسلاك: لكل وحش اسمه.

## 2. سوار الاسم
بخرز الحروف يصنع كل طفل سواره… أو سوار صديقه.

## 3. دودة قوس قزح
كريات صوف ملصقة في خط على ورق مقوّى: بسيطة ومثالية للصغار.

## 4. النظارات المضحكة
سلك ملوّن على شكل نظارة مزيّن بالخرز والملصقات.

## 5. لوحة الكريات
ارسم شكلًا بسيطًا واملأه بكريات صوف ملوّنة.

### للبداية
- احمِ الطاولة بمفرش قديم.
- جهّز أوعية صغيرة لفرز العناصر.
- اترك الطفل يقرّر: الأهم هو المتعة وليس النتيجة المثالية!`,
  },
];

// ---------------------------------------------------------------- run

async function main() {
  const catIds = new Map<string, string>();
  for (const { key, ...c } of categories) {
    const row = await db.category.upsert({ where: { slugFr: c.slugFr }, update: {}, create: c });
    catIds.set(key, row.id);
  }

  for (const p of products) {
    const data = {
      slugFr: p.slugFr,
      slugAr: p.slugAr,
      nameFr: p.nameFr,
      nameAr: p.nameAr,
      shortDescFr: p.shortDescFr,
      shortDescAr: p.shortDescAr,
      descFr: describeFr(p),
      descAr: describeAr(p),
      metaDescFr: "",
      metaDescAr: "",
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      sku: p.sku,
      stock: p.stock,
      ageMin: p.ageMin,
      ageMax: p.ageMax,
      pieces: p.pieces ?? null,
      isFeatured: p.featured ?? false,
      categoryId: catIds.get(p.cat)!,
    };
    const existing = await db.product.findUnique({ where: { slugFr: p.slugFr }, select: { id: true } });
    if (existing) continue;
    const row = await db.product.create({ data });
    await db.productImage.createMany({
      data: p.images.map((name, i) => ({ productId: row.id, url: img(name), altFr: i === 0 ? p.nameFr : `${p.nameFr} – vue ${i + 1}`, altAr: i === 0 ? p.nameAr : `${p.nameAr} – صورة ${i + 1}`, sortOrder: i })),
    });
  }

  for (const post of posts) {
    const data = { ...post, isPublished: true };
    await db.blogPost.upsert({ where: { slugFr: post.slugFr }, update: {}, create: data });
  }

  await db.settings.upsert({
    where: { id: "site" },
    update: {},
    create: { id: "site", shippingFee: 7, freeShippingFrom: 150, phone: "+216 20 000 000", whatsapp: "21620000000", email: "contact@kiddocraft.tn" },
  });

  const email = (process.env.ADMIN_EMAIL ?? "admin@kiddocraft.tn").toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (password && !(await db.adminUser.findUnique({ where: { email } }))) {
    await db.adminUser.create({ data: { email, name: "Administrateur", passwordHash: await hashPassword(password) } });
    console.log(`Admin created: ${email}`);
  }

  console.log(`Seeded ${categories.length} categories, ${products.length} products, ${posts.length} posts.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
