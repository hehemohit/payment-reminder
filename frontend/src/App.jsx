import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Users, DollarSign, AlertTriangle, Mail } from 'lucide-react';
import ClientCard from './components/ClientCard';
import ClientForm from './components/ClientForm';
import PaymentForm from './components/PaymentForm';
import './App.css';

const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [clients, setClients] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showClientForm, setShowClientForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);
  const [selectedClientId, setSelectedClientId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [clientsRes, paymentsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/clients`),
        axios.get(`${API_BASE_URL}/payments`)
      ]);
      setClients(clientsRes.data);
      setPayments(paymentsRes.data);
    } catch (err) {
      setError('Failed to fetch data. Make sure the backend server is running.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = () => {
    setEditingClient(null);
    setShowClientForm(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowClientForm(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        await axios.put(`${API_BASE_URL}/clients/${editingClient.id}`, clientData);
        setClients(clients.map(c => c.id === editingClient.id ? { ...c, ...clientData } : c));
      } else {
        const response = await axios.post(`${API_BASE_URL}/clients`, clientData);
        setClients([...clients, response.data]);
      }
      setShowClientForm(false);
      setEditingClient(null);
    } catch (err) {
      alert('Failed to save client: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/clients/${clientId}`);
      setClients(clients.filter(c => c.id !== clientId));
    } catch (err) {
      alert('Failed to delete client: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleSendReminder = async (clientId) => {
    try {
      // Find the client's pending payments
      const clientPayments = payments.filter(p => p.client_id === clientId && p.status === 'pending');
      if (clientPayments.length === 0) {
        alert('No pending payments found for this client.');
        return;
      }

      // Send reminder for the first pending payment
      const payment = clientPayments[0];
      const response = await axios.post(`${API_BASE_URL}/email/send-reminder/${payment.id}`);
      
      if (response.data.success) {
        alert('Payment reminder sent successfully!');
      } else {
        alert('Failed to send reminder: ' + response.data.error);
      }
    } catch (err) {
      alert('Failed to send reminder: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddPayment = (clientId) => {
    setSelectedClientId(clientId);
    setEditingPayment(null);
    setShowPaymentForm(true);
  };

  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowPaymentForm(true);
  };

  const handleSavePayment = async (paymentData) => {
    try {
      const clientId = selectedClientId || editingPayment?.client_id;
      
      if (editingPayment) {
        await axios.put(`${API_BASE_URL}/payments/${editingPayment.id}`, paymentData);
        setPayments(payments.map(p => p.id === editingPayment.id ? { ...p, ...paymentData } : p));
      } else {
        const response = await axios.post(`${API_BASE_URL}/payments`, {
          ...paymentData,
          client_id: clientId
        });
        setPayments([...payments, response.data]);
      }
      
      setShowPaymentForm(false);
      setEditingPayment(null);
      setSelectedClientId(null);
      fetchData(); // Refresh to update client totals
    } catch (err) {
      alert('Failed to save payment: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!confirm('Are you sure you want to delete this payment?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/payments/${paymentId}`);
      setPayments(payments.filter(p => p.id !== paymentId));
      fetchData(); // Refresh to update client totals
    } catch (err) {
      alert('Failed to delete payment: ' + (err.response?.data?.error || err.message));
    }
  };

  const getTotalStats = () => {
    const totalClients = clients.length;
    const totalPending = clients.reduce((sum, client) => sum + (client.pending_amount || 0), 0);
    const totalOverdue = clients.reduce((sum, client) => sum + (client.overdue_amount || 0), 0);
    const overdueClients = clients.filter(client => client.overdue_amount > 0).length;

    return { totalClients, totalPending, totalOverdue, overdueClients };
  };

  const stats = getTotalStats();

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchData} className="btn btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Client Payment Tracker</h1>
        <p>Manage your freelance client payments and send automated reminders</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <Users className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.totalClients}</h3>
            <p>Total Clients</p>
          </div>
        </div>
        <div className="stat-card">
          <DollarSign className="stat-icon" />
          <div className="stat-content">
            <h3>${stats.totalPending.toLocaleString()}</h3>
            <p>Pending Payments</p>
          </div>
        </div>
        <div className="stat-card overdue">
          <AlertTriangle className="stat-icon" />
          <div className="stat-content">
            <h3>${stats.totalOverdue.toLocaleString()}</h3>
            <p>Overdue Amount</p>
          </div>
        </div>
        <div className="stat-card">
          <Mail className="stat-icon" />
          <div className="stat-content">
            <h3>{stats.overdueClients}</h3>
            <p>Clients with Overdue</p>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h2>Clients</h2>
          <button onClick={handleAddClient} className="btn btn-primary">
            <Plus size={16} />
            Add Client
          </button>
        </div>

        <div className="clients-grid">
          {clients.map(client => (
            <ClientCard
              key={client.id}
              client={client}
              onSendReminder={handleSendReminder}
              onEdit={handleEditClient}
              onDelete={handleDeleteClient}
              onAddPayment={handleAddPayment}
            />
          ))}
        </div>

        {clients.length === 0 && (
          <div className="empty-state">
            <Users size={48} />
            <h3>No clients yet</h3>
            <p>Add your first client to start tracking payments</p>
            <button onClick={handleAddClient} className="btn btn-primary">
              <Plus size={16} />
              Add Your First Client
            </button>
          </div>
        )}
      </div>

      <ClientForm
        client={editingClient}
        onSave={handleSaveClient}
        onCancel={() => {
          setShowClientForm(false);
          setEditingClient(null);
        }}
        isOpen={showClientForm}
      />

      <PaymentForm
        payment={editingPayment}
        clientId={selectedClientId}
        onSave={handleSavePayment}
        onCancel={() => {
          setShowPaymentForm(false);
          setEditingPayment(null);
          setSelectedClientId(null);
        }}
        isOpen={showPaymentForm}
      />
    </div>
  );
}

export default App;
