import express from "express";
import { runMigration, listMigrations } from "../controllers/migrationController.js";

const router = express.Router();

// List all available migrations
router.get("/", listMigrations);

// Run a specific migration by filename
router.post("/run/:filename", runMigration);

export default router;

