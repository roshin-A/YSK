import fs from "fs";
import path from "path";
import crypto from "crypto";
import XLSX from "xlsx";

/* ─── Paths ─── */
const DATA_DIR = path.resolve(process.cwd(), "data");
const ADMIN_CFG = path.join(DATA_DIR, "admin-config.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const ANALYTICS_FILE = path.join(DATA_DIR, "analytics.json");
const ACTIVITY_FILE = path.join(DATA_DIR, "activity.json");
const CATEGORIES_FILE = path.join(DATA_DIR, "categories.json");
const PRODUCTS_XLSX = path.resolve(process.cwd(), "products.xlsx");
const YSK_XLSX = path.resolve(process.cwd(), "ysk-ecom.xlsx");
const ONEDRIVE_PATH = "C:\\Users\\Roshin.A\\OneDrive\\Videos\\AnyDesk\\ysk-ecom.xlsx";
const JSON_CACHE = path.resolve(process.cwd(), "src/data/productsFromExcel.json");
const UPLOAD_DIR = path.resolve(process.cwd(), "public/uploads/products");
const CAT_UPLOAD_DIR = path.resolve(process.cwd(), "public/uploads/categories");

/* ─── Crypto helpers ─── */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hash] = stored.split(":");
  const computed = crypto.scryptSync(password, salt, 64).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(computed, "hex"));
  } catch {
    return false;
  }
}

function createJWT(payload, secret) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
  return `${header}.${body}.${sig}`;
}

function verifyJWT(token, secret) {
  try {
    const [header, body, sig] = token.split(".");
    const expected = crypto.createHmac("sha256", secret).update(`${header}.${body}`).digest("base64url");
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/* ─── Request/Response helpers ─── */
function parseBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 50 * 1024 * 1024) { reject(new Error("Body too large")); return; }
      chunks.push(chunk);
    });
    req.on("end", () => {
      try {
        const body = Buffer.concat(chunks).toString();
        resolve(body ? JSON.parse(body) : {});
      } catch { resolve({}); }
    });
    req.on("error", reject);
  });
}

