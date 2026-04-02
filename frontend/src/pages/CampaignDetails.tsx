import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { campaignsApi, datasetsApi } from '../services/api';
import { Play, Pause, Upload, ChevronLeft, RefreshCcw } from 'lucide-react';

interface Stats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  progress_percent: number;
}

const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!id) return;
    try {
      const response = await campaignsApi.stats(id);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStats();
    // Auto refresh stats every 30 seconds if campaign is running
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;

    setUploading(true);
    try {
      await datasetsApi.upload(id, file);
      alert('Contacts uploaded successfully');
      fetchStats();
    } catch (error) {
      alert('Failed to upload CSV. Ensure it has name, email, company, title headers.');
    } finally {
      setUploading(false);
    }
  };

  const handleStart = async () => {
    if (!id) return;
    try {
      await campaignsApi.start(id);
      fetchStats();
    } catch (error) {
      alert('Failed to start campaign. Ensure you have active senders.');
    }
  };

  const handlePause = async () => {
    if (!id) return;
    try {
      await campaignsApi.pause(id);
      fetchStats();
    } catch (error) {
      console.error('Failed to pause', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <button className="btn btn-outline" onClick={() => navigate('/')} style={{ marginBottom: '1.5rem' }}>
        <ChevronLeft size={16} /> Back to Dashboard
      </button>

      <div className="flex-between">
        <h1>Campaign Performance</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-secondary" onClick={fetchStats}>
            <RefreshCcw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleStart}>
            <Play size={16} /> Start Campaign
          </button>
          <button className="btn btn-outline" onClick={handlePause}>
            <Pause size={16} /> Pause
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3" style={{ marginTop: '2rem' }}>
        <div className="card stat-card">
          <div className="stat-value">{stats?.total || 0}</div>
          <div className="stat-label">Total Contacts</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats?.sent || 0}</div>
          <div className="stat-label">Emails Sent</div>
        </div>
        <div className="card stat-card">
          <div className="stat-value" style={{ color: 'var(--error)' }}>{stats?.failed || 0}</div>
          <div className="stat-label">Failed Delivery</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h2>Upload Contacts</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Upload a CSV file containing your contact list. Required columns: <code>name</code>, <code>email</code>, <code>company</code>, <code>title</code>.
        </p>
        
        <div style={{ border: '2px dashed var(--border-color)', padding: '3rem', borderRadius: '1rem', textAlign: 'center' }}>
          <input 
            type="file" 
            id="csv-upload" 
            hidden 
            accept=".csv" 
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="csv-upload" className="btn btn-primary" style={{ cursor: 'pointer' }}>
            <Upload size={18} /> {uploading ? 'Uploading...' : 'Select CSV File'}
          </label>
        </div>
      </div>

      <div className="card">
        <h2>Live Progress</h2>
        <div style={{ background: 'var(--bg-primary)', height: '24px', borderRadius: '12px', overflow: 'hidden', marginTop: '1rem', position: 'relative' }}>
          <div style={{ 
            background: 'var(--accent-primary)', 
            height: '100%', 
            width: `${stats?.progress_percent || 0}%`,
            transition: 'width 0.5s ease-in-out'
          }} />
          <span style={{ position: 'absolute', width: '100%', textAlign: 'center', top: 0, fontSize: '0.875rem', fontWeight: 600 }}>
            {Math.round(stats?.progress_percent || 0)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
