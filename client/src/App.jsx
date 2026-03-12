import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AddBusiness from './pages/AddBusiness';
import Profile from './pages/Profile';
import Search from './pages/Search';
import BusinessDetail from './pages/BusinessDetail';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import Footer from './components/Footer';
import SubAdminDashboard from './pages/SubAdminDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import OwnerDashboard from './pages/OwnerDashboard';
import About from './pages/About';

// Placeholder Pages (will implement next)
const Placeholder = ({ title }) => (
  <div className="pt-32 min-h-screen flex flex-col items-center justify-center p-4">
    <h1 className="text-3xl font-bold mb-4">{title}</h1>
    <p className="text-gray-500">This page is currently under development.</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/about" element={<About />} />

            {/* Public only routes (redirect to home if logged in) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* Private routes (redirect to login if not logged in) */}
            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/add-business" element={<AddBusiness />} />
              <Route path="/owner/dashboard" element={<OwnerDashboard />} />
              <Route path="/dashboard" element={<Placeholder title="Business Dashboard" />} />
            </Route>

            {/* Master Admin restricted route */}
            <Route element={<PrivateRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<SuperAdminDashboard />} />
            </Route>

            {/* Sub-Admin restricted route */}
            <Route element={<PrivateRoute allowedRoles={['admin', 'subadmin']} />}>
              <Route path="/subadmin" element={<SubAdminDashboard />} />
            </Route>

            <Route path="/business/:id" element={<BusinessDetail />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;
