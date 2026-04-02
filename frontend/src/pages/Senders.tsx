import React, { useEffect, useState } from 'react';
import { sendersApi } from '../services/api';
import { Plus, UserX, UserCheck } from 'lucide-react';

interface Sender {
  id: string;
  email: string;
  smtp_host: string;
  smtp_port: number;
  daily_limit: number;
  sent_today: number;
  status: string;
}

const Senders: React.FC = () => {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newSender, setNewSender] = useState({
    email: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_password: '',
    daily_limit: 500
  });

  const fetchSenders = async () => {
    try {
      const response = await sendersApi.list();
      setSenders(response.data);
    } catch (error) {
      console.error('Failed to fetch senders', error);
    }
  };

  useEffect(() => {
    fetchSenders();
  }, []);

  const handleAddSender = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendersApi.add(newSender);
      setShowModal(false);
      fetchSenders();
      setNewSender({ email: '', smtp_host: '', smtp_port: 587, smtp_password: '', daily_limit: 500 });
    } catch (error) {
      alert('Failed to add sender account');
    }
  };

  return (
    <div>
      <div className="flex-between">
        <h1>Sender Accounts</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Sender
        </button>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Host</th>
              <th>Port</th>
              <th>Daily Limit</th>
              <th>Sent Today</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {senders.map((sender) => (
              <tr key={sender.id}>
                <td>{sender.email}</td>
                <td>{sender.smtp_host}</td>
                <td>{sender.smtp_port}</td>
                <td>{sender.daily_limit}</td>
                <td>{sender.sent_today}</td>
                <td>
                  <span className={`badge ${sender.status === 'ACTIVE' ? 'badge-success' : 'badge-error'}`}>
                    {sender.status}
                  </span>
                </td>
                <td>
                  {sender.status === 'ACTIVE' && (
                    <button className="btn btn-outline" onClick={() => sendersApi.disable(sender.id).then(fetchSenders)}>
                      Disable
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '500px' }}>
            <h2>Add New Sender</h2>
            <form onSubmit={handleAddSender}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" required value={newSender.email} onChange={e => setNewSender({...newSender, email: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SMTP Host</label>
                <input type="text" required placeholder="smtp.gmail.com" value={newSender.smtp_host} onChange={e => setNewSender({...newSender, smtp_host: e.target.value})} />
              </div>
              <div className="form-group">
                <label>SMTP Port</label>
                <input type="number" required value={newSender.smtp_port} onChange={e => setNewSender({...newSender, smtp_port: parseInt(e.target.value)})} />
              </div>
              <div className="form-group">
                <label>SMTP Password / App Password</label>
                <input type="password" required value={newSender.smtp_password} onChange={e => setNewSender({...newSender, smtp_password: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Daily Limit</label>
                <input type="number" value={newSender.daily_limit} onChange={e => setNewSender({...newSender, daily_limit: parseInt(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">Save Sender</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Senders;
