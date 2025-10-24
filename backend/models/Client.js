import db from '../database/init.js';

export class Client {
    static async getAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    c.*,
                    COUNT(p.id) as total_payments,
                    SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) as pending_amount,
                    SUM(CASE WHEN p.status = 'overdue' THEN p.amount ELSE 0 END) as overdue_amount,
                    COALESCE(c.final_amount, 0) as final_amount
                FROM clients c
                LEFT JOIN payments p ON c.id = p.client_id
                GROUP BY c.id
                ORDER BY c.name
            `;
            
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            const query = 'SELECT * FROM clients WHERE id = ?';
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async create(clientData) {
        return new Promise((resolve, reject) => {
            const { name, email, company, phone } = clientData;
            const query = `
                INSERT INTO clients (name, email, company, phone, final_amount)
                VALUES (?, ?, ?, ?, 0.00)
            `;
            
            db.run(query, [name, email, company, phone], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...clientData });
            });
        });
    }

    static async update(id, clientData) {
        return new Promise((resolve, reject) => {
            const { name, email, company, phone } = clientData;
            const query = `
                UPDATE clients 
                SET name = ?, email = ?, company = ?, phone = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(query, [name, email, company, phone, id], function(err) {
                if (err) reject(err);
                else resolve({ id, ...clientData });
            });
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM clients WHERE id = ?';
            db.run(query, [id], function(err) {
                if (err) reject(err);
                else resolve({ deleted: this.changes > 0 });
            });
        });
    }

    static async getPayments(clientId) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT * FROM payments 
                WHERE client_id = ? 
                ORDER BY due_date DESC
            `;
            
            db.all(query, [clientId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async updateFinalAmount(id, finalAmount) {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE clients 
                SET final_amount = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(query, [finalAmount, id], function(err) {
                if (err) reject(err);
                else resolve({ id, final_amount: finalAmount });
            });
        });
    }
}
