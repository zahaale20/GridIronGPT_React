// Importing necessary React hooks and Axios for HTTP requests
import React, {useState, useEffect} from "react";
import axios from "axios";
// Importing navigation hooks and components for routing and navigation
import {Link} from "react-router-dom";
// Importing logo, icons, and styled components for UI
import logoImage from "../../assets/gridiron_gpt_secondary_dark.png";
import {FaEye, FaEyeSlash} from "react-icons/fa";
import googlepng from "../../assets/google.png";
import "./AuthenticationStyling.css";

// LoginPage component for handling user login
function LoginPage() {
	// State for storing user credentials, form validity, error messages, and password visibility
	const [credentials, setCredentials] = useState({
		identifier: "",
		password: ""
	});
	
	const [isFormValid, setIsFormValid] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const [passwordVisible, setPasswordVisible] = useState(false);
	// const navigate = useNavigate();

	// Handles changes in input fields and updates the credentials state
	const handleChange = event => {
		const {name, value} = event.target;
		setCredentials({...credentials, [name]: value});
	};

	// Toggles the visibility of the password input field
	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
		const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
		console.log(clientId);
	};

	// Handles the form submission event for login
	const handleSubmit = async event => {
		event.preventDefault();
		try {
			// Constructs the request body and sends a POST request to the login endpoint
			const requestBody = {
				identifier: credentials.identifier,
				password: credentials.password
			};

			const response = await axios.post(
				process.env.REACT_APP_BACKEND_LINK + "/users/login",
				requestBody
			);
			// console.log("jwt token name: " + process.env.REACT_APP_JWT_TOKEN_NAME);
			localStorage.setItem(
				process.env.REACT_APP_JWT_TOKEN_NAME,
				response.data.token
			); // Stores the received token in local storage and navigates to the profile page
			const url = process.env.REACT_APP_FRONTEND_LINK + "/profile";
			window.history.pushState({}, "", url);
			window.dispatchEvent(new PopStateEvent("popstate"));
		} catch (error) {
			// Sets an error message based on the response from the server or a general failure message
			if (error.response) {
				setErrorMessage("Error: " + error.response.data.error);
			} else {
				setErrorMessage("Error: Login failed. Please try again.");
			}
		}
	};

	const handleGoogleLogin = () => {
		const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

		const redirectUrl =
			process.env.REACT_APP_BACKEND_LINK + "/users/auth/google/callback";
		const scope = encodeURI("email profile");
		const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUrl}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
		window.location.href = authUrl;
	};

	// Effect hook to update the form validity based on the credentials state
	useEffect(() => {
		const isValid =
			credentials.identifier.length > 0 &&
			credentials.password.length > 0;
		setIsFormValid(isValid);
	}, [credentials]);

	// Renders the login form, providing fields for identifier and password, and displays error messages if any exist
	return (
		<div className="vertical-center margin-top">
			<div>
				<div className="small-container drop-shadow">
					
					<div className="vertical-center">
						<img className="logo-img" src={logoImage} alt="Logo" style={{marginTop:"10px"}}/>
					</div>

					<h5 className="text-center" style={{fontSize: "18px"}}>
						Log in to access your account
					</h5>

					<form onSubmit={handleSubmit}>
						
						{errorMessage && <div style={{marginLeft:"10px", marginTop:"0px", color:"#C4302B", fontSize:"12px"}}>{errorMessage}</div>}

						<div className="margin input">
							<p
								className={
									credentials.identifier.length > 0
										? "input-label-full"
										: "input-label-empty unselectable"
								}
							>
								Email, Phone, or Username
							</p>
							<input
								type="text"
								name="identifier"
								id="identifier"
								value={credentials.identifier}
								onChange={handleChange}
								autoComplete="on"
								required
								style={{ paddingRight: "2.5rem", fontSize: "13px", 								
								paddingTop: credentials.identifier ? "14px" : "10px",
								paddingBottom: credentials.identifier ? "6px" : "10px"}}
							/>
						</div>

						<div className="margin input">
							<p
								className={
									credentials.password.length > 0
										? "input-label-full"
										: "input-label-empty unselectable"
								}
							>
								Password
							</p>
							<input
								type={passwordVisible ? "text" : "password"}
								name="password"
								id="password"
								value={credentials.password}
								onChange={handleChange}
								autoComplete="current-password"
								required
								style={{ paddingRight: "2.5rem", fontSize: "13px", 								
								paddingTop: credentials.password ? "14px" : "10px",
								paddingBottom: credentials.password ? "6px" : "10px"}}
							/>

							<div
								className="input-icon"
								onClick={togglePasswordVisibility}
								style = {{marginTop:"-3px"}}
							>
								{passwordVisible ? <FaEye /> : <FaEyeSlash />}
							</div>
						</div>

						<div className="margin" style={{marginTop: "20px"}}>
							<button
								className={`span-button ${isFormValid ? "" : "disabled"}`}
								type="submit"
							>
								Log in
							</button>
						</div>

						<div className="margin">
							<button
								className="span-button"
								onClick={handleGoogleLogin}
							>
								<div className="vertical-center">
									<img
										className="google-img"
										src={googlepng}
										alt="google"
									></img>
									<span className="margin-left">
										Continue with Google
									</span>
								</div>
							</button>
						</div>

						<p
							className="text-center margin-bottom"
							style={{fontSize: "12px", marginTop: "20px"}}
						>
							By logging in you agree to our {}
							<Link to="/terms-of-service">Terms of Service</Link>
							{} and acknowledge our {}
							<Link to="/privacy-policy">Privacy Policy</Link>
						</p>

						<p
							className="text-center"
							style={{marginTop: "-10px", fontSize: "14px"}}
						>
							<Link to="/forgot-password">Forgot password?</Link>
						</p>
					</form>
				</div>

				<div
					className="small-container drop-shadow"
					style={{marginTop: "10px"}}
				>
					<p className="text-center" style={{fontSize: "14px"}}>
						Don&apos;t have an account? {}
						<Link to="/signup">Sign up</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default LoginPage;
