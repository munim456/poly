import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'

// Layout
import Header from './components/layout/Header'
import Footer from './components/layout/Footer'

// Public pages
import Home from './pages/public/Home'
import ProductCatalog from './pages/public/ProductCatalog'
import ProductDetail from './pages/public/ProductDetail'
import About from './pages/public/About'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Buyer pages
import BuyerDashboard from './pages/buyer/BuyerDashboard'
import OrderHistory from './pages/buyer/OrderHistory'
import RFQForm from './pages/buyer/RFQForm'
import BuyerProfile from './pages/buyer/BuyerProfile'

// Staff pages
import SalesDashboard from './pages/staff/SalesDashboard'
import QualityDashboard from './pages/staff/QualityDashboard'

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard'
import Analytics from './pages/admin/Analytics'
import ProductManagement from './pages/admin/ProductManagement'
import QualityApproval from './pages/admin/QualityApproval'
import StaffManagement from './pages/admin/StaffManagement'
import BuyerManagement from './pages/admin/BuyerManagement'

// Protected route wrapper
import ProtectedRoute from './components/common/ProtectedRoute'
import WhatsAppFloat from './components/common/WhatsAppFloat'

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="app">
            <Header />
            <main className="main-content">
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<ProductCatalog />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />

                {/* Auth routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Buyer routes */}
                <Route
                  path="/buyer/dashboard"
                  element={
                    <ProtectedRoute roles={['buyer']}>
                      <BuyerDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/buyer/orders"
                  element={
                    <ProtectedRoute roles={['buyer']}>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/buyer/rfq"
                  element={
                    <ProtectedRoute roles={['buyer']}>
                      <RFQForm />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/buyer/profile"
                  element={
                    <ProtectedRoute roles={['buyer']}>
                      <BuyerProfile />
                    </ProtectedRoute>
                  }
                />

                {/* Sales routes */}
                <Route
                  path="/sales/dashboard"
                  element={
                    <ProtectedRoute roles={['sales', 'owner']}>
                      <SalesDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Quality routes */}
                <Route
                  path="/quality/dashboard"
                  element={
                    <ProtectedRoute roles={['quality', 'owner']}>
                      <QualityDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute roles={['owner']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/analytics"
                  element={
                    <ProtectedRoute roles={['owner']}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <ProtectedRoute roles={['owner']}>
                      <ProductManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/quality"
                  element={
                    <ProtectedRoute roles={['owner']}>
                      <QualityApproval />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/staff"
                  element={
                    <ProtectedRoute roles={['owner']}>
                      <StaffManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/buyers"
                  element={
                    <ProtectedRoute roles={['owner']}>
                      <BuyerManagement />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
            <WhatsAppFloat />
          </div>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  )
}

export default App
