import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Campaigns from './pages/Campaigns';
import CampaignDetails from './pages/CampaignDetails';
import Templates from './pages/Templates';
import Senders from './pages/Senders';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Campaigns />} />
          <Route path="campaign/:id" element={<CampaignDetails />} />
          <Route path="templates" element={<Templates />} />
          <Route path="senders" element={<Senders />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