function getCookie(req, name) {
  const cookies = req.headers.cookie || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function sendJSON(res, data, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

function sendError(res, message, status = 400) {
  sendJSON(res, { success: false, error: message }, status);
}

/* ─── JSON file helpers ─── */
function readJSON(filePath, fallback = []) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {}
  return fallback;
}

function writeJSON(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

/* ─── Admin config init ─── */
function getAdminConfig() {
  if (!fs.existsSync(ADMIN_CFG)) {
    const defaultUser = process.env.ADMIN_USERNAME || "admin";
    const defaultPass = process.env.ADMIN_PASSWORD || "YSK@admin2024";
    const config = {
      username: defaultUser,
      password: hashPassword(defaultPass),
      jwtSecret: crypto.randomBytes(32).toString("hex"),
      createdAt: new Date().toISOString(),
    };
    writeJSON(ADMIN_CFG, config);
    console.log(`[Admin] Initialized admin config. Username: ${defaultUser}`);
    return config;
  }
  const cfg = readJSON(ADMIN_CFG, {});
  if (!cfg.whatsappNumber) {
    cfg.whatsappNumber = process.env.WHATSAPP_NUMBER || "919876543210";
    writeJSON(ADMIN_CFG, cfg);
  }
  return cfg;
}

/* ─── Activity logger ─── */
function logActivity(action, details = "", admin = "admin") {
  const logs = readJSON(ACTIVITY_FILE, []);
  logs.unshift({
    id: crypto.randomUUID(),
    action,
    details,
    admin,
    timestamp: new Date().toISOString(),
  });
  writeJSON(ACTIVITY_FILE, logs.slice(0, 500));
}

/* ─── Excel helpers ─── */
function getPrimaryExcelPath() {
  const candidates = [PRODUCTS_XLSX, YSK_XLSX, ONEDRIVE_PATH].filter((p) =>
    fs.existsSync(p)
  );
  if (candidates.length === 0) return PRODUCTS_XLSX;

  let newest = candidates[0];
  let newestMtime = -1;
  for (const c of candidates) {
    try {
      const mtime = fs.statSync(c).mtimeMs;
      if (mtime > newestMtime) {
        newestMtime = mtime;
        newest = c;
      }
    } catch {}
  }
  return newest;
}

function normalizeProductRow(r, index = 0) {
  const id = String(r["Product ID"] || r.id || r.slug || `YSK${String(index + 1).padStart(3, "0")}`).trim();
  const name = String(r["Product Name"] || r.name || r["item name"] || `Product ${index + 1}`).trim();
  const category = String(r["Category"] || r.category || "accessories").toLowerCase().trim();
  const price = Number(r["Price"] !== undefined ? r["Price"] : r.price) || 0;
  const stock = Number(r["Stock"] !== undefined ? r["Stock"] : (r.stock ?? r.contity)) || 0;
  const description = String(r["Description"] || r.description || "");
  const image1 = String(r["Image 1"] || r.image || "").trim();
  const image2 = String(r["Image 2"] || r.image2 || "").trim();
  const image3 = String(r["Image 3"] || r.image3 || "").trim();
  const brand = String(r["Brand"] || r.brand || "YSK 4x4");
  const compareAt = r["Compare At"] !== undefined ? r["Compare At"] : r.compareAt || "";
  const offer = String(r["Offer"] || r.offer || "");
  const fits = String(r["Fits"] || r.fits || "Wrangler, Jimny, Thar");
  const rating = Number(r["Rating"] !== undefined ? r["Rating"] : r.rating) || 4.8;
  const reviews = Number(r["Reviews"] !== undefined ? r["Reviews"] : r.reviews) || 25;
  const isNew = r["Is New"] === true || r.isNew === true || String(r["Is New"] || r.isNew).toUpperCase() === "TRUE";
  const bestSeller = r["Best Seller"] === true || r.bestSeller === true || String(r["Best Seller"] || r.bestSeller).toUpperCase() === "TRUE";
  const createdDate = String(r["Created Date"] || r.createdAt || new Date().toISOString());
  const updatedDate = String(r["Updated Date"] || r.updatedAt || new Date().toISOString());

  return {
    id,
    name,
    category,
    price,
    stock,
    description,
    image: image1,
    image2,
    image3,
    images: [image1, image2, image3].filter(Boolean),
    brand,
    compareAt: compareAt ? Number(compareAt) : undefined,
    offer,
    fits,
    rating,
    reviews,
    isNew,
    bestSeller,
    createdAt: createdDate,
    updatedAt: updatedDate,
    // Keep user-facing Excel column names as well
    "Product ID": id,
    "Product Name": name,
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
    "Is New": isNew ? "TRUE" : "FALSE",
    "Best Seller": bestSeller ? "TRUE" : "FALSE",
    "Created Date": createdDate,
    "Updated Date": updatedDate,
  };
}

function readExcelProducts() {
  const target = getPrimaryExcelPath();
  try {
    if (fs.existsSync(target)) {
      const buf = fs.readFileSync(target);
      const wb = XLSX.read(buf, { type: "buffer" });
      const rawRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
      const normalized = rawRows.map((r, i) => normalizeProductRow(r, i));
      const mtime = fs.statSync(target).mtimeMs;
      return { rows: normalized, path: target, lastModified: mtime };
    }
  } catch (err) {
    console.error("[Excel Read Error]", err.message);
  }

  // Fallback to json cache
  if (fs.existsSync(JSON_CACHE)) {
    try {
      const rows = JSON.parse(fs.readFileSync(JSON_CACHE, "utf8"));
      return { rows: rows.map((r, i) => normalizeProductRow(r, i)), path: "cached-json", lastModified: fs.statSync(JSON_CACHE).mtimeMs };
    } catch {}
  }
  return { rows: [], path: "none", lastModified: 0 };
}

function writeExcelProducts(rows) {
  // Format rows strictly with clean user columns first
  const excelData = rows.map((r) => ({
    "Product ID": r["Product ID"] || r.id,
    "Product Name": r["Product Name"] || r.name,
    "Category": r["Category"] || r.category,
    "Price": Number(r["Price"] !== undefined ? r["Price"] : r.price) || 0,
    "Stock": Number(r["Stock"] !== undefined ? r["Stock"] : r.stock) || 0,
    "Description": r["Description"] || r.description || "",
    "Image 1": r["Image 1"] || r.image || "",
    "Image 2": r["Image 2"] || r.image2 || "",
    "Image 3": r["Image 3"] || r.image3 || "",
    "Brand": r["Brand"] || r.brand || "YSK 4x4",
    "Compare At": r["Compare At"] || r.compareAt || "",
    "Offer": r["Offer"] || r.offer || "",
    "Fits": r["Fits"] || r.fits || "Wrangler, Jimny, Thar",
    "Rating": Number(r["Rating"] !== undefined ? r["Rating"] : r.rating) || 4.8,
    "Reviews": Number(r["Reviews"] !== undefined ? r["Reviews"] : r.reviews) || 25,
    "Is New": (r["Is New"] === true || r.isNew === true || r["Is New"] === "TRUE") ? "TRUE" : "FALSE",
    "Best Seller": (r["Best Seller"] === true || r.bestSeller === true || r["Best Seller"] === "TRUE") ? "TRUE" : "FALSE",
    "Created Date": r["Created Date"] || r.createdAt || new Date().toISOString(),
    "Updated Date": new Date().toISOString(),
  }));

  const wb = XLSX.utils.book_new();
  const ws = excelData.length > 0
    ? XLSX.utils.json_to_sheet(excelData)
    : XLSX.utils.aoa_to_sheet([["Product ID", "Product Name", "Category", "Price", "Stock", "Description", "Image 1", "Image 2", "Image 3", "Created Date", "Updated Date"]]);
  XLSX.utils.book_append_sheet(wb, ws, "Products");

  // Save to products.xlsx (requested primary file)
  try {
    XLSX.writeFile(wb, PRODUCTS_XLSX);
  } catch (err) {
    console.error("[Excel Save Error products.xlsx]", err.message);
  }

  // Also sync to ysk-ecom.xlsx for backwards compatibility
  try {
    XLSX.writeFile(wb, YSK_XLSX);
  } catch {}

  // Also sync to OneDrive if accessible
  try {
    if (fs.existsSync(path.dirname(ONEDRIVE_PATH))) {
      XLSX.writeFile(wb, ONEDRIVE_PATH);
    }
  } catch {}

  // Update JSON cache for the frontend catalog
  try {
    fs.mkdirSync(path.dirname(JSON_CACHE), { recursive: true });
    fs.writeFileSync(JSON_CACHE, JSON.stringify(excelData, null, 2), "utf8");
  } catch (err) {
    console.error("[JSON Cache Sync Error]", err.message);
  }

  return excelData;
}

function generateProductId() {
  const { rows } = readExcelProducts();
  let maxNum = 0;
  for (const r of rows) {
    const id = String(r.id || r["Product ID"] || "");
    const match = id.match(/YSK(\d+)/i);
    if (match) maxNum = Math.max(maxNum, parseInt(match[1], 10));
  }
  return `YSK${String(maxNum + 1).padStart(3, "0")}`;
}

/* ─── Auth middleware ─── */
function requireAuth(req, res) {
  const config = getAdminConfig();
  // Check cookie or Authorization Bearer header
  let token = getCookie(req, "ysk_admin_token");
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7).trim();
  }

  if (!token) {
    sendError(res, "Not authenticated", 401);
    return null;
  }
  const payload = verifyJWT(token, config.jwtSecret);
  if (!payload) {
    sendError(res, "Session expired", 401);
    return null;
  }
  return payload;
}

