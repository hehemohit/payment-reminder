import express from 'express';
import { Payment } from '../models/Payment.js';

const router = express.Router();

// Get all payments
router.get('/', async (req, res) => {
    try {
        const payments = await Payment.getAll();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
    try {
        const payment = await Payment.getById(req.params.id);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new payment
router.post('/', async (req, res) => {
    try {
        const { client_id, amount, due_date, description } = req.body;
        
        if (!client_id || !amount || !due_date) {
            return res.status(400).json({ error: 'Client ID, amount, and due date are required' });
        }

        const payment = await Payment.create({ client_id, amount, due_date, description });
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update payment
router.put('/:id', async (req, res) => {
    try {
        const { amount, due_date, status, description } = req.body;
        
        if (!amount || !due_date) {
            return res.status(400).json({ error: 'Amount and due date are required' });
        }

        const payment = await Payment.update(req.params.id, { amount, due_date, status, description });
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete payment
router.delete('/:id', async (req, res) => {
    try {
        const result = await Payment.delete(req.params.id);
        if (!result.deleted) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        res.json({ message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get overdue payments
router.get('/overdue/list', async (req, res) => {
    try {
        const overduePayments = await Payment.getOverdue();
        res.json(overduePayments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update overdue status
router.post('/update-overdue', async (req, res) => {
    try {
        const result = await Payment.updateOverdueStatus();
        res.json({ message: `Updated ${result.updated} payments to overdue status` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
