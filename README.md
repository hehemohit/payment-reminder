# Client Payment Tracker Dashboard

A complete full-stack application for freelancers to track client payments and send automated payment reminders via email.

## Features

- 📊 **Dashboard Overview**: Track total clients, pending payments, and overdue amounts
- 👥 **Client Management**: Add, edit, and delete clients with contact information
- 💰 **Payment Tracking**: Record payments with amounts, due dates, and status
- 📧 **Automated Reminders**: Send professional payment reminder emails directly to clients
- 📱 **Responsive Design**: Works perfectly on desktop and mobile devices
- 🎨 **Modern UI**: Clean, minimalistic design with yellow accent color

## Tech Stack

### Backend
- **Node.js** with Express.js
- **SQLite** database (easily upgradeable to PostgreSQL/MySQL)
- **Nodemailer** for email sending
- **Gmail SMTP** integration with OAuth2 support

### Frontend
- **React 19** with Vite
- **Axios** for API calls
- **Lucide React** for icons
- **Date-fns** for date formatting
- **Modern CSS** with responsive design

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Gmail account for sending emails

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env file with your email credentials
# See Email Configuration section below

# Start the server
npm run dev
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### 3. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## Email Configuration

### Option 1: Gmail App Password (Recommended for testing)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Update your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
EMAIL_SERVICE=gmail
```

### Option 2: Gmail OAuth2 (Recommended for production)

1. Create a Google Cloud Project
2. Enable Gmail API
3. Create OAuth2 credentials
4. Update your `.env` file:

```env
EMAIL_USER=your-email@gmail.com
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_REFRESH_TOKEN=your-refresh-token
```

## API Endpoints

### Clients
- `GET /api/clients` - Get all clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client
- `GET /api/clients/:id/payments` - Get client payments

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment
- `PUT /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/overdue/list` - Get overdue payments

### Email
- `POST /api/email/send-reminder/:paymentId` - Send payment reminder
- `POST /api/email/send-bulk-reminders` - Send reminders to all overdue clients
- `GET /api/email/logs/:clientId` - Get email logs for client

## Database Schema

The application uses SQLite with the following tables:

- **clients**: Client information (name, email, company, phone)
- **payments**: Payment records (amount, due_date, status, description)
- **email_logs**: Email sending history

## Features in Detail

### Dashboard
- Real-time statistics showing total clients, pending payments, and overdue amounts
- Visual indicators for clients with overdue payments
- Quick access to add new clients

### Client Management
- Add clients with name, email, company, and phone
- Edit client information
- Delete clients (with confirmation)
- View payment summary for each client

### Payment Tracking
- Record payments with amount, due date, and description
- Track payment status (pending, paid, overdue)
- Automatic overdue status updates
- Payment history for each client

### Email Reminders
- Professional HTML email templates
- Send individual payment reminders
- Bulk reminder functionality
- Email sending logs and status tracking

## Customization

### Styling
The application uses your preferred yellow accent color (`#ffda03`) throughout the interface. You can customize colors in `frontend/src/App.css`.

### Email Templates
Email templates are defined in `backend/services/emailService.js`. You can customize the HTML template and styling.

### Database
The application uses SQLite by default. To upgrade to PostgreSQL or MySQL:

1. Install the appropriate database driver
2. Update the database connection in `backend/database/init.js`
3. Modify the SQL schema if needed

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=5000
DB_PATH=/path/to/production/database.sqlite
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-app-password
```

### Security Considerations
- Use environment variables for all sensitive data
- Implement proper authentication for production
- Use HTTPS in production
- Consider rate limiting for email sending
- Regular database backups

## Troubleshooting

### Common Issues

1. **Email not sending**: Check your Gmail credentials and app password
2. **Database errors**: Ensure the database file has proper permissions
3. **CORS errors**: Make sure the backend is running on port 5000
4. **Frontend not loading**: Check that the backend API is accessible

### Debug Mode
Set `NODE_ENV=development` in your `.env` file for detailed error messages.

## License

MIT License - feel free to use this project for your freelance business!

## Support

For issues and questions, please check the troubleshooting section or create an issue in the repository.
