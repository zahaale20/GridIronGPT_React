import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NavBar from './components/NavBar';
import HomePage from "./pages/home/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

import SignUpPage from "./pages/authentication/SignupPage";
import LoginPage from "./pages/authentication/LoginPage";
import AdditionalDetailsPage from "./pages/authentication/AdditionalDetailsPage";
import HandleTokenRedirect from "./pages/authentication/HandleTokenRedirect.js";
import ForgotPasswordPage from "./pages/authentication/ForgotPasswordPage";
import ResetPasswordPage from "./pages/authentication/ResetPasswordPage";
import ChangePasswordPage from "./pages/authentication/ChangePasswordPage";
import ProfilePage from "./pages/user/ProfilePage.js";

import DraftRankingsPage from "./pages/fantasy/DraftRankingsPage.js";
import TradeAnalyzerPage from "./pages/trade_analyzer/TradeAnalyzerPage.js";
import RankingsPage from "./pages/rankings/RankingsPage.js";
import MatchupsPage from "./pages/matchups/MatchupsPage.js";


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
          <Route path="/change-password" element={<ChangePasswordPage />} />

          <Route path="/profile" element={<ProfilePage/>} />

          <Route path="/fantasy" element={<DraftRankingsPage/>} />
          <Route path="/trade-analyzer" element={<TradeAnalyzerPage/>} />
          <Route path="/rankings" element={<RankingsPage/>} />
          <Route path="/matchups" element={<MatchupsPage/>} />

          <Route path="*" element={<NotFoundPage/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;