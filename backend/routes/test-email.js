import express from 'express';
import emailService from '../services/emailService.js';

const router = express.Router();

// Test email endpoint
router.post('/test', async (req, res) => {
    try {
        const { to, subject, message } = req.body;
        
        if (!to || !subject || !message) {
            return res.status(400).json({ 
                error: 'Missing required fields: to, subject, message' 
            });
        }

        const result = await emailService.sendPaymentReminder(
            to, 
            'Test Client', 
            100, 
            new Date().toISOString().split('T')[0], 
            message
        );

        if (result.success) {
            res.json({ 
                success: true, 
                message: 'Test email sent successfully',
                messageId: result.messageId 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                error: result.error 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

export default router;
