// Centralized JS configuration file for page content, images, item details, and price cards.
// Modify this file to update any items, images, prices, banners, or reviews on the home page.

import suspensionImg from "@/assets/cat-suspension.jpg";
import armorImg from "@/assets/cat-armor.jpg";
import wheelsImg from "@/assets/cat-wheels.jpg";
import recoveryImg from "@/assets/cat-recovery.jpg";
import lightingImg from "@/assets/cat-lighting.jpg";
import drivetrainImg from "@/assets/cat-drivetrain.jpg";

// Hero Banner Data
export const heroData = {
  badge: "Built for Wrangler, Jimny & Thar",
  title: "Parts that go where the pavement ends.",
  description:
    "Trail-tested lift kits, armor, wheels and recovery gear — with guaranteed fitment and expert support.",
  image: "/images/hero.png",
  alt: "YSK 4x4 off-road Suzuki Jimny with rugged build",
  primaryCta: {
    label: "Shop all parts",
    link: "/shop",
  },
  secondaryCta: {
    label: "View deals",
    link: "/deals",
  },
};

// Trust & Guarantee Badges
export const trustBadges = [
  { id: "shipping", icon: "Truck", title: "Free shipping over $199" },
  { id: "fitment", icon: "ShieldCheck", title: "Guaranteed fitment" },
  { id: "returns", icon: "RotateCcw", title: "30-day returns" },
  { id: "support", icon: "Wrench", title: "Expert install help" },
];

// Product Categories
export const categoriesData = [
  {
    slug: "suspension",
    name: "Suspension",
    description: "Lift kits, shocks, coilovers and control arms engineered for extreme articulation.",
    image: suspensionImg,
  },
  {
    slug: "armor",
    name: "Armor",
    description: "Steel bumpers, rock sliders and heavy-duty skid plates built to take a beating.",
    image: armorImg,
  },
  {
    slug: "wheels",
    name: "Wheels & Tires",
    description: "Beadlock wheels and aggressive all-terrain/mud-terrain tires for every trail.",
    image: wheelsImg,
  },
  {
    slug: "recovery",
    name: "Recovery",
    description: "High-capacity winches, kinetic ropes, shackles and recovery gear to get you home.",
    image: recoveryImg,
  },
  {
    slug: "lighting",
    name: "Lighting",
    description: "Ultra-bright LED light bars, auxiliary pods and projector headlights that turn night into day.",
    image: lightingImg,
  },
  {
    slug: "drivetrain",
    name: "Drivetrain",
    description: "Lockers, gear sets and heavy-duty axle shafts for unmatched rock-crawling torque.",
    image: drivetrainImg,
  },
];

// Compatibility Fitment tags
const fitsJL = ["Wrangler JL", "Gladiator JT"];
const fitsJK = ["Wrangler JK"];
const fitsAll = ["Wrangler JL", "Wrangler JK", "Gladiator JT", "Jimny", "Thar"];

