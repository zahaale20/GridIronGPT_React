import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function HandleTokenRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    console.log("URL:", window.location.href);  // Check the full URL
    console.log("Token:", token);  // Log the token

    if (token) {
      localStorage.setItem(process.env.REACT_APP_JWT_TOKEN_NAME, token);
      navigate("/profile");  // Navigate to profile if token exists
    } else {
      console.error("Token missing in URL");  // Log an error if token is missing
      // Attempt to retrieve the token from local storage if not in URL
      const storedToken = localStorage.getItem(process.env.REACT_APP_JWT_TOKEN_NAME);
      if(storedToken) {
        navigate("/profile");
      } else {
        navigate("/login");  // Navigate back to login if no token
      }
    }
  }, [navigate]);

  return <div>Loading...</div>;
}

export default HandleTokenRedirect;
