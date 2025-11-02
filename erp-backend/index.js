// server.js (or index.js)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";
import shiftScheduleRoutes from "./routes/shiftScheduleRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import cupTypeRoutes from "./routes/cupTypeRoutes.js";
import migrationRoutes from "./routes/migrationRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import machineRoutes from "./routes/machineRoutes.js";
import productionScheduleRoutes from "./routes/productionScheduleRoutes.js";
// Punch sync service (CommonJS modules; import via dynamic require)
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const syncPath = path.join(__dirname, "punch-sync-service", "src", "services", "syncService.js");
const schedPath = path.join(__dirname, "punch-sync-service", "src", "scheduler", "scheduler.js");

// Middlewares
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow all localhost origins for development (any port)
        if (origin.includes('localhost') || 
            origin.includes('127.0.0.1') || 
            origin.startsWith('http://localhost:') ||
            origin.startsWith('http://127.0.0.1:')) {
            return callback(null, true);
        }
        
        // For production, you would check against specific allowed origins
        callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200 // For legacy browser support
}));
app.use(express.json());

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

// Test DB connection route
app.get("/api/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ success: true, time: result.rows[0] });
    } catch (err) {
        console.error("Database connection error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Employee routes
app.use("/api/employees", employeeRoutes);

// Shift routes
app.use("/api/shifts", shiftRoutes);

// Shift schedule routes
app.use("/api/shift-schedules", shiftScheduleRoutes);

// Attendance routes
app.use("/api/attendance", attendanceRoutes);

// Order routes
app.use("/api/orders", orderRoutes);

// Client routes
app.use("/api/clients", clientRoutes);

// Design routes
app.use("/api/designs", designRoutes);

// Cup Type routes
app.use("/api/cup-types", cupTypeRoutes);

// Migration routes
app.use("/api/migrations", migrationRoutes);

// Department routes
app.use("/api/departments", departmentRoutes);

// Machine routes
app.use("/api/machines", machineRoutes);

// Production schedule routes
app.use("/api/production-schedules", productionScheduleRoutes);

// 404 handler for unmatched routes
app.use((req, res) => {
    res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Server error:", err.stack);
    res.status(500).json({ success: false, error: "Internal server error" });
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
