import nodemailer from 'nodemailer';
import { google } from 'googleapis';

class EmailService {
    constructor() {
        this.transporter = null;
        this.initializeTransporter();
    }

    async initializeTransporter() {
        try {
            // Using Gmail OAuth2 for better security
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET,
                process.env.GOOGLE_REDIRECT_URI
            );

            oauth2Client.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN
            });

            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    type: 'OAuth2',
                    user: process.env.EMAIL_USER,
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
                    accessToken: await oauth2Client.getAccessToken()
                }
            });

            console.log('Email service initialized with OAuth2');
        } catch (error) {
            console.error('OAuth2 setup failed, falling back to app password:', error.message);
            
            // Fallback to app password method
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });
        }
    }

    async sendPaymentReminder(clientEmail, clientName, amount, dueDate, description = '') {
        try {
            // Check if transporter is initialized
            if (!this.transporter) {
                console.error('Email transporter not initialized');
                return { success: false, error: 'Email service not configured' };
            }

            // Check environment variables
            if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
                console.error('Email credentials not configured');
                return { success: false, error: 'Email credentials not configured. Please check your .env file.' };
            }

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: clientEmail,
                subject: `Payment Reminder - ${clientName}`,
                html: this.generateReminderEmailHTML(clientName, amount, dueDate, description)
            };

            console.log('Attempting to send email:', {
                from: mailOptions.from,
                to: mailOptions.to,
                subject: mailOptions.subject
            });

            const result = await this.transporter.sendMail(mailOptions);
            console.log('Payment reminder sent successfully:', result.messageId);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            console.error('Error sending payment reminder:', error);
            return { success: false, error: error.message };
        }
    }

    generateReminderEmailHTML(clientName, amount, dueDate, description) {
        const formattedAmount = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);

        const formattedDate = new Date(dueDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Reminder</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #ffda03; padding: 20px; text-align: center; border-radius: 8px; }
                    .content { padding: 20px; background: #f9f9f9; border-radius: 8px; margin: 20px 0; }
                    .amount { font-size: 24px; font-weight: bold; color: #d32f2f; }
                    .due-date { font-size: 18px; color: #666; }
                    .footer { text-align: center; color: #666; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Payment Reminder</h1>
                    </div>
                    <div class="content">
                        <p>Dear ${clientName},</p>
                        <p>This is a friendly reminder that you have an outstanding payment:</p>
                        <p><strong>Amount Due:</strong> <span class="amount">${formattedAmount}</span></p>
                        <p><strong>Due Date:</strong> <span class="due-date">${formattedDate}</span></p>
                        ${description ? `<p><strong>Description:</strong> ${description}</p>` : ''}
                        <p>Please process this payment at your earliest convenience. If you have any questions or concerns, please don't hesitate to contact me.</p>
                        <p>Thank you for your business!</p>
                    </div>
                    <div class="footer">
                        <p>This is an automated payment reminder. Please do not reply to this email.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
    }
}

export default new EmailService();
