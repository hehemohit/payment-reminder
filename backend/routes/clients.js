import express from 'express';
import { Client } from '../models/Client.js';
import { Payment } from '../models/Payment.js';

const router = express.Router();

// Get all clients with payment summary
router.get('/', async (req, res) => {
    try {
        const clients = await Client.getAll();
        res.json(clients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get client by ID
router.get('/:id', async (req, res) => {
    try {
        const client = await Client.getById(req.params.id);
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json(client);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new client
router.post('/', async (req, res) => {
    try {
        const { name, email, company, phone } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const client = await Client.create({ name, email, company, phone });
        res.status(201).json(client);
    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(400).json({ error: 'Email already exists' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
});

// Update client
router.put('/:id', async (req, res) => {
    try {
        const { name, email, company, phone } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }

        const client = await Client.update(req.params.id, { name, email, company, phone });
        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }
        
        res.json(client);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete client
router.delete('/:id', async (req, res) => {
    try {
        const result = await Client.delete(req.params.id);
        if (!result.deleted) {
            return res.status(404).json({ error: 'Client not found' });
        }
        res.json({ message: 'Client deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get client payments
router.get('/:id/payments', async (req, res) => {
    try {
        const payments = await Client.getPayments(req.params.id);
        res.json(payments);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