/* ─── Image upload helper ─── */
function saveBase64Image(base64Data, productId, index) {
  if (!base64Data || typeof base64Data !== "string") return null;

  // If it's already a relative server path or external URL, return it as-is
  if (base64Data.startsWith("/uploads/") || base64Data.startsWith("/images/") || base64Data.startsWith("http://") || base64Data.startsWith("https://")) {
    return base64Data;
  }

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  const match = base64Data.match(/^data:image\/([\w+]+);base64,(.+)$/);
  if (!match) return null;

  const rawExt = match[1].toLowerCase();
  const ext = rawExt === "jpeg" ? "jpg" : rawExt.includes("png") ? "png" : rawExt.includes("webp") ? "webp" : "jpg";
  const buffer = Buffer.from(match[2], "base64");
  const cleanId = String(productId).replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${cleanId}-${Date.now()}-${index}.${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);

  fs.writeFileSync(filepath, buffer);
  return `/uploads/products/${filename}`;
}

function saveBase64CategoryImage(base64Data, slug) {
  if (!base64Data || typeof base64Data !== "string") return null;
  if (base64Data.startsWith("/uploads/") || base64Data.startsWith("/images/") || base64Data.startsWith("http://") || base64Data.startsWith("https://")) {
    return base64Data;
  }
  fs.mkdirSync(CAT_UPLOAD_DIR, { recursive: true });
  const match = base64Data.match(/^data:image\/([\w+]+);base64,(.+)$/);
  if (!match) return null;
  const rawExt = match[1].toLowerCase();
  const ext = rawExt === "jpeg" ? "jpg" : rawExt.includes("png") ? "png" : rawExt.includes("webp") ? "webp" : "jpg";
  const buffer = Buffer.from(match[2], "base64");
  const cleanId = String(slug).replace(/[^a-zA-Z0-9_-]/g, "_");
  const filename = `${cleanId}-${Date.now()}.${ext}`;
  const filepath = path.join(CAT_UPLOAD_DIR, filename);
  fs.writeFileSync(filepath, buffer);
  return `/uploads/categories/${filename}`;
}

function readCategories() {
  return readJSON(CATEGORIES_FILE, [
    { slug: "suspension", name: "Suspension", description: "Lift kits, shocks, coilovers and control arms engineered for extreme articulation.", image: "/images/categories/cat-suspension.jpg" },
    { slug: "armor", name: "Armor", description: "Steel bumpers, rock sliders and heavy-duty skid plates built to take a beating.", image: "/images/categories/cat-armor.jpg" },
    { slug: "wheels", name: "Wheels & Tires", description: "Beadlock wheels and aggressive all-terrain/mud-terrain tires for every trail.", image: "/images/categories/cat-wheels.jpg" },
    { slug: "recovery", name: "Recovery", description: "High-capacity winches, kinetic ropes, shackles and recovery gear to get you home.", image: "/images/categories/cat-recovery.jpg" },
    { slug: "lighting", name: "Lighting", description: "Ultra-bright LED light bars, auxiliary pods and projector headlights that turn night into day.", image: "/images/categories/cat-lighting.jpg" },
    { slug: "drivetrain", name: "Drivetrain", description: "Lockers, gear sets and heavy-duty axle shafts for unmatched rock-crawling torque.", image: "/images/categories/cat-drivetrain.jpg" },
  ]);
}

