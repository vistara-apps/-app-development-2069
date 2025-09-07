import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppShell from './components/AppShell';
import Dashboard from './pages/Dashboard';
import Businesses from './pages/Businesses';
import Events from './pages/Events';
import Profile from './pages/Profile';
import BusinessOnboarding from './pages/BusinessOnboarding';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <AppShell>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/businesses" element={<Businesses />} />
            <Route path="/events" element={<Events />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/business-onboarding" element={<BusinessOnboarding />} />
          </Routes>
        </AppShell>
      </div>
    </Router>
  );
}

export default App;
