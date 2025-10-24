import React, { useState, useEffect } from 'react';
import { Mail, Phone, Building, DollarSign, Calendar, AlertTriangle, Plus, Edit2, Save, X } from 'lucide-react';

const ClientCard = ({ client, onSendReminder, onEdit, onDelete, onAddPayment, payments, onUpdatePayment, onUpdateFinalAmount }) => {
  const [editingPayment, setEditingPayment] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editingFinalAmount, setEditingFinalAmount] = useState(false);
  const [finalAmount, setFinalAmount] = useState(client.final_amount || 0);
  const [isAutoSynced, setIsAutoSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Update final amount when client data changes
  useEffect(() => {
    setFinalAmount(client.final_amount || 0);
    // Check if final amount matches pending amount (auto-synced)
    setIsAutoSynced(client.final_amount === client.pending_amount && client.pending_amount > 0);
  }, [client.final_amount, client.pending_amount]);

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

  const handleEditAmount = (payment) => {
    setEditingPayment(payment.id);
    setEditAmount(payment.amount.toString());
  };

  const handleSaveAmount = async () => {
    if (!editAmount || parseFloat(editAmount) < 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      // Send only the amount - backend will handle the rest
      await onUpdatePayment(editingPayment, { 
        amount: parseFloat(editAmount)
      });
      setEditingPayment(null);
      setEditAmount('');
    } catch (error) {
      console.error('Payment update error:', error);
      alert('Failed to update payment amount: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
    setEditAmount('');
  };

  const handleEditFinalAmount = () => {
    setEditingFinalAmount(true);
    setFinalAmount(client.final_amount || 0);
  };

  const handleSaveFinalAmount = async () => {
    if (finalAmount < 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      await onUpdateFinalAmount(client.id, parseFloat(finalAmount) || 0);
      setEditingFinalAmount(false);
    } catch (error) {
      console.error('Final amount update error:', error);
      alert('Failed to update final amount: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancelFinalAmount = () => {
    setEditingFinalAmount(false);
    setFinalAmount(client.final_amount || 0);
  };


  const clientPayments = payments.filter(payment => payment.client_id === client.id);

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
            <div className="stat-item final-amount">
              <span className="stat-label">
                Final Amount:
                {isAutoSynced && (
                  <span className="auto-sync-indicator"> (Auto-synced)</span>
                )}
                {isSyncing && (
                  <span className="syncing-indicator"> 🔄 Syncing...</span>
                )}
              </span>
              {editingFinalAmount ? (
                <div className="final-amount-edit">
                  <input
                    type="number"
                    value={finalAmount}
                    onChange={(e) => setFinalAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="final-amount-input"
                    autoFocus
                  />
                  <div className="final-amount-actions">
                    <button 
                      onClick={handleSaveFinalAmount}
                      className="btn-save"
                      title="Save"
                    >
                      <Save size={14} />
                    </button>
                    <button 
                      onClick={handleCancelFinalAmount}
                      className="btn-cancel"
                      title="Cancel"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="final-amount-display">
                  <span className="stat-value">
                    {formatCurrency(client.final_amount || 0)}
                  </span>
                  <button 
                    onClick={handleEditFinalAmount}
                    className="btn-edit-final"
                    title="Edit Final Amount"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {clientPayments.length > 0 && (
          <div className="payments-list">
            <h4>Payment Records</h4>
            <div className="payments-container">
              {clientPayments.map(payment => (
                <div key={payment.id} className="payment-item">
                  <div className="payment-info">
                    <div className="payment-amount">
                      {editingPayment === payment.id ? (
                        <div className="amount-edit">
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            min="0"
                            step="0.01"
                            className="amount-input"
                            autoFocus
                          />
                          <div className="amount-actions">
                            <button 
                              onClick={handleSaveAmount}
                              className="btn-save"
                              title="Save"
                            >
                              <Save size={14} />
                            </button>
                            <button 
                              onClick={handleCancelEdit}
                              className="btn-cancel"
                              title="Cancel"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="amount-display">
                          {formatCurrency(payment.amount)}
                        </span>
                      )}
                    </div>
                    <div className="payment-details">
                      <span className="payment-status" style={{ color: getStatusColor(payment.status) }}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                      <span className="payment-date">
                        Due: {new Date(payment.due_date).toLocaleDateString()}
                      </span>
                      {payment.description && (
                        <span className="payment-description">{payment.description}</span>
                      )}
                    </div>
                  </div>
                  {editingPayment !== payment.id && (
                    <button 
                      onClick={() => handleEditAmount(payment)}
                      className="btn-edit-amount"
                      title="Edit Amount"
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
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
