import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from './store';
import { Navigation } from './components/Navigation';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { RestaurantPage } from './pages/RestaurantPage';
import { SalesPage } from './pages/SalesPage';
import { CashFlowPage } from './pages/CashFlowPage';
import { SettingsPage } from './pages/SettingsPage';

function App() {
  const { settings } = useStore();
  const isAuthenticated = Boolean(settings.restaurantInfo.password);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navigation />}
        
        <main className={isAuthenticated ? "max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8" : ""}>
          <Routes>
            <Route 
              path="/login" 
              element={isAuthenticated ? <Navigate to="/" /> : <LoginPage />} 
            />
            <Route 
              path="/" 
              element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/products" 
              element={isAuthenticated ? <ProductsPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/restaurant" 
              element={isAuthenticated ? <RestaurantPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/sales" 
              element={isAuthenticated ? <SalesPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/cash-flow" 
              element={isAuthenticated ? <CashFlowPage /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/settings" 
              element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;