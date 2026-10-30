const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// Local path provided by user
const EXCEL_PATH = "C:\\Users\\Roshin.A\\OneDrive\\Videos\\AnyDesk\\ysk-ecom.xlsx";
const BACKUP_EXCEL_PATH = path.join(__dirname, "..", "ysk-ecom.xlsx");
const OUTPUT_JSON_PATH = path.join(__dirname, "..", "src", "data", "productsFromExcel.json");

// Initial products to populate if Excel is empty/null
const initialProducts = [
  {
    id: "trailmaster-35-lift-kit",
    name: "TrailMaster 3.5\" Lift Kit",
    brand: "Ridgeline",
    category: "suspension",
    price: 1849,
    compareAt: 2099,
    stock: 12,
    offer: "12% OFF",
    fits: "Wrangler JL, Gladiator JT, Thar",
    image: "cat-suspension.jpg",
    rating: 4.8,
    reviews: 214,
    isNew: false,
    bestSeller: true,
    description: "A complete 3.5-inch lift with dual-rate coils, remote-reservoir shocks, and adjustable control arms. Clears 37\" tires with no cutting.",
  },
  {
    id: "rockcrawler-coilover-pair",
    name: "RockCrawler 2.5 Coilovers (Pair)",
    brand: "Ridgeline",
    category: "suspension",
    price: 1299,
    compareAt: 1450,
    stock: 6,
    offer: "10% OFF",
    fits: "Wrangler JL, Wrangler JK, Gladiator JT, Thar, Jimny",
    image: "cat-suspension.jpg",
    rating: 4.7,
    reviews: 88,
    isNew: true,
    bestSeller: false,
    description: "Race-derived coilovers with 16-position compression adjustment for street and trail comfort.",
  },
  {
    id: "adjustable-control-arms",
    name: "Adjustable Lower Control Arms",
    brand: "Apex 4x4",
    category: "suspension",
    price: 449,
    compareAt: 520,
    stock: 30,
    offer: "14% OFF",
    fits: "Wrangler JK, Thar",
    image: "cat-suspension.jpg",
    rating: 4.6,
    reviews: 132,
    isNew: false,
    bestSeller: false,
    description: "Chromoly arms with greasable flex joints to dial in caster and pinion angle.",
  },
  {
    id: "stubby-front-bumper-winch",
    name: "Stubby Front Bumper w/ Winch Plate",
    brand: "IronForge",
    category: "armor",
    price: 899,
    compareAt: 1049,
    stock: 9,
    offer: "14% OFF",
    fits: "Wrangler JL, Thar, Jimny",
    image: "cat-armor.jpg",
    rating: 4.9,
    reviews: 301,
    isNew: false,
    bestSeller: true,
    description: "3/16\" steel stubby bumper with integrated light hoop and winch plate rated to 12,000 lb.",
  },
  {
    id: "rock-sliders",
    name: "Frame-Mount Rock Sliders",
    brand: "IronForge",
    category: "armor",
    price: 629,
    compareAt: 699,
    stock: 0,
    offer: "10% OFF",
    fits: "Wrangler JL, Thar",
    image: "cat-armor.jpg",
    rating: 4.8,
    reviews: 156,
    isNew: false,
    bestSeller: false,
    description: "DOM tube sliders that bolt to the frame and protect your rockers on the gnarliest boulder lines.",
  },
  {
    id: "full-skid-plate-system",
    name: "Full Skid Plate System",
    brand: "Apex 4x4",
    category: "armor",
    price: 1149,
    compareAt: 1299,
    stock: 4,
    offer: "12% OFF",
    fits: "Wrangler JL, Thar",
    image: "cat-armor.jpg",
    rating: 4.7,
    reviews: 64,
    isNew: true,
    bestSeller: false,
    description: "Aluminum belly skids covering oil pan, transmission and transfer case.",
  },
  {
    id: "stealth-aluminum-roof-rack",
    name: "Stealth Modular Low-Profile Roof Rack",
    brand: "IronForge",
    category: "armor",
    price: 989,
    compareAt: 1150,
    stock: 8,
    offer: "14% OFF",
    fits: "Jimny, Thar, Wrangler JL",
    image: "cat-armor.jpg",
    rating: 4.9,
    reviews: 183,
    isNew: true,
    bestSeller: true,
    description: "Aerodynamic modular aluminum extrusion roof platform with perimeter accessory T-slots.",
  },
  {
    id: "expedition-snorkel",
    name: "Expedition Sealed Air Intake Snorkel",
    brand: "Apex 4x4",
    category: "armor",
    price: 349,
    compareAt: 399,
    stock: 18,
    offer: "12% OFF",
    fits: "Jimny, Thar, Wrangler JL, Fortuner",
    image: "cat-armor.jpg",
    rating: 4.9,
    reviews: 145,
    isNew: true,
    bestSeller: false,
    description: "High-density UV-resistant polyethylene snorkel delivering clean, cold air through deep river crossings.",
  },
  {
    id: "beadlock-17-wheel",
    name: "Bastion 17\" Beadlock Wheel",
    brand: "Summit Wheel",
    category: "wheels",
    price: 389,
    compareAt: 439,
    stock: 40,
    offer: "11% OFF",
    fits: "Wrangler JL, Wrangler JK, Gladiator JT, Thar, Jimny",
    image: "cat-wheels.jpg",
    rating: 4.8,
    reviews: 412,
    isNew: false,
    bestSeller: true,
    description: "Flow-formed beadlock wheel that lets you air down to single digits with absolute confidence.",
  },
  {
    id: "mud-terrain-37",
    name: "Grizzly M/T 37x12.50R17 Tire",
    brand: "Summit Wheel",
    category: "wheels",
    price: 429,
    compareAt: 489,
    stock: 22,
    offer: "12% OFF",
    fits: "Wrangler JL, Gladiator JT, Thar",
    image: "cat-wheels.jpg",
    rating: 4.6,
    reviews: 189,
    isNew: false,
    bestSeller: false,
    description: "Aggressive mud-terrain tire with 3-ply sidewalls and self-cleaning high-void tread blocks.",
  },
  {
    id: "synthetic-winch-12k",
    name: "Torque 12K Synthetic Winch",
    brand: "Hauler",
    category: "recovery",
    price: 749,
    compareAt: 899,
    stock: 15,
    offer: "17% OFF",
    fits: "Wrangler JL, Wrangler JK, Gladiator JT, Thar, Jimny, Fortuner",
    image: "cat-recovery.jpg",
    rating: 4.7,
    reviews: 233,
    isNew: false,
    bestSeller: true,
    description: "12,000 lb winch with 100 ft synthetic line, wireless remote control and IP68 sealing.",
  },
  {
    id: "recovery-kit",
    name: "Trail Recovery Gear Kit (6-Piece)",
    brand: "Hauler",
    category: "recovery",
    price: 179,
    compareAt: 219,
    stock: 60,
    offer: "18% OFF",
    fits: "Wrangler JL, Wrangler JK, Gladiator JT, Thar, Jimny, Fortuner",
    image: "cat-recovery.jpg",
    rating: 4.9,
    reviews: 510,
    isNew: true,
    bestSeller: false,
    description: "Kinetic recovery rope, soft shackles, tree saver and gloves in a rugged storage bag.",
  },
  {
    id: "trail-air-compressor",
    name: "Twin-Motor High Output On-Board Air Compressor",
    brand: "Hauler",
    category: "recovery",
    price: 589,
    compareAt: 679,
    stock: 11,
    offer: "13% OFF",
    fits: "Wrangler JL, Gladiator JT, Thar, Jimny, Fortuner",
    image: "cat-recovery.jpg",
    rating: 4.9,
    reviews: 278,
    isNew: true,
    bestSeller: true,
    description: "Fills a 37-inch tire in under 2 minutes. 100% continuous duty cycle with sealed aluminum heatsink.",
  },
  {
    id: "hydra-lift-recovery-jack",
    name: "Hydra-Lift Fast-Action Off-Road Recovery Jack",
    brand: "Hauler",
    category: "recovery",
    price: 329,
    compareAt: 379,
    stock: 16,
    offer: "13% OFF",
    fits: "Wrangler JL, Wrangler JK, Gladiator JT, Jimny, Thar, Fortuner",
    image: "cat-recovery.jpg",
    rating: 4.7,
    reviews: 119,
    isNew: true,
    bestSeller: false,
    description: "Smooth hydraulic lifting with 48-inch lift stroke and integrated over-pressure bypass valve.",
  },
  {
    id: "50-led-light-bar",
    name: "Lumen 50\" Curved LED Light Bar",
    brand: "Brightline",
    category: "lighting",
    price: 499,
    compareAt: 599,
    stock: 18,
    offer: "17% OFF",
    fits: "Wrangler JL, Thar",
    image: "cat-lighting.jpg",
    rating: 4.5,
    reviews: 97,
    isNew: false,
    bestSeller: false,
    description: "Combo spot/flood light bar producing 30,000 lumens with IP69K military waterproofing.",
  },
  {
    id: "hyperbeam-ditch-pods",
    name: "HyperBeam 3\" Amber & White Ditch Pod Pair",
    brand: "Brightline",
    category: "lighting",
    price: 279,
    compareAt: 329,
    stock: 25,
    offer: "15% OFF",
    fits: "Wrangler JL, Wrangler JK, Jimny, Thar, Gladiator JT",
    image: "cat-lighting.jpg",
    rating: 4.8,
    reviews: 162,
    isNew: true,
    bestSeller: false,
    description: "Dual-color spot and wide amber fog beams to cut through dust, fog, and blizzard conditions.",
  },
  {
    id: "front-locker-d44",
    name: "E-Locker for Dana 44 Differential",
    brand: "Apex 4x4",
    category: "drivetrain",
    price: 1099,
    compareAt: 1250,
    stock: 3,
    offer: "12% OFF",
    fits: "Wrangler JK, Thar",
    image: "cat-drivetrain.jpg",
    rating: 4.8,
    reviews: 71,
    isNew: true,
    bestSeller: false,
    description: "Electronically actuated differential locker for 100% instant traction on demand.",
  },
  {
    id: "nodular-iron-diff-cover",
    name: "Nodular Iron Heavy-Duty Differential Cover",
    brand: "Apex 4x4",
    category: "drivetrain",
    price: 199,
    compareAt: 239,
    stock: 14,
    offer: "17% OFF",
    fits: "Wrangler JL, Wrangler JK, Gladiator JT, Thar",
    image: "cat-drivetrain.jpg",
    rating: 4.8,
    reviews: 94,
    isNew: true,
    bestSeller: false,
    description: "Thick nodular iron casting engineered to deflect rock strikes and add rigidity to axle housing.",
  },
];

