import db from '../database/init.js';

export class Payment {
    static async getAll() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.*,
                    c.name as client_name,
                    c.email as client_email,
                    c.company as client_company
                FROM payments p
                JOIN clients c ON p.client_id = c.id
                ORDER BY p.due_date ASC
            `;
            
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }

    static async getById(id) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.*,
                    c.name as client_name,
                    c.email as client_email,
                    c.company as client_company
                FROM payments p
                JOIN clients c ON p.client_id = c.id
                WHERE p.id = ?
            `;
            
            db.get(query, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    static async create(paymentData) {
        return new Promise((resolve, reject) => {
            const { client_id, amount, due_date, description } = paymentData;
            const query = `
                INSERT INTO payments (client_id, amount, due_date, description)
                VALUES (?, ?, ?, ?)
            `;
            
            db.run(query, [client_id, amount, due_date, description], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...paymentData });
            });
        });
    }

    static async update(id, paymentData) {
        return new Promise((resolve, reject) => {
            const { amount, due_date, status, description } = paymentData;
            const query = `
                UPDATE payments 
                SET amount = ?, due_date = ?, status = ?, description = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;
            
            db.run(query, [amount, due_date, status, description, id], function(err) {
                if (err) reject(err);
                else resolve({ id, ...paymentData });
            });
        });
    }

    static async delete(id) {
        return new Promise((resolve, reject) => {
            const query = 'DELETE FROM payments WHERE id = ?';
            db.run(query, [id], function(err) {
                if (err) reject(err);
                else resolve({ deleted: this.changes > 0 });
            });
        });
    }

    static async updateOverdueStatus() {
        return new Promise((resolve, reject) => {
            const query = `
                UPDATE payments 
                SET status = 'overdue' 
                WHERE due_date < date('now') AND status = 'pending'
            `;
            
            db.run(query, [], function(err) {
                if (err) reject(err);
                else resolve({ updated: this.changes });
            });
        });
    }

    static async getOverdue() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    p.*,
                    c.name as client_name,
                    c.email as client_email,
                    c.company as client_company
                FROM payments p
                JOIN clients c ON p.client_id = c.id
                WHERE p.status = 'overdue'
                ORDER BY p.due_date ASC
            `;
            
            db.all(query, [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    }
}
