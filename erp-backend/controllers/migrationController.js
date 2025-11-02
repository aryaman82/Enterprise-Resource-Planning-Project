import pool from "../db.js";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Run a migration file by name
 * Security: Only allows files from the migrations directory
 */
export const runMigration = async (req, res) => {
    try {
        const { filename } = req.params;

        // Security: Prevent path traversal attacks
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid migration filename'
            });
        }

        // Ensure file is in migrations directory
        const migrationsDir = path.join(__dirname, '../migrations');
        const migrationPath = path.join(migrationsDir, filename);

        // Verify file exists
        try {
            await fs.access(migrationPath);
        } catch (err) {
            return res.status(404).json({
                success: false,
                message: `Migration file not found: ${filename}`
            });
        }

        // Read the migration file
        const sql = await fs.readFile(migrationPath, 'utf8');

        // Execute the migration
        await pool.query(sql);

        res.json({
            success: true,
            message: `Migration ${filename} executed successfully`,
            filename: filename
        });
    } catch (err) {
        console.error('Error running migration:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to run migration',
            error: err.message
        });
    }
};

/**
 * List all available migration files
 */
export const listMigrations = async (req, res) => {
    try {
        const migrationsDir = path.join(__dirname, '../migrations');
        const files = await fs.readdir(migrationsDir);
        const sqlFiles = files.filter(file => file.endsWith('.sql'));

        res.json({
            success: true,
            migrations: sqlFiles
        });
    } catch (err) {
        console.error('Error listing migrations:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to list migrations',
            error: err.message
        });
    }
};

