import React from 'react';
import { Mail, Phone, Building, DollarSign, Calendar, AlertTriangle, Plus } from 'lucide-react';

const ClientCard = ({ client, onSendReminder, onEdit, onDelete, onAddPayment }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#4caf50';
      case 'overdue': return '#f44336';
      case 'pending': return '#ff9800';
      default: return '#666';
    }
  };

  return (
    <div className="client-card">
      <div className="client-header">
        <div className="client-info">
          <h3 className="client-name">{client.name.toUpperCase()}</h3>
          {client.company && (
            <p className="client-company">
              <Building size={16} />
              {client.company}
            </p>
          )}
        </div>
        <div className="client-actions">
          <button 
            className="btn btn-primary"
            onClick={() => onSendReminder(client.id)}
            disabled={!client.pending_amount || client.pending_amount <= 0}
          >
            <Mail size={16} />
            Send Reminder
          </button>
          <button 
            className="btn btn-success"
            onClick={() => onAddPayment(client.id)}
          >
            <Plus size={16} />
            Add Payment
          </button>
          <button className="btn btn-secondary" onClick={() => onEdit(client)}>
            Edit
          </button>
          <button className="btn btn-danger" onClick={() => onDelete(client.id)}>
            Delete
          </button>
        </div>
      </div>

      <div className="client-details">
        <div className="contact-info">
          <p className="contact-item">
            <Mail size={16} />
            {client.email}
          </p>
          {client.phone && (
            <p className="contact-item">
              <Phone size={16} />
              {client.phone}
            </p>
          )}
        </div>

        <div className="payment-summary">
          <div className="payment-stats">
            <div className="stat-item">
              <span className="stat-label">Total Payments:</span>
              <span className="stat-value">{client.total_payments || 0}</span>
            </div>
            <div className="stat-item pending">
              <span className="stat-label">Pending:</span>
              <span className="stat-value">
                {formatCurrency(client.pending_amount || 0)}
              </span>
            </div>
            <div className="stat-item overdue">
              <span className="stat-label">Overdue:</span>
              <span className="stat-value">
                {formatCurrency(client.overdue_amount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {client.overdue_amount > 0 && (
        <div className="overdue-alert">
          <AlertTriangle size={16} />
          <span>This client has overdue payments!</span>
        </div>
      )}
    </div>
  );
};

export default ClientCard;
