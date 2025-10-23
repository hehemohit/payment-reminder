import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const PaymentForm = ({ payment, clientId, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    amount: '',
    due_date: '',
    description: '',
    status: 'pending'
  });

  useEffect(() => {
    if (payment) {
      setFormData({
        amount: payment.amount || '',
        due_date: payment.due_date || '',
        description: payment.description || '',
        status: payment.status || 'pending'
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFormData({
        amount: '',
        due_date: today,
        description: '',
        status: 'pending'
      });
    }
  }, [payment]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.due_date) {
      alert('Amount and due date are required');
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{payment ? 'Edit Payment' : 'Add New Payment'}</h2>
          <button className="close-btn" onClick={onCancel}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-group">
            <label htmlFor="amount">Amount *</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          <div className="form-group">
            <label htmlFor="due_date">Due Date *</label>
            <input
              type="date"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Payment description or notes"
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              {payment ? 'Update Payment' : 'Add Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;