// Helper to write data to Excel file
function writeToExcel(filePath, data) {
  const ws = XLSX.utils.json_to_sheet(data, {
    header: [
      "id",
      "name",
      "brand",
      "category",
      "price",
      "compareAt",
      "stock",
      "offer",
      "fits",
      "image",
      "rating",
      "reviews",
      "isNew",
      "bestSeller",
      "description",
    ],
  });

  // Set nice column widths
  ws["!cols"] = [
    { wch: 28 }, // id
    { wch: 38 }, // name
    { wch: 16 }, // brand
    { wch: 15 }, // category
    { wch: 10 }, // price
    { wch: 12 }, // compareAt
    { wch: 8 },  // stock
    { wch: 12 }, // offer
    { wch: 36 }, // fits
    { wch: 22 }, // image
    { wch: 8 },  // rating
    { wch: 9 },  // reviews
    { wch: 8 },  // isNew
    { wch: 11 }, // bestSeller
    { wch: 70 }, // description
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Products");
  XLSX.writeFile(wb, filePath);
  console.log(`Successfully written ${data.length} items to ${filePath}`);
}

// Helper to read data from Excel file
function readFromExcel(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    const wb = XLSX.readFile(filePath);
    const firstSheet = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(firstSheet);
    return rows;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return null;
  }
}

