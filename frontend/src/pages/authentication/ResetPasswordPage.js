import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import logoImage from "../../assets/gridiron_gpt_secondary_dark.png";
import "./AuthenticationStyling.css";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get(process.env.REACT_APP_JWT_TOKEN_NAME);

  const isPasswordValid = password.length >= 8 && /[0-9]/.test(password) && /[\W_]/.test(password);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handlePasswordFocus = () => setPasswordFocused(true);
  const handlePasswordBlur = () => setPasswordFocused(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMessage("Password does not meet the required criteria.");
      return;
    }

    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_LINK}/users/reset-password`,
        {
          token,
          password
        }
      );

      navigate("/login");
    } catch (error) {
      setErrorMessage(
        "Failed to reset password."
      );
    }
  };

  return (
    <div className="vertical-center" style={{ marginTop: "110px" }}>
      <div className="small-container drop-shadow">
        <form onSubmit={handleSubmit}>
          <div className="vertical-center">
            <img className="logo-img" src={logoImage} alt="Logo" />
          </div>
          <h5 className="text-center" style={{ fontSize: "18px" }}>Reset Password</h5>
          <p className="text-center" style={{ fontSize: "14px" }}>Enter your new password.</p>

          {errorMessage && (
            <div style={{ marginLeft: "10px", marginTop: "20px", color: "#C4302B", fontSize: "12px" }}>
              {errorMessage}
            </div>
          )}

          <div className="margin input" style={{ marginTop: "20px" }}>
            <p className={password.length > 0 ? "input-label-full" : "input-label-empty unselectable"}>
              New Password
            </p>
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              onFocus={handlePasswordFocus}
              onBlur={handlePasswordBlur}
              style={{ paddingRight: "2.5rem", fontSize: "13px", paddingTop: password ? "14px" : "10px", paddingBottom: password ? "6px" : "10px" }}
              className="password-input"
            />
            <div className="input-icon" style={{ marginTop: "-3px" }} onClick={togglePasswordVisibility}>
              {passwordVisible ? <FaEye /> : <FaEyeSlash />}
            </div>
          </div>

          {passwordFocused && (
            <div className="margin" style={{ marginTop: "20px", marginLeft: "20px" }}>
              <div
                style={{
                  color: password.length >= 8 ? "#20609C" : "#C4302B",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  marginTop: "4px"
                }}
              >
                {password.length >= 8 ? <FaCheckCircle /> : <FaTimesCircle />}
                <span style={{ marginLeft: "5px" }}>At least 8 characters</span>
              </div>

              <div
                style={{
                  color: /[0-9]/.test(password) ? "#20609C" : "#C4302B",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  marginTop: "0px"
                }}
              >
                {/[0-9]/.test(password) ? <FaCheckCircle /> : <FaTimesCircle />}
                <span style={{ marginLeft: "5px" }}>At least one number</span>
              </div>

              <div
                style={{
                  color: /[\W_]/.test(password) ? "#20609C" : "#C4302B",
                  fontSize: "12px",
                  display: "flex",
                  alignItems: "center",
                  marginTop: "0px"
                }}
              >
                {/[\W_]/.test(password) ? <FaCheckCircle /> : <FaTimesCircle />}
                <span style={{ marginLeft: "5px" }}>At least one special character</span>
              </div>
            </div>
          )}
          <button className={`span-button ${isPasswordValid ? "" : "disabled"}`} type="submit" style={{ marginTop: "10px" }}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;