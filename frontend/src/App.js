import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NavBar from './components/NavBar';
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/authentication/SignupPage";
import LoginPage from "./pages/authentication/LoginPage";
import ProfilePage from "./pages/authentication/ProfilePage";
import HelpPage from "./pages/HelpPage";
import SchedulesPage from "./pages/SchedulesPage";
import StandingsPage from "./pages/StandingsPage";
import DepthChartsPage from "./pages/DepthChartsPage";
import StatsPage from "./pages/StatsPage";
import ProjectionsPage from "./pages/ProjectionsPage";
import ChatRoomsPage from "./pages/ChatRoomsPage";
import OddsPage from "./pages/OddsPage";
import LineupOptimizerPage from "./pages/LineupOptimizerPage";


function App() {
  return (
    <div className="container">
      <BrowserRouter basename="/">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/help" element={<HelpPage/>} />
          <Route path="/schedules" element={<SchedulesPage/>} />
          <Route path="/standings" element={<StandingsPage/>} />
          <Route path="/depth-charts" element={<DepthChartsPage/>} />
          <Route path="/stats" element={<StatsPage/>} />
          <Route path="/projections" element={<ProjectionsPage/>} />
          <Route path="/chat-rooms" element={<ChatRoomsPage/>} />
          <Route path="/odds" element={<OddsPage/>} />
          <Route path="/lineup-optimizer" element={<LineupOptimizerPage/>} />
          <Route path="*" element={<NotFoundPage/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;