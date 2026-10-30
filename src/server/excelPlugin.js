import fs from "fs";
import path from "path";
import XLSX from "xlsx";

const ONEDRIVE_PATH = "C:\\Users\\Roshin.A\\OneDrive\\Videos\\AnyDesk\\ysk-ecom.xlsx";
const PRODUCTS_PATH = path.resolve(process.cwd(), "products.xlsx");
const LOCAL_PATH = path.resolve(process.cwd(), "ysk-ecom.xlsx");
const JSON_CACHE = path.resolve(process.cwd(), "src/data/productsFromExcel.json");

export function excelSyncPlugin() {
  function getActiveExcelTarget() {
    const candidates = [PRODUCTS_PATH, LOCAL_PATH, ONEDRIVE_PATH].filter((p) =>
      fs.existsSync(p)
    );
    if (candidates.length === 0) return PRODUCTS_PATH;

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

  function readExcelRows() {
    const target = getActiveExcelTarget();
    try {
      if (fs.existsSync(target)) {
        const buf = fs.readFileSync(target);
        const wb = XLSX.read(buf, { type: "buffer" });
        const sheetName = wb.SheetNames[0];
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
        const safeRows = Array.isArray(rows) ? rows : [];
        const mtime = fs.statSync(target).mtimeMs;
        return { rows: safeRows, path: target, lastModified: mtime };
      }
    } catch (e) {
      console.warn(`[Excel Sync] Warning reading ${target}:`, e.message);
    }

    if (fs.existsSync(JSON_CACHE)) {
      try {
        const rows = JSON.parse(fs.readFileSync(JSON_CACHE, "utf8"));
        return { rows: Array.isArray(rows) ? rows : [], path: "cached-json", lastModified: fs.statSync(JSON_CACHE).mtimeMs };
      } catch (e3) { }
    }
    return { rows: [], path: "none", lastModified: 0 };
  }

  function syncCache() {
    try {
      const { rows, path: sourcePath } = readExcelRows();
      const safeRows = Array.isArray(rows) ? rows : [];
      fs.mkdirSync(path.dirname(JSON_CACHE), { recursive: true });
      fs.writeFileSync(JSON_CACHE, JSON.stringify(safeRows, null, 2), "utf8");

      // Auto-mirror to other Excel files so they never diverge
      const wb = XLSX.utils.book_new();
      const ws = safeRows.length > 0
        ? XLSX.utils.json_to_sheet(safeRows)
        : XLSX.utils.aoa_to_sheet([["Product ID", "Product Name", "Category", "Price", "Stock", "Description", "Image 1", "Image 2", "Image 3", "Created Date", "Updated Date"]]);
      XLSX.utils.book_append_sheet(wb, ws, "Products");

      if (sourcePath !== PRODUCTS_PATH && fs.existsSync(PRODUCTS_PATH)) {
        try { XLSX.writeFile(wb, PRODUCTS_PATH); } catch {}
      }
      if (sourcePath !== LOCAL_PATH && fs.existsSync(LOCAL_PATH)) {
        try { XLSX.writeFile(wb, LOCAL_PATH); } catch {}
      }
    } catch (e) {
      console.error("[Excel Sync] Cache error:", e.message);
    }
  }

  return {
    name: "excel-sync-plugin",
    configureServer(server) {
      syncCache();

      try {
        if (fs.existsSync(PRODUCTS_PATH)) {
          server.watcher.add(PRODUCTS_PATH);
        }
      } catch (e) { }

      try {
        if (fs.existsSync(ONEDRIVE_PATH)) {
          server.watcher.add(ONEDRIVE_PATH);
        }
      } catch (e) { }

      try {
        if (fs.existsSync(LOCAL_PATH)) {
          server.watcher.add(LOCAL_PATH);
        }
      } catch (e) { }

      let lastKnownMtime = 0;
      function notifyIfChanged() {
        try {
          const target = getActiveExcelTarget();
          if (fs.existsSync(target)) {
            const currentMtime = fs.statSync(target).mtimeMs;
            if (currentMtime !== lastKnownMtime) {
              lastKnownMtime = currentMtime;
              syncCache();
              server.ws.send({
                type: "custom",
                event: "excel-updated",
                data: { timestamp: Date.now() },
              });
            }
          }
        } catch {}
      }

      server.watcher.on("change", (file) => {
        if (file && file.endsWith(".xlsx") && !file.includes("~$")) {
          console.log(`[Excel Sync] Detected change in: ${file}`);
          notifyIfChanged();
        }
      });

      // Periodic check every 2.5s for Windows Excel atomic saves
      const interval = setInterval(notifyIfChanged, 2500);
      server.httpServer?.on?.("close", () => clearInterval(interval));

      // HTTP Endpoint to fetch real-time Excel products
      server.middlewares.use("/api/excel-products", (req, res) => {
        try {
          const { rows, path: sourcePath, lastModified } = readExcelRows();

          // Return only real Excel rows — no fallback cache
          // Empty Excel = empty response = no products shown on page
          res.setHeader("Content-Type", "application/json");
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.end(
            JSON.stringify({
              success: true,
              source: sourcePath,
              lastModified,
              count: rows.length,
              rows,
            })
          );
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message, rows: [] }));
        }
      });
    },
  };
}

