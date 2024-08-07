import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NavBar from './components/NavBar';
import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";
import SignUpPage from "./pages/authentication/SignupPage";
import LoginPage from "./pages/authentication/LoginPage";
import ProfilePage from "./pages/authentication/ProfilePage";
import HelpPage from "./pages/HelpPage";
import TeamsPage from "./pages/teams/TeamsPage.js";
import StandingsPage from "./pages/StandingsPage";
import DepthChartsPage from "./pages/DepthChartsPage";
import RankingsPage from "./pages/rankings/RankingsPage.js";
import ProjectionsPage from "./pages/ProjectionsPage";
import ChatRoomsPage from "./pages/ChatRoomsPage";
import OddsPage from "./pages/OddsPage";
import LineupOptimizerPage from "./pages/LineupOptimizerPage";
import AdditionalDetailsPage from "./pages/authentication/AdditionalDetailsPage";
import HandleTokenRedirect from "./pages/authentication/HandleTokenRedirect.js";
import ForgotPasswordPage from "./pages/authentication/ForgotPasswordPage";
import ResetPasswordPage from "./pages/authentication/ResetPasswordPage";


function App() {
  return (
    <div className="container">
      <BrowserRouter basename="/">
        <NavBar />
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/signup" element={<SignUpPage/>} />
          <Route path="/login" element={<LoginPage/>} />
          <Route path="/additional-details" element={<AdditionalDetailsPage/>} />
          <Route path="/login/google" element={<HandleTokenRedirect />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage/>} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/profile" element={<ProfilePage/>} />
          <Route path="/help" element={<HelpPage/>} />
          <Route path="/teams" element={<TeamsPage/>} />
          <Route path="/standings" element={<StandingsPage/>} />
          <Route path="/depth-charts" element={<DepthChartsPage/>} />
          <Route path="/rankings" element={<RankingsPage/>} />
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