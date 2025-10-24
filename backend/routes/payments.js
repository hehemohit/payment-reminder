import express from 'express';
import { Payment } from '../models/Payment.js';
import { Client } from '../models/Client.js';

const router = express.Router();

// Helper function to update client's final_amount to match pending_amount
async function updateClientFinalAmount(clientId) {
    try {
        // Get client with current pending amount
        const clients = await Client.getAll();
        const client = clients.find(c => c.id === clientId);
        
        if (client) {
            const newFinalAmount = client.pending_amount || 0;
            const oldFinalAmount = client.final_amount || 0;
            
            // Always update final_amount to match pending_amount (even if 0)
            await Client.updateFinalAmount(clientId, newFinalAmount);
            console.log(`Auto-synced final amount for client ${client.name}: $${oldFinalAmount} → $${newFinalAmount}`);
        }
    } catch (error) {
        console.error('Error updating client final amount:', error);
    }
}

// Force immediate sync with retry mechanism
async function forceSyncClientFinalAmount(clientId) {
    try {
        // Wait a moment for database to be consistent
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Get fresh client data
        const clients = await Client.getAll();
        const client = clients.find(c => c.id === clientId);
        
        if (client) {
            const newFinalAmount = client.pending_amount || 0;
            const oldFinalAmount = client.final_amount || 0;
            
            // Force update final_amount to match pending_amount
            await Client.updateFinalAmount(clientId, newFinalAmount);
            console.log(`🚀 FORCE SYNC: ${client.name} final amount: $${oldFinalAmount} → $${newFinalAmount}`);
            
            // Verify the update took effect
            await new Promise(resolve => setTimeout(resolve, 50));
            const updatedClients = await Client.getAll();
            const updatedClient = updatedClients.find(c => c.id === clientId);
            console.log(`✅ VERIFIED: ${client.name} final amount is now $${updatedClient.final_amount}`);
        }
    } catch (error) {
        console.error('Error in force sync:', error);
    }
}

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
        
        // Force immediate sync of final_amount to match pending_amount
        await forceSyncClientFinalAmount(client_id);
        
        res.status(201).json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update payment
router.put('/:id', async (req, res) => {
    try {
        const { amount, due_date, status, description } = req.body;
        
        if (!amount) {
            return res.status(400).json({ error: 'Amount is required' });
        }

        // Get existing payment to fill in missing fields
        const existingPayment = await Payment.getById(req.params.id);
        if (!existingPayment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Use provided values or fall back to existing values
        const updateData = {
            amount: amount,
            due_date: due_date || existingPayment.due_date,
            status: status || existingPayment.status,
            description: description !== undefined ? description : existingPayment.description
        };

        const payment = await Payment.update(req.params.id, updateData);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        // Force immediate sync of final_amount to match pending_amount
        await forceSyncClientFinalAmount(payment.client_id);
        
        res.json(payment);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete payment
router.delete('/:id', async (req, res) => {
    try {
        // Get payment before deleting to know which client to update
        const payment = await Payment.getById(req.params.id);
        
        const result = await Payment.delete(req.params.id);
        if (!result.deleted) {
            return res.status(404).json({ error: 'Payment not found' });
        }
        
        // Force immediate sync of final_amount to match pending_amount
        if (payment) {
            await forceSyncClientFinalAmount(payment.client_id);
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
        
        // Force sync final amounts for all affected clients
        const clients = await Client.getAll();
        for (const client of clients) {
            await forceSyncClientFinalAmount(client.id);
        }
        
        res.json({ message: `Updated ${result.updated} payments to overdue status` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Auto-sync all client final amounts
router.post('/sync-final-amounts', async (req, res) => {
    try {
        const clients = await Client.getAll();
        let syncedCount = 0;
        
        for (const client of clients) {
            await updateClientFinalAmount(client.id);
            syncedCount++;
        }
        
        res.json({ 
            message: `Auto-synced final amounts for ${syncedCount} clients`,
            syncedCount 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
