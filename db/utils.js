const db = require('./config');

/**
 * Utility functions for database operations
 */

// Check if a table exists
async function tableExists(tableName) {
    try {
        const result = await db.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = $1
            )
        `, [tableName]);
        
        return result.rows[0].exists;
    } catch (error) {
        console.error(`Error checking if table ${tableName} exists:`, error.message);
        return false;
    }
}

// Get all table names
async function getAllTables() {
    try {
        const result = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `);
        
        return result.rows.map(row => row.table_name);
    } catch (error) {
        console.error('Error getting table list:', error.message);
        return [];
    }
}

// Count rows in a table
async function countRows(tableName) {
    try {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`);
        return parseInt(result.rows[0].count);
    } catch (error) {
        console.error(`Error counting rows in ${tableName}:`, error.message);
        return 0;
    }
}

// Get table schema information
async function getTableSchema(tableName) {
    try {
        const result = await db.query(`
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default
            FROM information_schema.columns
            WHERE table_schema = 'public' 
            AND table_name = $1
            ORDER BY ordinal_position
        `, [tableName]);
        
        return result.rows;
    } catch (error) {
        console.error(`Error getting schema for ${tableName}:`, error.message);
        return [];
    }
}

// Drop all tables (use with caution!)
async function dropAllTables() {
    try {
        const tables = await getAllTables();
        
        if (tables.length === 0) {
            console.log('No tables to drop');
            return;
        }
        
        // Drop tables in reverse order to handle foreign key constraints
        for (const table of tables.reverse()) {
            await db.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
            console.log(`Dropped table: ${table}`);
        }
        
        console.log('All tables dropped successfully');
    } catch (error) {
        console.error('Error dropping tables:', error.message);
        throw error;
    }
}

// Reset database (drop all tables and recreate)
async function resetDatabase() {
    try {
        console.log('Resetting database...');
        await dropAllTables();
        console.log('Database reset completed');
    } catch (error) {
        console.error('Error resetting database:', error.message);
        throw error;
    }
}

module.exports = {
    tableExists,
    getAllTables,
    countRows,
    getTableSchema,
    dropAllTables,
    resetDatabase
};