// Main execution
function run() {
  console.log("Checking target Excel path:", EXCEL_PATH);

  let existingRows = null;
  try {
    existingRows = readFromExcel(EXCEL_PATH);
  } catch (e) {
    console.log("Could not read from EXCEL_PATH directly:", e.message);
  }

  // If file doesn't exist or has 0 rows, populate it with initialProducts!
  if (!existingRows || existingRows.length === 0) {
    console.log("Excel file is empty/null. Populating with initial catalog items...");
    try {
      writeToExcel(EXCEL_PATH, initialProducts);
    } catch (e) {
      console.warn("Could not write to EXCEL_PATH (will write to workspace backup):", e.message);
    }
    // Also write a workspace copy so the project is never broken if OneDrive is offline
    writeToExcel(BACKUP_EXCEL_PATH, initialProducts);
    existingRows = initialProducts;
  } else {
    console.log(`Found ${existingRows.length} existing rows in Excel.`);
    // Sync backup
    writeToExcel(BACKUP_EXCEL_PATH, existingRows);
  }

  // Write out the synchronized JSON for fast client/server hydration
  fs.mkdirSync(path.dirname(OUTPUT_JSON_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_JSON_PATH, JSON.stringify(existingRows, null, 2), "utf8");
  console.log(`Saved synchronized products JSON to: ${OUTPUT_JSON_PATH}`);
}

run();

