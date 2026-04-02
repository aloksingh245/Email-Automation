import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { campaignsApi, templatesApi } from '../services/api';
import { Plus, BarChart, Play, Pause } from 'lucide-react';

interface Campaign {
  id: string;
  campaign_name: string;
  status: string;
  total_contacts: int;
  sent_count: int;
  failed_count: int;
  template_id: string;
}

interface Template {
  id: string;
  template_name: string;
}

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    campaign_name: '',
    template_id: ''
  });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [campRes, tempRes] = await Promise.all([
        campaignsApi.list(),
        templatesApi.list()
      ]);
      setCampaigns(campRes.data);
      setTemplates(tempRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await campaignsApi.create(newCampaign);
      setShowModal(false);
      fetchData();
      setNewCampaign({ campaign_name: '', template_id: '' });
    } catch (error) {
      alert('Failed to create campaign');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RUNNING': return <span className="badge badge-info">Running</span>;
      case 'COMPLETED': return <span className="badge badge-success">Completed</span>;
      case 'PAUSED': return <span className="badge badge-warning">Paused</span>;
      case 'STOPPED': return <span className="badge badge-error">Stopped</span>;
      default: return <span className="badge btn-outline">Created</span>;
    }
  };

  return (
    <div>
      <div className="flex-between">
        <h1>Campaigns</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> New Campaign
        </button>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <table>
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Stats (S/F/T)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp) => (
              <tr key={camp.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/campaign/${camp.id}`)}>
                <td style={{ fontWeight: 600 }}>{camp.campaign_name}</td>
                <td>{getStatusBadge(camp.status)}</td>
                <td style={{ width: '200px' }}>
                  <div style={{ background: 'var(--bg-primary)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      background: 'var(--accent-primary)', 
                      height: '100%', 
                      width: `${(camp.sent_count / camp.total_contacts * 100) || 0}%` 
                    }} />
                  </div>
                </td>
                <td>{camp.sent_count} / {camp.failed_count} / {camp.total_contacts}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {camp.status !== 'RUNNING' && camp.status !== 'COMPLETED' && (
                      <button className="btn btn-outline" onClick={() => campaignsApi.start(camp.id).then(fetchData)}>
                        <Play size={14} /> Start
                      </button>
                    )}
                    {camp.status === 'RUNNING' && (
                      <button className="btn btn-outline" onClick={() => campaignsApi.pause(camp.id).then(fetchData)}>
                        <Pause size={14} /> Pause
                      </button>
                    )}
                    <button className="btn btn-outline" onClick={() => navigate(`/campaign/${camp.id}`)}>
                      <BarChart size={14} /> Details
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: '500px' }}>
            <h2>Create New Campaign</h2>
            <form onSubmit={handleCreateCampaign}>
              <div className="form-group">
                <label>Campaign Name</label>
                <input type="text" required value={newCampaign.campaign_name} onChange={e => setNewCampaign({...newCampaign, campaign_name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Email Template</label>
                <select required value={newCampaign.template_id} onChange={e => setNewCampaign({...newCampaign, template_id: e.target.value})}>
                  <option value="">Select a template</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.template_name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">Create Campaign</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Campaigns;
