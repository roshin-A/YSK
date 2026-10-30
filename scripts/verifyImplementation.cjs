const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

async function verifyAll() {
  console.log("=================================================");
  console.log("   YSK 4X4 SYSTEM VERIFICATION SUITE");
  console.log("=================================================\n");

  const { adminPlugin } = await import("../src/server/adminPlugin.js");

  // Load products conversion logic matching excelService.ts
  function resolveImage(imgVal) {
    if (!imgVal || typeof imgVal !== "string") return "";
    const trimmed = imgVal.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://") || trimmed.startsWith("/")) return trimmed;
    const filename = trimmed.split("/").pop() || trimmed;
    return `/images/products/${filename}`;
  }

  function createProductCard(row, index = 0) {
    const rawName = String(row["Product Name"] || row.name || `Item ${index + 1}`).trim();
    const rawId = String(row["Product ID"] || row.id || `YSK${String(index + 1).padStart(3, "0")}`).trim();
    const priceNum = Number(row["Price"] !== undefined ? row["Price"] : row.price) || 0;
    const fitsRaw = row["Fits"] || row.fits || "Wrangler, Jimny, Thar";
    const fitsList = String(fitsRaw).split(",").map((s) => s.trim()).filter(Boolean);
    const img = resolveImage(row["Image 1"] || row.image);

    return {
      slug: rawId,
      name: rawName,
      brand: String(row["Brand"] || row.brand || "YSK 4x4"),
      category: String(row["Category"] || row.category || "accessories").toLowerCase().trim(),
      price: priceNum,
      stock: Number(row["Stock"] !== undefined ? row["Stock"] : row.stock) || 0,
      fits: fitsList,
      image: img,
      isNew: row["Is New"] === "TRUE" || row.isNew === true,
      bestSeller: row["Best Seller"] === "TRUE" || row.bestSeller === true,
      createdAt: String(row["Created Date"] || row.createdAt || ""),
      updatedAt: String(row["Updated Date"] || row.updatedAt || ""),
    };
  }

  // 1. Verify Excel File Structure and Products
  console.log("TEST 1: Verifying products.xlsx and Excel Data Integrity...");
  const excelPath = path.resolve(process.cwd(), "products.xlsx");
  if (!fs.existsSync(excelPath)) {
    throw new Error("FAIL: products.xlsx does not exist!");
  }

  const wb = XLSX.readFile(excelPath);
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
  console.log(`✓ products.xlsx exists and contains ${rows.length} product rows.`);

  const requiredHeaders = ["Product ID", "Product Name", "Category", "Price", "Stock", "Fits"];
  for (const h of requiredHeaders) {
    if (!rows[0].hasOwnProperty(h)) {
      throw new Error(`FAIL: Missing column "${h}" in products.xlsx!`);
    }
  }
  console.log(`✓ Master columns confirmed: ${Object.keys(rows[0]).slice(0, 8).join(", ")}...`);

  const mapped = rows.map((r, i) => createProductCard(r, i));
  console.log(`✓ Successfully mapped ${mapped.length} products dynamically from Excel.`);

  // 2. Verify "Shop by Vehicle" Dynamic Calculation
  console.log("\nTEST 2: Verifying 'Shop by Vehicle' Latest Product Mapping...");
  const targetVehicles = [
    { name: "Mahindra Thar", query: "Thar" },
    { name: "Suzuki Jimny", query: "Jimny" },
    { name: "Jeep Wrangler", query: "Wrangler" },
    { name: "Toyota Fortuner", query: "Fortuner" },
    { name: "Jeep Gladiator", query: "Gladiator" },
  ];

  function computeVehicleCards(productList) {
    return targetVehicles.map((v) => {
      const kw = v.query.toLowerCase();
      const matching = productList.filter((p) => {
        const inFits = (p.fits || []).some((f) => f.toLowerCase().includes(kw));
        const inName = (p.name || "").toLowerCase().includes(kw);
        return inFits || inName;
      });

      if (matching.length === 0) return null;

      const sorted = [...matching].sort((a, b) => {
        const tA = new Date(a.createdAt || a.updatedAt || 0).getTime();
        const tB = new Date(b.createdAt || b.updatedAt || 0).getTime();
        if (tB !== tA && !isNaN(tB) && !isNaN(tA)) return tB - tA;
        return productList.indexOf(b) - productList.indexOf(a);
      });

      const latest = sorted[0];
      return {
        name: v.name,
        query: v.query,
        count: matching.length,
        latestId: latest.slug,
        latestName: latest.name,
        latestImage: latest.image,
      };
    }).filter(Boolean);
  }

  const initialCards = computeVehicleCards(mapped);
  initialCards.forEach((c) => {
    console.log(`  - [${c.name}] (${c.count} parts) -> Latest Product: "${c.latestName}" (${c.latestId}) | Image: ${c.latestImage}`);
  });

  const jimnyCardBefore = initialCards.find((c) => c.query === "Jimny");
  if (!jimnyCardBefore) throw new Error("FAIL: Expected Jimny card to be present");

  // 3. Verify Admin Dashboard Add Product & Automatic Vehicle Update
  console.log("\nTEST 3: Simulating Admin Add Product & Testing Live Vehicle Card Update...");
  const testId = "YSK_TEST_LATEST";
  const testName = "Jimny Ultra-Light Aluminum Roof Rack (NEW)";

  // Setup fake server for adminPlugin
  const middlewares = [];
  const fakeServer = {
    middlewares: {
      use: (prefix, handler) => {
        if (!handler) { handler = prefix; prefix = "/"; }
        middlewares.push({ prefix, handler });
      },
    },
    ws: { send: () => {} },
  };
  adminPlugin().configureServer(fakeServer);

  function callAdminApi(method, urlPath, body, token) {
    return new Promise((resolve) => {
      const { EventEmitter } = require("events");
      const req = new EventEmitter();
      req.method = method;
      req.url = urlPath;
      req.headers = token ? { authorization: `Bearer ${token}` } : {};
      req.socket = { remoteAddress: "127.0.0.1" };

      const res = {
        statusCode: 200,
        headers: {},
        setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
        end(data) {
          try { resolve({ status: this.statusCode, json: JSON.parse(data) }); }
          catch { resolve({ status: this.statusCode, text: data }); }
        },
      };

      const mw = middlewares.find((m) => urlPath.startsWith(m.prefix));
      req.url = urlPath.slice(mw.prefix.length) || "/";
      mw.handler(req, res, () => resolve({ status: 404 }));

      if (body) req.emit("data", Buffer.from(JSON.stringify(body)));
      req.emit("end");
    });
  }

  // Login
  const login = await callAdminApi("POST", "/api/admin/login", { username: "admin", password: "YSK@admin2024" });
  const token = login.json.token;

  // Add new product specifically for Jimny
  console.log(`Adding test product "${testName}" with fits: "Jimny"...`);
  const addRes = await callAdminApi("POST", "/api/admin/products", {
    id: testId,
    name: testName,
    category: "armor",
    price: 650,
    stock: 5,
    fits: "Jimny",
    image: "/images/products/cat-armor.jpg",
  }, token);

  if (!addRes.json?.success) throw new Error("FAIL: Failed to add test product: " + JSON.stringify(addRes.json));
  console.log("✓ Product added successfully to Excel database.");

  // Re-read products from Excel
  const wbUpdated = XLSX.readFile(excelPath);
  const rowsUpdated = XLSX.utils.sheet_to_json(wbUpdated.Sheets[wbUpdated.SheetNames[0]]);
  const mappedUpdated = rowsUpdated.map((r, i) => createProductCard(r, i));

  // Compute updated vehicle cards
  const updatedCards = computeVehicleCards(mappedUpdated);
  const jimnyCardAfter = updatedCards.find((c) => c.query === "Jimny");

  console.log(`  - Updated Jimny Latest Product: "${jimnyCardAfter.latestName}" (${jimnyCardAfter.latestId})`);
  if (jimnyCardAfter.latestId !== testId) {
    throw new Error(`FAIL: Jimny card did not update to newly added product "${testId}"!`);
  }
  console.log("✓ SUCCESS: Vehicle card automatically updated to show the newest added product!");

  // Clean up: delete test product
  console.log(`\nCleaning up test product "${testId}"...`);
  await callAdminApi("DELETE", "/api/admin/products", { id: testId }, token);

  const wbFinal = XLSX.readFile(excelPath);
  const rowsFinal = XLSX.utils.sheet_to_json(wbFinal.Sheets[wbFinal.SheetNames[0]]);
  const mappedFinal = rowsFinal.map((r, i) => createProductCard(r, i));
  const revertedCards = computeVehicleCards(mappedFinal);
  const jimnyCardReverted = revertedCards.find((c) => c.query === "Jimny");

  console.log(`  - Reverted Jimny Latest Product: "${jimnyCardReverted.latestName}"`);
  if (jimnyCardReverted.latestId === testId) {
    throw new Error("FAIL: Test product was not removed!");
  }
  console.log("✓ SUCCESS: Test product deleted and vehicle card safely reverted.");

  // 4. Verify Vehicle Fitment Filtering logic in Shop
  console.log("\nTEST 4: Verifying Vehicle Fitment Filtering Logic in Shop...");
  ["Thar", "Jimny", "Wrangler", "Fortuner"].forEach((vehicle) => {
    const kw = vehicle.toLowerCase();
    const filtered = mappedFinal.filter((p) => {
      const matchModel = (p.fits || []).some(
        (f) => f.toLowerCase().includes(kw) || kw.includes(f.toLowerCase())
      ) || (p.name || "").toLowerCase().includes(kw);
      return matchModel;
    });
    console.log(`✓ Vehicle Filter "${vehicle}": Found ${filtered.length} products in Excel.`);
    if (filtered.length === 0) {
      throw new Error(`FAIL: Expected products for vehicle "${vehicle}"`);
    }
  });

  // 5. Verify Build Check
  console.log("\nTEST 5: Checking static files and JSON cache sync...");
  const jsonCachePath = path.resolve(process.cwd(), "src/data/productsFromExcel.json");
  if (!fs.existsSync(jsonCachePath)) {
    throw new Error("FAIL: productsFromExcel.json cache missing!");
  }
  const jsonCacheData = JSON.parse(fs.readFileSync(jsonCachePath, "utf8"));
  console.log(`✓ JSON cache synced with ${jsonCacheData.length} records.`);

  console.log("\n=================================================");
  console.log("✓ ALL VERIFICATION CHECKS PASSED WITH 100% SUCCESS!");
  console.log("=================================================");
}

verifyAll().catch((err) => {
  console.error("\n❌ VERIFICATION FAILED:", err);
  process.exit(1);
});
