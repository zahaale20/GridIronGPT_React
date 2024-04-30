import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import NavBar from './components/NavBar'; // Ensure the path is correct

import HomePage from "./pages/HomePage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <div className="container">
      <BrowserRouter basename="/">
        <NavBar />  {/* NavBar is included here so it renders on every page */}
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="*" element={<NotFoundPage/>} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;