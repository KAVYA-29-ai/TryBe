import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Onboarding from './pages/Onboarding';
import HomeFeed from './pages/HomeFeed';
import Discover from './pages/Discover';
import MyCollege from './pages/MyCollege';
import CollegeExplore from './pages/CollegeExplore';
import Clubs from './pages/Clubs';
import Work from './pages/Work';
import ClubDashboard from './pages/ClubDashboard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Help from './pages/Help';
import { AppProvider } from './context/AppContext';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Authenticated Routes with Sidebar/Layout */}
          <Route element={<Layout />}>
            <Route path="/home" element={<HomeFeed />} />
            <Route path="/discover" element={<Discover />} />
            <Route path="/college" element={<MyCollege />} />
            <Route path="/college/:collegeId" element={<CollegeExplore />} />
            <Route path="/clubs" element={<Clubs />} />
            <Route path="/clubs/:id" element={<ClubDashboard />} />
            <Route path="/work" element={<Work />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help" element={<Help />} />
          </Route>
        </Routes>
      </Router>
    </AppProvider>
  );
}