// All Product Items with Complete Image Details and Price Cards
export const productsData = [
  {
    slug: "trailmaster-35-lift-kit",
    name: "TrailMaster 3.5\" Lift Kit",
    brand: "Ridgeline",
    category: "suspension",
    price: 1849,
    compareAt: 2099,
    rating: 4.8,
    reviews: 214,
    stock: 12,
    fits: fitsJL,
    image: suspensionImg,
    bestSeller: true,
    isNew: false,
    description:
      "A complete 3.5-inch lift with dual-rate coils, remote-reservoir shocks and adjustable control arms. Clears 37\" tires with no cutting.",
    specs: {
      Lift: "3.5 in",
      "Max tire": "37 in",
      Shocks: "2.5\" remote reservoir",
      Warranty: "Lifetime",
    },
    options: { label: "Lift height", values: ["2.5\"", "3.5\"", "4.5\""] },
  },
  {
    slug: "rockcrawler-coilover-pair",
    name: "RockCrawler 2.5 Coilovers (Pair)",
    brand: "Ridgeline",
    category: "suspension",
    price: 1299,
    compareAt: 1450,
    rating: 4.7,
    reviews: 88,
    stock: 6,
    fits: fitsAll,
    image: suspensionImg,
    bestSeller: false,
    isNew: true,
    description: "Race-derived coilovers with 16-position compression adjustment for street and trail comfort.",
    specs: { Travel: "10 in", Adjustment: "16 clicks", Body: "Aluminum" },
  },
  {
    slug: "adjustable-control-arms",
    name: "Adjustable Lower Control Arms",
    brand: "Apex 4x4",
    category: "suspension",
    price: 449,
    compareAt: 520,
    rating: 4.6,
    reviews: 132,
    stock: 30,
    fits: fitsJK,
    image: suspensionImg,
    bestSeller: false,
    isNew: false,
    description: "Chromoly arms with greasable flex joints to dial in caster and pinion angle.",
    specs: { Material: "Chromoly", Joints: "Greasable" },
  },
  {
    slug: "stubby-front-bumper-winch",
    name: "Stubby Front Bumper w/ Winch Plate",
    brand: "IronForge",
    category: "armor",
    price: 899,
    compareAt: 1049,
    rating: 4.9,
    reviews: 301,
    stock: 9,
    fits: fitsJL,
    image: armorImg,
    bestSeller: true,
    isNew: false,
    description: "3/16\" steel stubby bumper with integrated light hoop and winch plate rated to 12,000 lb.",
    specs: {
      Steel: "3/16 in",
      "Winch rating": "12,000 lb",
      Finish: "Textured black powder",
    },
    options: { label: "Finish", values: ["Textured black", "Bare steel"] },
  },
  {
    slug: "rock-sliders",
    name: "Frame-Mount Rock Sliders",
    brand: "IronForge",
    category: "armor",
    price: 629,
    compareAt: 699,
    rating: 4.8,
    reviews: 156,
    stock: 0,
    fits: fitsJL,
    image: armorImg,
    bestSeller: false,
    isNew: false,
    description: "DOM tube sliders that bolt to the frame and protect your rockers on the gnarliest boulder lines.",
    specs: { Tube: "1.75\" DOM", Mount: "Frame bolt-on" },
  },
  {
    slug: "full-skid-plate-system",
    name: "Full Skid Plate System",
    brand: "Apex 4x4",
    category: "armor",
    price: 1149,
    compareAt: 1299,
    rating: 4.7,
    reviews: 64,
    stock: 4,
    fits: fitsJL,
    image: armorImg,
    bestSeller: false,
    isNew: true,
    description: "Full underbody coverage protecting oil pan, transmission and transfer case against trail impacts.",
    specs: { Material: "3/16\" aluminum", Pieces: "3" },
  },
  {
    slug: "beadlock-17-wheel",
    name: "Bastion 17\" Beadlock Wheel",
    brand: "Summit Wheel",
    category: "wheels",
    price: 389,
    compareAt: 439,
    rating: 4.8,
    reviews: 412,
    stock: 40,
    fits: fitsAll,
    image: wheelsImg,
    bestSeller: true,
    isNew: false,
    description: "Flow-formed beadlock wheel that lets you air down to single digits with absolute confidence.",
    specs: { Size: "17 x 9", Offset: "-12 mm", Weight: "28 lb" },
    options: { label: "Color", values: ["Matte black", "Bronze", "Gunmetal"] },
  },
  {
    slug: "mud-terrain-37",
    name: "Grizzly M/T 37x12.50R17",
    brand: "Summit Wheel",
    category: "wheels",
    price: 429,
    compareAt: 489,
    rating: 4.6,
    reviews: 189,
    stock: 22,
    fits: fitsAll,
    image: wheelsImg,
    bestSeller: false,
    isNew: false,
    description: "Aggressive mud-terrain tire with 3-ply sidewalls and self-cleaning high-void tread blocks.",
    specs: { Size: "37x12.50R17", Ply: "3-ply sidewall", "Load range": "D" },
  },
  {
    slug: "synthetic-winch-12k",
    name: "Torque 12K Synthetic Winch",
    brand: "Hauler",
    category: "recovery",
    price: 749,
    compareAt: 899,
    rating: 4.7,
    reviews: 233,
    stock: 15,
    fits: fitsAll,
    image: recoveryImg,
    bestSeller: true,
    isNew: false,
    description: "12,000 lb winch with 100 ft synthetic line, wireless remote control and IP68 waterproof sealing.",
    specs: { Capacity: "12,000 lb", Line: "100 ft synthetic", Sealing: "IP68" },
  },
  {
    slug: "recovery-kit",
    name: "Trail Recovery Gear Kit",
    brand: "Hauler",
    category: "recovery",
    price: 179,
    compareAt: 219,
    rating: 4.9,
    reviews: 510,
    stock: 60,
    fits: fitsAll,
    image: recoveryImg,
    bestSeller: false,
    isNew: true,
    description: "Kinetic recovery rope, soft shackles, tree-saver strap and heavy-duty gloves in a rugged storage bag.",
    specs: { Rope: "7/8\" x 30 ft kinetic", Includes: "6 pieces" },
  },
  {
    slug: "50-led-light-bar",
    name: "Lumen 50\" LED Light Bar",
    brand: "Brightline",
    category: "lighting",
    price: 499,
    compareAt: 599,
    rating: 4.5,
    reviews: 97,
    stock: 18,
    fits: fitsJL,
    image: lightingImg,
    bestSeller: false,
    isNew: true,
    description: "Combination spot/flood ultra-high output bar delivering 30,000 true lumens with IP69K military sealing.",
    specs: { Output: "30,000 lm", Length: "50 in", Rating: "IP69K" },
  },
  {
    slug: "front-locker-d44",
    name: "E-Locker for Dana 44",
    brand: "Apex 4x4",
    category: "drivetrain",
    price: 1099,
    compareAt: 1250,
    rating: 4.8,
    reviews: 71,
    stock: 3,
    fits: fitsJK,
    image: drivetrainImg,
    bestSeller: false,
    isNew: true,
    description: "Precision electronically actuated differential locker for 100% true traction on demanding obstacles.",
    specs: { Axle: "Dana 44", Splines: "30", Actuation: "Electric" },
  },
];

// Promotional Banner Data
export const promoBannerData = {
  eyebrow: "Fall Build Season",
  title: "Up to 20% off armor & recovery.",
  subtitle: "Plus an extra 15% with promo code",
  code: "MUD15",
  buttonText: "Shop the sale",
  link: "/deals",
};

// Customer Reviews & Feedback
export const reviewsData = [
  {
    name: "Marcus T.",
    rig: "2021 Wrangler JL",
    rating: 5,
    text: "The 3.5\" lift kit went on in a single weekend and rides noticeably better than stock. Moab and Rubicon approved.",
  },
  {
    name: "Priya S.",
    rig: "2020 Gladiator JT",
    rating: 5,
    text: "Bumper fitment was spot-on and the winch plate is solidly constructed. Super fast delivery and great packaging.",
  },
  {
    name: "Dan R.",
    rig: "2016 Wrangler JK",
    rating: 5,
    text: "Their tech support team verified my axle spline count to make sure I got the exact right locker. Real enthusiasts, real help.",
  },
];

