import express from 'express';
import emailService from '../services/emailService.js';
import { Payment } from '../models/Payment.js';
import db from '../database/init.js';

const router = express.Router();

// Send payment reminder
router.post('/send-reminder/:paymentId', async (req, res) => {
    try {
        const payment = await Payment.getById(req.params.paymentId);
        
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        const result = await emailService.sendPaymentReminder(
            payment.client_email,
            payment.client_name,
            payment.amount,
            payment.due_date,
            payment.description
        );

        if (result.success) {
            // Log the email in database
            const logQuery = `
                INSERT INTO email_logs (client_id, email_type, status)
                VALUES (?, 'payment_reminder', 'sent')
            `;
            
            db.run(logQuery, [payment.client_id], (err) => {
                if (err) console.error('Error logging email:', err);
            });

            res.json({ 
                success: true, 
                message: 'Payment reminder sent successfully',
                messageId: result.messageId 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: 'Failed to send email',
                details: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Send reminder to all overdue clients
router.post('/send-bulk-reminders', async (req, res) => {
    try {
        const overduePayments = await Payment.getOverdue();
        const results = [];

        for (const payment of overduePayments) {
            const result = await emailService.sendPaymentReminder(
                payment.client_email,
                payment.client_name,
                payment.amount,
                payment.due_date,
                payment.description
            );

            results.push({
                client_name: payment.client_name,
                success: result.success,
                error: result.error
            });

            if (result.success) {
                // Log the email
                const logQuery = `
                    INSERT INTO email_logs (client_id, email_type, status)
                    VALUES (?, 'bulk_reminder', 'sent')
                `;
                
                db.run(logQuery, [payment.client_id], (err) => {
                    if (err) console.error('Error logging email:', err);
                });
            }
        }

        res.json({ 
            success: true, 
            message: 'Bulk reminders processed',
            results 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get email logs for a client
router.get('/logs/:clientId', async (req, res) => {
    try {
        const query = `
            SELECT * FROM email_logs 
            WHERE client_id = ? 
            ORDER BY sent_at DESC
        `;
        
        db.all(query, [req.params.clientId], (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
