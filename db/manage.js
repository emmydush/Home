#!/usr/bin/env node

const { tableExists, getAllTables, countRows, getTableSchema, resetDatabase } = require('./utils');
const db = require('./config');

async function main() {
    const args = process.argv.slice(2);
    const command = args[0];
    
    try {
        switch (command) {
            case 'list-tables':
                await listTables();
                break;
                
            case 'table-info':
                if (!args[1]) {
                    console.log('Usage: node db/manage.js table-info <table-name>');
                    process.exit(1);
                }
                await tableInfo(args[1]);
                break;
                
            case 'table-count':
                if (!args[1]) {
                    console.log('Usage: node db/manage.js table-count <table-name>');
                    process.exit(1);
                }
                await tableCount(args[1]);
                break;
                
            case 'reset':
                await resetDb();
                break;
                
            case 'status':
                await dbStatus();
                break;
                
            default:
                showHelp();
                process.exit(1);
        }
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

async function listTables() {
    console.log('📦 Database Tables:');
    const tables = await getAllTables();
    
    if (tables.length === 0) {
        console.log('No tables found');
        return;
    }
    
    for (const table of tables) {
        const count = await countRows(table);
        console.log(`  - ${table} (${count} rows)`);
    }
}

async function tableInfo(tableName) {
    const exists = await tableExists(tableName);
    
    if (!exists) {
        console.log(`Table '${tableName}' does not exist`);
        return;
    }
    
    console.log(`📋 Table: ${tableName}`);
    console.log('Columns:');
    
    const schema = await getTableSchema(tableName);
    schema.forEach(column => {
        console.log(`  ${column.column_name} (${column.data_type}) ${
            column.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'
        }${
            column.column_default ? ` DEFAULT ${column.column_default}` : ''
        }`);
    });
}

async function tableCount(tableName) {
    const exists = await tableExists(tableName);
    
    if (!exists) {
        console.log(`Table '${tableName}' does not exist`);
        return;
    }
    
    const count = await countRows(tableName);
    console.log(`${tableName}: ${count} rows`);
}

async function resetDb() {
    const answer = await prompt('⚠️  This will delete all data. Are you sure? (yes/no): ');
    
    if (answer.toLowerCase() !== 'yes') {
        console.log('Reset cancelled');
        return;
    }
    
    await resetDatabase();
    console.log('✅ Database reset completed');
}

async function dbStatus() {
    try {
        const result = await db.query('SELECT NOW() as time, current_database() as database');
        console.log('✅ Database Status:');
        console.log(`  Database: ${result.rows[0].database}`);
        console.log(`  Current Time: ${result.rows[0].time}`);
        
        const tables = await getAllTables();
        console.log(`  Tables: ${tables.length}`);
    } catch (error) {
        console.log('❌ Database Status: Disconnected');
        console.log(`  Error: ${error.message}`);
    }
}

function showHelp() {
    console.log(`
Database Management Tool
========================

Usage: node db/manage.js <command>

Commands:
  list-tables     List all tables and row counts
  table-info      Show table schema information
  table-count     Show row count for a table
  status          Show database connection status
  reset           Reset database (delete all tables)

Examples:
  node db/manage.js list-tables
  node db/manage.js table-info users
  node db/manage.js table-count jobs
  node db/manage.js status
    `);
}

// Simple prompt function for user input
function prompt(question) {
    return new Promise((resolve) => {
        process.stdout.write(question);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');
        process.stdin.on('data', function(data) {
            process.stdin.pause();
            resolve(data.trim());
        });
    });
}

// Run the main function
if (require.main === module) {
    main();
}

module.exports = {
    listTables,
    tableInfo,
    tableCount,
    resetDb,
    dbStatus
};