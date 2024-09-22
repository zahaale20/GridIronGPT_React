import React, {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate, Link} from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import logoImage from "../../assets/gridiron_gpt_secondary_dark.png";
import "./AuthenticationStyling.css"; // Ensure the same CSS file is used

function AdditionalDetailsPage() {
    const navigate = useNavigate();
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [userData, setUserData] = useState({
        username: "",
        name: "",
        phoneNumber: "",
        password: "",
        email: new URLSearchParams(window.location.search).get("email"),
        name: new URLSearchParams(window.location.search).get("name")
    });

    const [isFormValid, setIsFormValid] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const isPasswordValid = userData.password.length >= 8 && /[0-9]/.test(userData.password) && /[\W_]/.test(userData.password);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handlePasswordFocus = () => setPasswordFocused(true);
    const handlePasswordBlur = () => setPasswordFocused(false);

    // Handle input changes
    const handleChange = event => {
        const {name, value} = event.target;
        setUserData({...userData, [name]: value});
    };

    // Validate form
    useEffect(() => {
        const isValid =
            userData.username.trim().length > 0 &&
            userData.phoneNumber.trim().length > 0 &&
            isPasswordValid;
        setIsFormValid(isValid);
    }, [userData, isPasswordValid]);

    const handleSubmit = async event => {
        event.preventDefault();
        if (!isFormValid) {
            setErrorMessage("Please fill all fields correctly.");
            return;
        }

        try {
            const response = await axios.post(
                process.env.REACT_APP_BACKEND_LINK + "/users/register-google-user",
                userData
            );
            localStorage.setItem(
                process.env.REACT_APP_JWT_TOKEN_NAME,
                response.data.token
            );
            navigate("/profile");
        } catch (error) {
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(`Registration failed: ${error.response.data.error}`);
            } else if (error.message) {
                setErrorMessage(`Registration failed: ${error.message}`);
            } else {
                setErrorMessage("Registration failed. Please try again.");
            }
        };
    }

    return (
        <div className="vertical-center margin-top">
            <div className="small-container drop-shadow">
                <div className="vertical-center">
                    <img className="logo-img" src={logoImage} alt="Gridiron GPT Logo" />
                </div>
                <form onSubmit={handleSubmit}>
                    <h5 className="text-center" style={{ fontSize: "18px", marginTop: "10px" }}>
                        Complete Your Registration
                    </h5>
                    <p className="text-center" style={{ fontSize: "14px", marginTop:"20px" }}>Add your username and phone number to finish registering.</p>
                    {errorMessage && <div style={{marginLeft:"10px", marginTop:"0px", color:"#C4302B", fontSize:"12px"}}>{errorMessage}</div>}
                    <div className="margin input">
                        <p className={userData.username ? "input-label-full" : "input-label-empty unselectable"}>
                            Username
                        </p>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={userData.username}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                            style={{ paddingRight: "2.5rem", fontSize: "13px", paddingTop: userData.username ? "14px" : "10px", paddingBottom: userData.username ? "6px" : "10px"}}
                        />
                    </div>

                    <div className="margin input">
                        <p className={userData.phoneNumber ? "input-label-full" : "input-label-empty unselectable"}>
                            Phone Number
                        </p>
                        <input
                            type="tel"
                            name="phoneNumber"
                            id="phoneNumber"
                            value={userData.phoneNumber}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                            style={{ paddingRight: "2.5rem", fontSize: "13px", paddingTop: userData.phoneNumber ? "14px" : "10px", paddingBottom: userData.username ? "6px" : "10px"}}
                        />
                    </div>

                    <div className="margin input" >
                        <p className={userData.password.length > 0 ? "input-label-full" : "input-label-empty unselectable"}>
                            Password
                        </p>
                        <input
                            type={passwordVisible ? "text" : "password"}
                            name="password"
                            value={userData.password}
                            onChange={handleChange}
                            required
                            onFocus={handlePasswordFocus}
                            onBlur={handlePasswordBlur}
                            style={{ paddingRight: "2.5rem", fontSize: "13px", paddingTop: userData.password ? "14px" : "10px", paddingBottom: userData.password ? "6px" : "10px" }}
                        />
                        <div className="input-icon" onClick={togglePasswordVisibility} style={{ marginTop: "-3px" }}>
                            {passwordVisible ? <FaEye /> : <FaEyeSlash />}
                        </div>
                    </div>

                    {passwordFocused && (
                        <div className="password-criteria-display" style={{ marginTop: "20px", marginLeft: "20px" }}>
                            <PasswordCriteria label="At least 8 characters" isValid={userData.password.length >= 8} />
                            <PasswordCriteria label="At least one number" isValid={/[0-9]/.test(userData.password)} />
                            <PasswordCriteria label="At least one special character" isValid={/[\W_]/.test(userData.password)} />
                        </div>
                    )}

                    <button
                        className={`span-button ${isFormValid ? "" : "disabled"}`}
                        type="submit"
                        style={{ marginTop: "20px" }}
                    >
                        Complete Registration
                    </button>
                </form>
            </div>
        </div>
    );
}

function PasswordCriteria({ label, isValid }) {
    return (
        <div style={{
            color: isValid ? "#20609C" : "#C4302B",
            fontSize: "12px",
            display: "flex",
            alignItems: "center",
            marginTop: "4px"
        }}>
            {isValid ? <FaCheckCircle /> : <FaTimesCircle />}
            <span style={{ marginLeft: "5px" }}>{label}</span>
        </div>
    );
}

export default AdditionalDetailsPage;
