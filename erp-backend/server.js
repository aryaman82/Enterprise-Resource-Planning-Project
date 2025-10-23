
import express from "express";
import dotenv from "dotenv";
import pool from "./src/db.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import shiftScheduleRoutes from "./routes/shiftScheduleRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";

import path from "path";
import fs from 'fs';
import { fileURLToPath, pathToFileURL } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5173;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const syncPath = path.join(__dirname, "src", "services", "syncService.js");
const schedPath = path.join(__dirname, "src", "scheduler", "scheduler.js");

// Middlewares
app.use(express.json());
// Serve built frontend if available (public/dist), otherwise serve public for development
const distPath = path.join(__dirname, 'public', 'dist');
const staticPath = fs.existsSync(distPath) ? distPath : path.join(__dirname, 'public');
app.use(express.static(staticPath));
// Employee routes
app.use("/api/employees", employeeRoutes);

// Shift routes
app.use("/api/shifts", shiftRoutes);

// Shift schedule routes
app.use("/api/shift-schedules", shiftScheduleRoutes);

// Attendance routes
app.use("/api/attendance", attendanceRoutes);

app.get("/", (req, res) => {
    // Prefer built index.html in dist
    const indexPath = path.join(staticPath, 'index.html');
    res.sendFile(indexPath);
});

// Manual trigger endpoint with in-process lock
let isSyncRunning = false;
app.post("/api/punch-sync", async (req, res) => {
    if (isSyncRunning) return res.status(409).json({ success: false, error: "Sync already in progress" });
    isSyncRunning = true;
    try {
    const syncMod = (await import(pathToFileURL(syncPath).href)).default;
    const days = Number(req.body?.forceBackfillDays || 0);
    const result = await syncMod.syncPunchData(days > 0 ? { forceBackfillDays: days } : {});
        res.json({ success: true, ...result });
    } catch (e) {
        console.error("Manual punch sync failed:", e.message);
        res.status(500).json({ success: false, error: e.message });
    } finally {
        isSyncRunning = false;
    }
});

// Explicit range import endpoint
app.post("/api/punch-sync/range", async (req, res) => {
    if (isSyncRunning) return res.status(409).json({ success: false, error: "Sync already in progress" });
    isSyncRunning = true;
    try {
        const syncMod = (await import(pathToFileURL(syncPath).href)).default;
        const { from, to, empcode } = req.body || {};
        if (!from || !to) {
            return res.status(400).json({ success: false, error: "from and to are required (YYYY-MM-DD)" });
        }
        const result = await syncMod.syncPunchDataRange({ from, to, empcode });
        res.json({ success: true, ...result });
    } catch (e) {
        console.error("Range punch sync failed:", e.message);
        res.status(500).json({ success: false, error: e.message });
    } finally {
        isSyncRunning = false;
    }
});


app.listen(PORT, async () => {
    console.log(`✅ Backend running on http://localhost:${PORT}`);

    // Test DB connection at startup
    try {
        const result = await pool.query("SELECT NOW()");
        console.log(`📅 Database connected: ${result.rows[0].now}`);
    } catch (err) {
        console.error("❌ Database connection failed:", err.message);
    }

    // Start punch sync service (immediate + scheduler)
    try {
    const syncApp = (await import(pathToFileURL(syncPath).href)).default;
    const schedulerMod = (await import(pathToFileURL(schedPath).href)).default;
    // Immediate sync
    syncApp.syncPunchData().catch((e) => console.error("Initial punch sync failed:", e.message));
    // Start scheduler
    schedulerMod.startScheduler();
        console.log("🕒 Punch sync service started (5-min interval)");
    } catch (e) {
        console.error("⚠️ Failed to start punch sync service:", e.message);
    }
});
