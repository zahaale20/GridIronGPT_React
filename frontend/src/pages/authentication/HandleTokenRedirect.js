import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HandleTokenRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token !== null) {
      localStorage.setItem(process.env.REACT_APP_JWT_TOKEN_NAME, token);
      navigate("/profile"); // Navigate to the profile page
    } else {
      navigate("/login"); // No token found, redirect to login
    }
  }, [navigate]);

  return <div>Loading...</div>;
}

export default HandleTokenRedirect;