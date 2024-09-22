import React, {useState} from "react";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import {FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle} from "react-icons/fa";
import logoImage from "../../assets/gridiron_gpt_secondary_dark.png";
import "./AuthenticationStyling.css";

// ChangePasswordPage component for handling password reset functionality
const ChangePasswordPage = () => {
	const [errorMessage, setErrorMessage] = useState("");
	const [password, setPassword] = useState("");
	const [passwordVisible, setPasswordVisible] = useState(false);
	const [passwordFocused, setPasswordFocused] = useState(false);
	const navigate = useNavigate();

	const isPasswordValid =
		password.length >= 8 &&
		/[0-9]/.test(password) &&
		/[\W_]/.test(password);

	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	const handlePasswordFocus = () => setPasswordFocused(true);
	const handlePasswordBlur = () => setPasswordFocused(false);

	const handleSubmit = async e => {
		e.preventDefault();
		
		if (!isPasswordValid) {
			alert("Password does not meet the required criteria.");
			return;
		}

		const token = localStorage.getItem(process.env.REACT_APP_JWT_TOKEN_NAME);

		try {
			await axios.post(
				`${process.env.REACT_APP_BACKEND_LINK}/users/change-password`,
				{ password },
				{ headers: { Authorization: `Bearer ${token}` } }
			);
			setErrorMessage(
				"Password has been successfully reset. You can now login with your new password."
			);
			navigate("/profile");
		} catch (error) {
			setErrorMessage(
				"Failed to change password. Please try again or request a new password reset link."
			);
		}
	};

    return (
        <div className="vertical-center margin-top">
            <div className="small-container drop-shadow">
                <form onSubmit={handleSubmit}>
                    <div className="vertical-center">
                        <img className="logo-img" src={logoImage} alt="Logo" />
                    </div>
                    <h5 className="text-center" style={{ fontSize: "18px" }}>Change Password</h5>
                    <p className="text-center" style={{ fontSize: "14px" }}>Enter your new password and check it to confirm it&apos;s correct.</p>
                    {errorMessage && <div style={{marginLeft:"10px", marginTop:"10px", color:"red", fontSize:"12px"}}>{errorMessage}</div>}
					<div className="margin input" style = {{marginTop:"10px"}}>
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
                            style={{ paddingRight: "2.5rem", fontSize: "13px", 								
							paddingTop: password ? "14px" : "10px",
							paddingBottom: password ? "6px" : "10px"}}
						/>
                        <div className="input-icon" style={{marginTop:"-3px"}} onClick={togglePasswordVisibility}>
                            {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                        </div>
                    </div>
                    {passwordFocused && (
                        <div className="password-rules" style={{fontSize:"12px", marginTop: "10px", marginLeft: "20px"}}>
                            <PasswordRule isValid={password.length >= 8} text="At least 8 characters" />
                            <PasswordRule isValid={/[0-9]/.test(password)} text="At least one number" />
                            <PasswordRule isValid={/[\W_]/.test(password)} text="At least one special character" />
                        </div>
                    )}
                    <button className={`span-button ${isPasswordValid ? "" : "disabled"}`} type="submit" style={{ marginTop: "10px" }}>
                        Change Password
                    </button>
                </form>
            </div>
        </div>
    );
};

const PasswordRule = ({isValid, text}) => (
	<div style={{color: isValid ? "green" : "red"}}>
		{isValid ? (
			<FaCheckCircle
				style={{marginRight: "8px", position: "relative", top: "2px"}}
			/>
		) : (
			<FaTimesCircle
				style={{marginRight: "8px", position: "relative", top: "2px"}}
			/>
		)}
		{text}
	</div>
);

// Define PropTypes for PasswordRule component
PasswordRule.propTypes = {
	isValid: PropTypes.bool.isRequired,
	text: PropTypes.string.isRequired
};

export default ChangePasswordPage;
