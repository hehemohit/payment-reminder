import db from './init.js';

async function runMigration() {
    try {
        console.log('Running migration to add final_amount field...');
        
        // Add final_amount column to clients table
        await new Promise((resolve, reject) => {
            db.run('ALTER TABLE clients ADD COLUMN final_amount DECIMAL(10,2) DEFAULT 0.00', (err) => {
                if (err && !err.message.includes('duplicate column name')) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
        
        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
