const fs = require("fs");
const path = require("path");
const { EventEmitter } = require("events");

// Import the plugin
async function runUnitTests() {
  console.log("=== Testing Admin Plugin & Excel System ===");
  const { adminPlugin } = await import("../src/server/adminPlugin.js");

  const plugin = adminPlugin();
  const middlewares = [];
  const fakeServer = {
    middlewares: {
      use: (prefix, handler) => {
        if (!handler) {
          handler = prefix;
          prefix = "/";
        }
        middlewares.push({ prefix, handler });
      },
    },
    ws: { send: () => {} },
  };

  plugin.configureServer(fakeServer);
  console.log(`Registered ${middlewares.length} middlewares in Vite.`);

  // Helper to simulate request / response
  function simulateRequest(method, urlPath, body, headers = {}) {
    return new Promise((resolve) => {
      const req = new EventEmitter();
      req.method = method;
      req.url = urlPath;
      req.headers = { ...headers };
      req.socket = { remoteAddress: "127.0.0.1" };

      const res = {
        statusCode: 200,
        headers: {},
        setHeader(k, v) {
          this.headers[k.toLowerCase()] = v;
        },
        end(data) {
          try {
            resolve({ status: this.statusCode, headers: this.headers, json: JSON.parse(data) });
          } catch {
            resolve({ status: this.statusCode, headers: this.headers, text: data });
          }
        },
      };

      // Find matching middleware
      const mw = middlewares.find((m) => urlPath.startsWith(m.prefix));
      if (!mw) {
        return resolve({ status: 404, error: "No middleware found" });
      }

      // Adjust relative path for middleware
      const origUrl = req.url;
      req.url = urlPath.slice(mw.prefix.length) || "/";

      mw.handler(req, res, () => {
        resolve({ status: 404, error: "Next called" });
      });

      if (body) {
        const payload = Buffer.from(typeof body === "string" ? body : JSON.stringify(body));
        req.emit("data", payload);
      }
      req.emit("end");
    });
  }

  // 1. Test Session (Unauthenticated)
  console.log("\n1. Testing GET /api/admin/session (Unauthenticated)...");
  const s1 = await simulateRequest("GET", "/api/admin/session");
  console.log("Response:", s1.json);
  if (s1.json?.authenticated !== false) throw new Error("Expected authenticated: false");

  // 2. Test Login
  console.log("\n2. Testing POST /api/admin/login...");
  const loginRes = await simulateRequest("POST", "/api/admin/login", {
    username: "admin",
    password: "YSK@admin2024",
  });
  console.log("Response:", loginRes.status, loginRes.json);
  if (!loginRes.json?.success) throw new Error("Login failed");
  const token = loginRes.json.token;
  const cookie = loginRes.headers["set-cookie"];
  console.log("Token received:", token ? token.slice(0, 20) + "..." : "none");

  // 3. Test Session (Authenticated via Bearer Token)
  console.log("\n3. Testing GET /api/admin/session (Authenticated)...");
  const s2 = await simulateRequest("GET", "/api/admin/session", null, {
    authorization: `Bearer ${token}`,
  });
  console.log("Response:", s2.json);
  if (!s2.json?.authenticated) throw new Error("Expected authenticated: true");

  // 4. Test Public Visitor Tracking
  console.log("\n4. Testing POST /api/track...");
  const trackRes = await simulateRequest("POST", "/api/track", {
    page: "/shop",
    productId: "YSK001",
    productName: "Jimny Front Bumper",
  });
  console.log("Response:", trackRes.json);
  if (!trackRes.json?.success) throw new Error("Track failed");

  // 5. Test Customer Checkout
  console.log("\n5. Testing Customer Checkout (POST /api/checkout)...");
  const checkoutRes = await simulateRequest("POST", "/api/checkout", {
    customer: {
      name: "Roshin",
      email: "roshin@example.com",
      phone: "+91 9999999999",
      address: "123 Off-Road St",
      city: "Bangalore",
      state: "KA",
      zip: "560001",
    },
    items: [
      {
        slug: "YSK001",
        name: "Jimny Front Bumper",
        price: 1500,
        qty: 1,
      },
    ],
    subtotal: 1500,
    discount: 0,
    shipping: 0,
    total: 1500,
    paymentMethod: "cod",
  });
  console.log("Checkout Result:", checkoutRes.json?.orderId, "Status:", checkoutRes.status);
  if (!checkoutRes.json?.success) throw new Error("Checkout failed");
  const testOrderId = checkoutRes.json.orderId;

  // 6. Test Stats
  console.log("\n6. Testing GET /api/admin/stats...");
  const statsRes = await simulateRequest("GET", "/api/admin/stats", null, {
    authorization: `Bearer ${token}`,
  });
  console.log("Stats Products Count:", statsRes.json?.products?.total);
  console.log("Stats Orders Count:", statsRes.json?.orders?.total);
  console.log("Stats Visitors Today:", statsRes.json?.visitors?.today);

  // 7. Test Add Product with Multi-Images
  console.log("\n7. Testing POST /api/admin/products (Adding new product)...");
  const sampleBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const newProdRes = await simulateRequest("POST", "/api/admin/products", {
    id: "YSK999",
    name: "Heavy Duty Recovery Winch 12000lb",
    category: "recovery",
    brand: "YSK 4x4",
    price: 799,
    stock: 8,
    description: "Synthetic rope 12000lb waterproof winch.",
    images: [sampleBase64, sampleBase64],
  }, {
    authorization: `Bearer ${token}`,
  });
  console.log("Product Added:", newProdRes.json?.product?.name, "Images:", newProdRes.json?.product?.images);
  if (!newProdRes.json?.success) throw new Error("Add product failed: " + newProdRes.json?.error);

  // Verify it exists in products.xlsx
  const XLSX = require("xlsx");
  const wb = XLSX.readFile(path.resolve(process.cwd(), "products.xlsx"));
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);
  const foundInExcel = rows.find((r) => (r["Product ID"] || r.id) === "YSK999");
  console.log("Found YSK999 in products.xlsx:", !!foundInExcel);
  if (!foundInExcel) throw new Error("Product was not saved to products.xlsx");

  // 8. Test Edit Product
  console.log("\n8. Testing PUT /api/admin/products...");
  const editProdRes = await simulateRequest("PUT", "/api/admin/products", {
    id: "YSK999",
    price: 849,
    stock: 12,
  }, {
    authorization: `Bearer ${token}`,
  });
  console.log("Product Updated:", editProdRes.json?.success, "New price:", editProdRes.json?.product?.price);

  // 9. Test Delete Product
  console.log("\n9. Testing DELETE /api/admin/products...");
  const delProdRes = await simulateRequest("DELETE", "/api/admin/products", {
    id: "YSK999",
  }, {
    authorization: `Bearer ${token}`,
  });
  console.log("Product Deleted:", delProdRes.json?.success);

  // 10. Test Orders List and Status Update
  console.log("\n10. Testing Order Management (List & Status update)...");
  const ordersListRes = await simulateRequest("GET", "/api/admin/orders", null, {
    authorization: `Bearer ${token}`,
  });
  console.log(`Total orders in system: ${ordersListRes.json?.orders?.length}`);

  const updateOrderRes = await simulateRequest("PUT", "/api/admin/orders", {
    id: testOrderId,
    status: "processing",
  }, {
    authorization: `Bearer ${token}`,
  });
  console.log("Order status changed to:", updateOrderRes.json?.order?.status);
  if (updateOrderRes.json?.order?.status !== "processing") throw new Error("Order status update failed");

  // 11. Test Excel Export Endpoint
  console.log("\n11. Testing Excel Export...");
  const exportRes = await simulateRequest("GET", "/api/admin/excel/export", null, {
    authorization: `Bearer ${token}`,
  });
  console.log("Export Response status:", exportRes.status, "Content-Type:", exportRes.headers["content-type"]);

  // 12. Test Activity History
  console.log("\n12. Testing Activity Log...");
  const actRes = await simulateRequest("GET", "/api/admin/activity", null, {
    authorization: `Bearer ${token}`,
  });
  console.log(`Activity entries logged: ${actRes.json?.activity?.length}`);
  console.log("Latest action:", actRes.json?.activity?.[0]?.action);

  console.log("\n==============================================");
  console.log("ALL ADMIN BACKEND TESTS COMPLETED SUCCESSFULLY!");
  console.log("==============================================");
}

runUnitTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

