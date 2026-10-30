const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const SOURCE_PATH = path.resolve(process.cwd(), "ysk-ecom.xlsx");
const TARGET_PATH = path.resolve(process.cwd(), "products.xlsx");
const JSON_CACHE = path.resolve(process.cwd(), "src/data/productsFromExcel.json");

let rows = [];

if (fs.existsSync(SOURCE_PATH)) {
  try {
    const wb = XLSX.readFile(SOURCE_PATH);
    rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    console.log(`Read ${rows.length} rows from ysk-ecom.xlsx`);
  } catch (err) {
    console.error("Error reading ysk-ecom.xlsx:", err.message);
  }
}

if (rows.length === 0 && fs.existsSync(JSON_CACHE)) {
  try {
    rows = JSON.parse(fs.readFileSync(JSON_CACHE, "utf8"));
    console.log(`Read ${rows.length} rows from JSON cache`);
  } catch (err) {
    console.error("Error reading JSON cache:", err.message);
  }
}

const now = new Date().toISOString();

// Format rows according to user's specification
const standardizedRows = rows.map((r, idx) => {
  const productId = r["Product ID"] || r.id || `YSK${String(idx + 1).padStart(3, "0")}`;
  const productName = r["Product Name"] || r.name || `Product ${idx + 1}`;
  const category = r["Category"] || r.category || "accessories";
  const price = Number(r["Price"] !== undefined ? r["Price"] : r.price) || 0;
  const stock = Number(r["Stock"] !== undefined ? r["Stock"] : r.stock) || 0;
  const description = r["Description"] || r.description || "";
  const image1 = r["Image 1"] || r.image || "";
  const image2 = r["Image 2"] || r.image2 || "";
  const image3 = r["Image 3"] || r.image3 || "";
  const brand = r["Brand"] || r.brand || "YSK 4x4";
  const compareAt = r["Compare At"] !== undefined ? r["Compare At"] : r.compareAt || "";
  const offer = r["Offer"] || r.offer || "";
  const fits = r["Fits"] || r.fits || "Wrangler, Jimny, Thar";
  const rating = Number(r["Rating"] !== undefined ? r["Rating"] : r.rating) || 4.8;
  const reviews = Number(r["Reviews"] !== undefined ? r["Reviews"] : r.reviews) || 25;
  const isNew = r["Is New"] !== undefined ? r["Is New"] : (r.isNew ? "TRUE" : "FALSE");
  const bestSeller = r["Best Seller"] !== undefined ? r["Best Seller"] : (r.bestSeller ? "TRUE" : "FALSE");
  const createdDate = r["Created Date"] || r.createdAt || now;
  const updatedDate = r["Updated Date"] || r.updatedAt || now;

  return {
    "Product ID": productId,
    "Product Name": productName,
    "Category": category,
    "Price": price,
    "Stock": stock,
    "Description": description,
    "Image 1": image1,
    "Image 2": image2,
    "Image 3": image3,
    "Brand": brand,
    "Compare At": compareAt,
    "Offer": offer,
    "Fits": fits,
    "Rating": rating,
    "Reviews": reviews,
    "Is New": isNew,
    "Best Seller": bestSeller,
    "Created Date": createdDate,
    "Updated Date": updatedDate,
  };
});

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(standardizedRows);
XLSX.utils.book_append_sheet(wb, ws, "Products");
XLSX.writeFile(wb, TARGET_PATH);
console.log(`Successfully generated products.xlsx with ${standardizedRows.length} rows.`);

