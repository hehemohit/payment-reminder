import db from './init.js';

async function updateFinalAmounts() {
    try {
        console.log('Updating final amounts for existing clients...');
        
        // Get all clients with their pending amounts
        const clients = await new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    c.id,
                    c.name,
                    SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) as pending_amount
                FROM clients c
                LEFT JOIN payments p ON c.id = p.client_id
                GROUP BY c.id
            `;
            
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });

        // Update each client's final_amount to their pending_amount
        for (const client of clients) {
            await new Promise((resolve, reject) => {
                const query = `
                    UPDATE clients 
                    SET final_amount = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `;
                
                db.run(query, [client.pending_amount || 0, client.id], function(err) {
                    if (err) reject(err);
                    else {
                        console.log(`Updated ${client.name}: final_amount = $${client.pending_amount || 0}`);
                        resolve();
                    }
                });
            });
        }
        
        console.log('Final amounts updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Update failed:', error);
        process.exit(1);
    }
}

updateFinalAmounts();