/* ─── Plugin Implementation ─── */
export function adminPlugin() {
  return {
    name: "admin-plugin",
    configureServer(server) {
      // Initialize admin config on server boot
      getAdminConfig();

      // Ensure upload directory exists
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });

      // Helper to broadcast Excel changes over WebSocket
      function notifyExcelUpdated() {
        try {
          server.ws.send({
            type: "custom",
            event: "excel-updated",
            data: { timestamp: Date.now() },
          });
        } catch {}
      }

      /* ─── PUBLIC: Visitor Tracking (/api/track) ─── */
      server.middlewares.use("/api/track", async (req, res, next) => {
        if (req.method !== "POST") return next();
        try {
          const body = await parseBody(req);
          const analytics = readJSON(ANALYTICS_FILE, {
            visitors: [],
            pageViews: [],
            productViews: {},
            recentViews: [],
          });
          const today = new Date().toISOString().split("T")[0];
          const rawIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
          const hashedIp = crypto.createHash("sha256").update(String(rawIp)).digest("hex").slice(0, 12);
          const now = new Date().toISOString();

          // 1. Record Page View
          const page = body.page || "/";
          analytics.pageViews = analytics.pageViews || [];
          analytics.pageViews.unshift({
            page,
            visitor: hashedIp,
            timestamp: now,
            userAgent: (req.headers["user-agent"] || "").slice(0, 100),
          });

          // 2. Record Unique Visitor for today
          analytics.visitors = analytics.visitors || [];
          const existingVisitor = analytics.visitors.find((v) => v.id === hashedIp && v.date === today);
          if (!existingVisitor) {
            analytics.visitors.unshift({ id: hashedIp, date: today, firstVisit: now });
          }

          // 3. Record Product View if tracking a product detail page
          if (body.productId) {
            analytics.productViews = analytics.productViews || {};
            const pId = String(body.productId);
            analytics.productViews[pId] = (analytics.productViews[pId] || 0) + 1;

            analytics.recentViews = analytics.recentViews || [];
            analytics.recentViews.unshift({
              productId: pId,
              productName: body.productName || pId,
              timestamp: now,
              visitor: hashedIp,
            });
            analytics.recentViews = analytics.recentViews.slice(0, 50);
          }

          // Bound array lengths to prevent file growth
          analytics.pageViews = analytics.pageViews.slice(0, 10000);
          analytics.visitors = analytics.visitors.slice(0, 5000);

          writeJSON(ANALYTICS_FILE, analytics);
          sendJSON(res, { success: true });
        } catch (err) {
          sendJSON(res, { success: true });
        }
      });

      /* ─── PUBLIC: Customer Checkout (/api/checkout) ─── */
      server.middlewares.use("/api/checkout", async (req, res, next) => {
        if (req.method !== "POST") return next();
        try {
          const body = await parseBody(req);
          if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
            sendError(res, "Cart is empty");
            return;
          }
          if (!body.customer || !body.customer.name || !body.customer.email) {
            sendError(res, "Customer name and email are required");
            return;
          }

          const orders = readJSON(ORDERS_FILE, []);
          const orderId = `ORD-${Date.now().toString().slice(-6)}`;
          const now = new Date().toISOString();

          // Calculate quantities and reduce stock in Excel
          const { rows } = readExcelProducts();
          let totalItemsCount = 0;

          body.items.forEach((item) => {
            const qty = Number(item.qty) || 1;
            totalItemsCount += qty;
            const pIdx = rows.findIndex((r) => r.id === item.slug || r.slug === item.slug || r["Product ID"] === item.slug);
            if (pIdx !== -1) {
              const currentStock = Number(rows[pIdx].stock ?? rows[pIdx]["Stock"]) || 0;
              const newStock = Math.max(0, currentStock - qty);
              rows[pIdx].stock = newStock;
              rows[pIdx]["Stock"] = newStock;
              rows[pIdx].updatedAt = now;
              rows[pIdx]["Updated Date"] = now;
            }
          });

          // Write updated stock back to Excel
          writeExcelProducts(rows);
          notifyExcelUpdated();

          const order = {
            id: orderId,
            customer: {
              name: body.customer.name,
              email: body.customer.email,
              phone: body.customer.phone || "",
              address: body.customer.address || "",
              city: body.customer.city || "",
              state: body.customer.state || "",
              zip: body.customer.zip || "",
            },
            items: body.items,
            subtotal: Number(body.subtotal) || 0,
            discount: Number(body.discount) || 0,
            shipping: Number(body.shipping) || 0,
            total: Number(body.total) || 0,
            paymentMethod: body.paymentMethod || "cod",
            paymentStatus: body.paymentStatus || "pending",
            status: "pending", // pending, processing, shipped, delivered, cancelled
            totalItems: totalItemsCount,
            createdAt: now,
            updatedAt: now,
          };

          orders.unshift(order);
          writeJSON(ORDERS_FILE, orders);

          logActivity("Order Received", `New order ${orderId} by ${order.customer.name} ($${order.total})`, "Customer");

          sendJSON(res, { success: true, orderId, order });
        } catch (err) {
          console.error("[Checkout Error]", err);
          sendError(res, err.message || "Checkout failed", 500);
        }
      });

      /* ─── PUBLIC: Categories (/api/categories) ─── */
      server.middlewares.use("/api/categories", (req, res, next) => {
        if (req.method !== "GET") return next();
        try {
          const cats = readCategories();
          const { rows } = readExcelProducts();
          const categoryCounts = {};
          rows.forEach((r) => {
            const c = (r.category || "").toLowerCase().trim();
            if (c) categoryCounts[c] = (categoryCounts[c] || 0) + 1;
          });
          const categoriesWithCounts = cats.map((c) => ({
            ...c,
            count: categoryCounts[c.slug.toLowerCase()] || 0,
          }));
          sendJSON(res, { success: true, categories: categoriesWithCounts });
        } catch (err) {
          sendJSON(res, { success: false, categories: [] });
        }
      });

      /* ─── PUBLIC: Store Info (/api/store-info) ─── */
      server.middlewares.use("/api/store-info", (req, res, next) => {
        if (req.method !== "GET") return next();
        try {
          const config = getAdminConfig();
          sendJSON(res, {
            success: true,
            whatsappNumber: config.whatsappNumber || "919876543210",
          });
        } catch {
          sendJSON(res, { success: true, whatsappNumber: "919876543210" });
        }
      });

      /* ─── ADMIN API ROUTES (/api/admin/*) ─── */
      server.middlewares.use("/api/admin", async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        const routePath = url.pathname;
        const method = req.method;

        res.setHeader("Access-Control-Allow-Credentials", "true");

        try {
          /* ── 1. AUTH: Login ── */
          if (routePath === "/login" && method === "POST") {
            const body = await parseBody(req);
            const config = getAdminConfig();

            if (!body.username || !body.password) {
              sendError(res, "Username and password required", 400);
              return;
            }

            if (body.username !== config.username || !verifyPassword(body.password, config.password)) {
              sendError(res, "Invalid username or password", 401);
              return;
            }

            const token = createJWT({ username: config.username, role: "admin" }, config.jwtSecret);
            res.setHeader("Set-Cookie", `ysk_admin_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`);
            logActivity("Login", `Admin "${config.username}" logged in`, config.username);
            sendJSON(res, { success: true, token, username: config.username });
            return;
          }

          /* ── 2. AUTH: Session check ── */
          if (routePath === "/session" && method === "GET") {
            const config = getAdminConfig();
            let token = getCookie(req, "ysk_admin_token");
            if (!token && req.headers.authorization?.startsWith("Bearer ")) {
              token = req.headers.authorization.slice(7).trim();
            }

            if (!token) {
              sendJSON(res, { authenticated: false });
              return;
            }
            const payload = verifyJWT(token, config.jwtSecret);
            sendJSON(res, {
              authenticated: !!payload,
              username: payload?.username || null,
            });
            return;
          }

          /* ── 3. AUTH: Logout ── */
          if (routePath === "/logout" && method === "POST") {
            res.setHeader("Set-Cookie", "ysk_admin_token=; Path=/; HttpOnly; Max-Age=0");
            logActivity("Logout", "Admin logged out");
            sendJSON(res, { success: true });
            return;
          }

          // ── PROTECTED ROUTES: require authenticated admin ──
          const user = requireAuth(req, res);
          if (!user) return;

          /* ── 4. STATS: Overview Metrics ── */
          if (routePath === "/stats" && method === "GET") {
            const { rows, lastModified } = readExcelProducts();
            const orders = readJSON(ORDERS_FILE, []);
            const analytics = readJSON(ANALYTICS_FILE, { visitors: [], pageViews: [] });
            const activity = readJSON(ACTIVITY_FILE, []);
            const today = new Date().toISOString().split("T")[0];
            const thisMonth = today.slice(0, 7);

            const totalStock = rows.reduce((s, r) => s + (Number(r.stock) || 0), 0);
            const outOfStock = rows.filter((r) => Number(r.stock) === 0).length;
            const lowStock = rows.filter((r) => Number(r.stock) > 0 && Number(r.stock) < 5).length;
            const categories = [...new Set(rows.map((r) => r.category).filter(Boolean))];

            const totalSold = orders
              .filter((o) => o.status !== "cancelled")
              .reduce((sum, o) => sum + (o.totalItems || o.items?.reduce((is, i) => is + (i.qty || 1), 0) || 0), 0);

            const totalRevenue = orders
              .filter((o) => o.status !== "cancelled")
              .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

            const lastProductAdded = activity.find((a) => a.action === "Product Added");
            const lastExcelUpdate = activity.find((a) => a.action.includes("Excel") || a.action.includes("Product"));

            sendJSON(res, {
              products: {
                total: rows.length,
                totalStock,
                outOfStock,
                lowStock,
                categoriesCount: categories.length,
              },
              orders: {
                total: orders.length,
                pending: orders.filter((o) => o.status === "pending").length,
                processing: orders.filter((o) => o.status === "processing").length,
                shipped: orders.filter((o) => o.status === "shipped").length,
                delivered: orders.filter((o) => o.status === "delivered").length,
                cancelled: orders.filter((o) => o.status === "cancelled").length,
                totalSold,
                totalRevenue,
              },
              visitors: {
                total: analytics.visitors.length,
                today: analytics.visitors.filter((v) => v.date === today).length,
                thisMonth: analytics.visitors.filter((v) => v.date.startsWith(thisMonth)).length,
                totalPageViews: analytics.pageViews.length,
              },
              lastProductAdded: lastProductAdded?.timestamp || null,
              lastExcelUpdate: lastExcelUpdate?.timestamp || (lastModified ? new Date(lastModified).toISOString() : null),
              recentActivity: activity.slice(0, 8),
            });
            return;
          }

          /* ── 5. PRODUCTS: List all products ── */
          if (routePath === "/products" && method === "GET") {
            const { rows, path: excelPath, lastModified } = readExcelProducts();
            sendJSON(res, {
              success: true,
              products: rows,
              source: excelPath,
              count: rows.length,
              lastModified,
            });
            return;
          }

          /* ── 6. PRODUCTS: Add new product ── */
          if (routePath === "/products" && method === "POST") {
            const body = await parseBody(req);
            const { rows } = readExcelProducts();

            if (!body.name || !body.name.trim()) {
              sendError(res, "Product name is required");
              return;
            }

            const productId = (body.id && body.id.trim()) ? body.id.trim() : generateProductId();

            if (rows.some((r) => r.id === productId || r["Product ID"] === productId)) {
              sendError(res, `Product ID "${productId}" already exists`);
              return;
            }

            // Save multiple uploaded base64 images
            const imagePaths = [];
            if (body.images && Array.isArray(body.images)) {
              body.images.forEach((img, idx) => {
                const saved = saveBase64Image(img, productId, idx + 1);
                if (saved) imagePaths.push(saved);
              });
            }

            const now = new Date().toISOString();
            const newProduct = {
              id: productId,
              name: body.name.trim(),
              brand: body.brand?.trim() || "YSK 4x4",
              category: (body.category || "accessories").toLowerCase().trim(),
              price: Number(body.price) || 0,
              compareAt: body.compareAt ? Number(body.compareAt) : undefined,
              stock: Number(body.stock) || 0,
              offer: body.offer?.trim() || "",
              fits: body.fits?.trim() || "Wrangler, Jimny, Thar",
              image: imagePaths[0] || body.image || "",
              image2: imagePaths[1] || body.image2 || "",
              image3: imagePaths[2] || body.image3 || "",
              images: imagePaths.length > 0 ? imagePaths : [body.image, body.image2, body.image3].filter(Boolean),
              rating: Number(body.rating) || 5.0,
              reviews: Number(body.reviews) || 0,
              isNew: body.isNew === true || body.isNew === "TRUE",
              bestSeller: body.bestSeller === true || body.bestSeller === "TRUE",
              description: body.description?.trim() || "",
              createdAt: now,
              updatedAt: now,
            };

            rows.push(newProduct);
            writeExcelProducts(rows);
            notifyExcelUpdated();

            logActivity("Product Added", `Added product "${newProduct.name}" (${productId})`, user.username);
            sendJSON(res, { success: true, product: newProduct });
            return;
          }

          /* ── 7. PRODUCTS: Update existing product ── */
          if (routePath === "/products" && method === "PUT") {
            const body = await parseBody(req);
            const { rows } = readExcelProducts();
            const idx = rows.findIndex((r) => r.id === body.id || r["Product ID"] === body.id);
            if (idx === -1) {
              sendError(res, "Product not found", 404);
              return;
            }

            // Handle multi-image updates if provided
            if (body.images && Array.isArray(body.images)) {
              const imagePaths = [];
              body.images.forEach((img, i) => {
                const saved = saveBase64Image(img, body.id, i + 1);
                if (saved) imagePaths.push(saved);
              });
              if (imagePaths[0]) body.image = imagePaths[0];
              if (imagePaths[1]) body.image2 = imagePaths[1];
              if (imagePaths[2]) body.image3 = imagePaths[2];
              delete body.images;
            }

            const updated = {
              ...rows[idx],
              ...body,
              price: Number(body.price !== undefined ? body.price : rows[idx].price),
              stock: Number(body.stock !== undefined ? body.stock : rows[idx].stock),
              compareAt: body.compareAt ? Number(body.compareAt) : undefined,
              updatedAt: new Date().toISOString(),
              "Updated Date": new Date().toISOString(),
            };

            rows[idx] = updated;
            writeExcelProducts(rows);
            notifyExcelUpdated();

            logActivity("Product Updated", `Updated product "${updated.name}" (${body.id})`, user.username);
            sendJSON(res, { success: true, product: updated });
            return;
          }

          /* ── 8. PRODUCTS: Delete product ── */
          if (routePath === "/products" && method === "DELETE") {
            const body = await parseBody(req);
            const { rows } = readExcelProducts();
            const idx = rows.findIndex((r) => r.id === body.id || r["Product ID"] === body.id);
            if (idx === -1) {
              sendError(res, "Product not found", 404);
              return;
            }

            const deleted = rows.splice(idx, 1)[0];

            // Clean up any uploaded image files
            for (const key of ["image", "image2", "image3"]) {
              const imgPath = deleted[key];
              if (imgPath && typeof imgPath === "string" && imgPath.startsWith("/uploads/")) {
                const fullPath = path.join(process.cwd(), "public", imgPath);
                try {
                  if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
                } catch {}
              }
            }

            writeExcelProducts(rows);
            notifyExcelUpdated();

            logActivity("Product Deleted", `Deleted "${deleted.name}" (${body.id})`, user.username);
            sendJSON(res, { success: true });
            return;
          }

          /* ── 9. ORDERS: List and Search ── */
          if (routePath === "/orders" && method === "GET") {
            const orders = readJSON(ORDERS_FILE, []);
            sendJSON(res, { success: true, orders });
            return;
          }

          /* ── 10. ORDERS: Update Status / Details ── */
          if (routePath === "/orders" && method === "PUT") {
            const body = await parseBody(req);
            const orders = readJSON(ORDERS_FILE, []);
            const idx = orders.findIndex((o) => o.id === body.id);
            if (idx === -1) {
              sendError(res, "Order not found", 404);
              return;
            }

            const oldStatus = orders[idx].status;
            orders[idx] = {
              ...orders[idx],
              ...body,
              updatedAt: new Date().toISOString(),
            };

            writeJSON(ORDERS_FILE, orders);
            logActivity(
              "Order Status Changed",
              `Order ${body.id} status changed: ${oldStatus} → ${orders[idx].status}`,
              user.username
            );
            sendJSON(res, { success: true, order: orders[idx] });
            return;
          }

          /* ── 11. ANALYTICS: Detailed visitor & product views ── */
          if (routePath === "/analytics" && method === "GET") {
            const analytics = readJSON(ANALYTICS_FILE, {
              visitors: [],
              pageViews: [],
              productViews: {},
              recentViews: [],
            });
            const today = new Date().toISOString().split("T")[0];
            const thisWeekStart = new Date(Date.now() - 7 * 864e5).toISOString().split("T")[0];
            const thisMonth = today.slice(0, 7);

            // Daily visitors aggregate (last 14 days)
            const dailyMap = {};
            const d = new Date();
            for (let i = 13; i >= 0; i--) {
              const dt = new Date(Date.now() - i * 864e5).toISOString().split("T")[0];
              dailyMap[dt] = 0;
            }
            analytics.visitors.forEach((v) => {
              if (dailyMap[v.date] !== undefined) dailyMap[v.date]++;
            });
            const dailyVisitors = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

            // Top visited pages
            const pageMap = {};
            analytics.pageViews.forEach((pv) => {
              pageMap[pv.page] = (pageMap[pv.page] || 0) + 1;
            });
            const topPages = Object.entries(pageMap)
              .map(([page, views]) => ({ page, views }))
              .sort((a, b) => b.views - a.views)
              .slice(0, 10);

            // Product views
            const { rows: products } = readExcelProducts();
            const productViewsList = Object.entries(analytics.productViews || {})
              .map(([productId, views]) => {
                const prod = products.find((p) => p.id === productId || p["Product ID"] === productId);
                return {
                  productId,
                  name: prod ? prod.name : productId,
                  views,
                  category: prod ? prod.category : "",
                  price: prod ? prod.price : 0,
                  image: prod ? prod.image : "",
                };
              })
              .sort((a, b) => b.views - a.views)
              .slice(0, 10);

            sendJSON(res, {
              totalVisitors: analytics.visitors.length,
              todayVisitors: analytics.visitors.filter((v) => v.date === today).length,
              weeklyVisitors: analytics.visitors.filter((v) => v.date >= thisWeekStart).length,
              monthlyVisitors: analytics.visitors.filter((v) => v.date.startsWith(thisMonth)).length,
              totalPageViews: analytics.pageViews.length,
              dailyVisitors,
              topPages,
              productViews: productViewsList,
              recentProductViews: (analytics.recentViews || []).slice(0, 15),
            });
            return;
          }

          /* ── 12. ACTIVITY: Action history ── */
          if (routePath === "/activity" && method === "GET") {
            const activity = readJSON(ACTIVITY_FILE, []);
            sendJSON(res, { success: true, activity });
            return;
          }

          /* ── 13. EXCEL: Info & Metadata ── */
          if (routePath === "/excel/info" && method === "GET") {
            const target = getPrimaryExcelPath();
            const exists = fs.existsSync(target);
            const stats = exists ? fs.statSync(target) : null;
            const { rows } = readExcelProducts();

            sendJSON(res, {
              success: true,
              filename: path.basename(target),
              path: target,
              exists,
              sizeBytes: stats ? stats.size : 0,
              lastModified: stats ? stats.mtime.toISOString() : null,
              rowCount: rows.length,
            });
            return;
          }

          /* ── 14. EXCEL: Export products.xlsx ── */
          if (routePath === "/excel/export" && method === "GET") {
            const target = getPrimaryExcelPath();
            if (!fs.existsSync(target)) {
              sendError(res, "Excel file not found", 404);
              return;
            }
            const data = fs.readFileSync(target);
            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            res.setHeader("Content-Disposition", "attachment; filename=products.xlsx");
            res.end(data);
            return;
          }

          /* ── 15. EXCEL: Import .xlsx file ── */
          if (routePath === "/excel/import" && method === "POST") {
            const body = await parseBody(req);
            if (!body.data) {
              sendError(res, "No Excel file data received");
              return;
            }
            try {
              const buffer = Buffer.from(body.data, "base64");
              const wb = XLSX.read(buffer, { type: "buffer" });
              const sheet = wb.Sheets[wb.SheetNames[0]];
              const rawRows = XLSX.utils.sheet_to_json(sheet);

              if (rawRows.length === 0) {
                sendError(res, "Uploaded Excel file is empty");
                return;
              }

              const normalized = rawRows.map((r, i) => normalizeProductRow(r, i));
              writeExcelProducts(normalized);
              notifyExcelUpdated();

              logActivity("Excel Imported", `Imported ${normalized.length} products from Excel`, user.username);
              sendJSON(res, { success: true, count: normalized.length });
            } catch (err) {
              sendError(res, `Failed to parse Excel file: ${err.message}`);
            }
            return;
          }

          /* ── 16. EXCEL: Manual Force Synchronize ── */
          if (routePath === "/excel/sync" && method === "POST") {
            const { rows, path: p, lastModified } = readExcelProducts();
            writeExcelProducts(rows);
            notifyExcelUpdated();
            logActivity("Excel Synchronized", `Manual Excel synchronization (${rows.length} items)`, user.username);
            sendJSON(res, { success: true, count: rows.length, path: p, lastModified });
            return;
          }

          /* ── 17. CATEGORIES: List, Add, Edit, Delete ── */
          if (routePath === "/categories" && method === "GET") {
            const cats = readCategories();
            const { rows } = readExcelProducts();
            const categoryCounts = {};
            rows.forEach((r) => {
              const c = (r.category || "").toLowerCase().trim();
              if (c) categoryCounts[c] = (categoryCounts[c] || 0) + 1;
            });
            const categories = cats.map((c) => ({
              ...c,
              count: categoryCounts[c.slug.toLowerCase()] || 0,
            }));
            sendJSON(res, { success: true, categories });
            return;
          }

          if (routePath === "/categories" && method === "POST") {
            const body = await parseBody(req);
            if (!body.name || !body.name.trim()) {
              sendError(res, "Category name is required");
              return;
            }
            const name = body.name.trim();
            const slug = (body.slug && body.slug.trim())
              ? body.slug.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-")
              : name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

            const cats = readCategories();
            if (cats.some((c) => c.slug === slug)) {
              sendError(res, `Category with slug "${slug}" already exists`);
              return;
            }

            let imageUrl = "/images/categories/cat-suspension.jpg";
            if (body.image) {
              const saved = saveBase64CategoryImage(body.image, slug);
              if (saved) imageUrl = saved;
            }

            const newCategory = {
              slug,
              name,
              description: body.description?.trim() || "",
              image: imageUrl,
            };

            cats.push(newCategory);
            writeJSON(CATEGORIES_FILE, cats);
            logActivity("Category Added", `Added category "${name}" (${slug})`, user.username);
            sendJSON(res, { success: true, category: newCategory });
            return;
          }

          if (routePath === "/categories" && method === "PUT") {
            const body = await parseBody(req);
            if (!body.slug) {
              sendError(res, "Category slug is required");
              return;
            }
            const cats = readCategories();
            const idx = cats.findIndex((c) => c.slug === body.slug);
            if (idx === -1) {
              sendError(res, "Category not found");
              return;
            }

            let imageUrl = cats[idx].image;
            if (body.image && body.image !== cats[idx].image) {
              const saved = saveBase64CategoryImage(body.image, body.slug);
              if (saved) imageUrl = saved;
            }

            cats[idx] = {
              ...cats[idx],
              name: body.name?.trim() || cats[idx].name,
              description: body.description !== undefined ? body.description.trim() : cats[idx].description,
              image: imageUrl,
            };

            writeJSON(CATEGORIES_FILE, cats);
            logActivity("Category Updated", `Updated category "${cats[idx].name}"`, user.username);
            sendJSON(res, { success: true, category: cats[idx] });
            return;
          }

          if (routePath === "/categories" && method === "DELETE") {
            const body = await parseBody(req);
            if (!body.slug) {
              sendError(res, "Category slug is required");
              return;
            }
            let cats = readCategories();
            const found = cats.find((c) => c.slug === body.slug);
            if (!found) {
              sendError(res, "Category not found");
              return;
            }
            cats = cats.filter((c) => c.slug !== body.slug);
            writeJSON(CATEGORIES_FILE, cats);
            logActivity("Category Deleted", `Deleted category "${found.name}"`, user.username);
            sendJSON(res, { success: true });
            return;
          }

          /* ── 18. SETTINGS: Get & Update ── */
          if (routePath === "/settings" && method === "GET") {
            const config = getAdminConfig();
            sendJSON(res, {
              username: config.username,
              createdAt: config.createdAt,
              excelPath: getPrimaryExcelPath(),
              uploadDir: UPLOAD_DIR,
              whatsappNumber: config.whatsappNumber || "919876543210",
            });
            return;
          }

          if (routePath === "/settings" && method === "PUT") {
            const body = await parseBody(req);
            const config = getAdminConfig();

            if (body.username && body.username.trim()) {
              config.username = body.username.trim();
            }

            if (body.whatsappNumber !== undefined) {
              config.whatsappNumber = String(body.whatsappNumber).trim();
            }

            if (body.newPassword) {
              if (!body.currentPassword || !verifyPassword(body.currentPassword, config.password)) {
                sendError(res, "Current password is incorrect");
                return;
              }
              if (body.newPassword.length < 6) {
                sendError(res, "New password must be at least 6 characters long");
                return;
              }
              config.password = hashPassword(body.newPassword);
              logActivity("Password Changed", "Admin password was updated", config.username);
            }

            writeJSON(ADMIN_CFG, config);
            logActivity("Settings Updated", "Admin configuration & WhatsApp number updated", config.username);
            sendJSON(res, { success: true, username: config.username, whatsappNumber: config.whatsappNumber });
            return;
          }

          // Unmatched admin route
          sendError(res, `Route ${routePath} not found`, 404);
        } catch (err) {
          console.error("[Admin API Route Error]", err);
          sendError(res, err.message || "Internal server error", 500);
        }
      });
    },
  };
}
