import React, {useState, useEffect} from "react";
import axios from "axios";
import logoImage from "../../assets/gridirongpt.png";
import {FaCheckCircle, FaTimesCircle, FaEye, FaEyeSlash} from "react-icons/fa";
import {Link, useNavigate} from "react-router-dom";
import "./AuthenticationStyling.css";


function SignUpPage() {

	// State for form data, password visibility, input focus, and form validation
	const [user, setUser] = useState({
		username: "",
		fullName: "",
		password: "",
		email: "",
		phoneNumber: ""
	});

	const [passwordVisible, setPasswordVisible] = useState(false);
	const [passwordFocused, setPasswordFocused] = useState(false);
	const [isFormValid, setIsFormValid] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");
	const navigate = useNavigate();

	// Function to validate form inputs based on predefined rules
	const isInputValid = (name, value) => {
		// Password validation rules
		const passwordRules = {
			minLength: value.length >= 8,
			containsNumber: /[0-9]/.test(value),
			containsSpecialChar: /[\W_]/.test(value)
		};

		// Phone number validation rules
		const phoneNumRules = {
			minLength: value.length === 10,
			maxLength: value.length === 10,
			containsNumber: /[0-9]/.test(value)
		};

		// Validation logic for different inputs
		switch (name) {
			case "username":
				return value.length >= 3 && value.length <= 25;
			case "fullName":
				return value.length > 0 && value.length <= 40;
			case "password":
				return Object.values(passwordRules).every(valid => valid);
			case "email":
				return /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value);
			case "phoneNumber":
				return Object.values(phoneNumRules).every(valid => valid);
			default:
				return false;
		}
	};

	// Effect hook to update form validity based on input validation
	useEffect(() => {
		const isValid = Object.keys(user).every(key =>
			isInputValid(key, user[key])
		);
		setIsFormValid(isValid);
	}, [user]);

	// Handlers for password input focus, visibility toggle, and general input changes
	const handlePasswordFocus = () => setPasswordFocused(true);
	const handlePasswordBlur = () => setPasswordFocused(false);

	const handleChange = event => {
		const {name, value} = event.target;
		// Special handling for phoneNumber to ensure only numbers are inputted
		if (name === "phoneNumber") {
			const filteredValue = value.replace(/[^\d]/g, "");
			setUser({
				...user,
				[name]: filteredValue
			});
		} else {
			setUser({
				...user,
				[name]: value
			});
		}
	};

	// Function to set password visiblity to true if false and vice versa
	const togglePasswordVisibility = () => {
		setPasswordVisible(!passwordVisible);
	};

	// Function to handle form submission
	const handleSubmit = async event => {
		event.preventDefault();

		// Reset error message at the beginning of submission attempt
		setErrorMessage("");

		if (isFormValid) {
			try {
				// Pre-registration check for existing username, email, or phone number
				console.log("\nprocess.env.REACT_APP_BACKEND_LINK: ", process.env.REACT_APP_BACKEND_LINK);
				const checkResponse = await axios.post(
					process.env.REACT_APP_BACKEND_LINK + "/users/check",
					{
						email: user.email,
						phoneNumber: user.phoneNumber,
						username: user.username
					}
				);

				console.log("\ncheckResponse: ", checkResponse);

				// Display specific error message based on the conflict
				if (checkResponse.data.exists) {
					setErrorMessage(
						`${checkResponse.data.message} already exists.`
					);

					// Proceed with registration if no conflicts
				} else {
					// Proceed with registration if no conflicts
					const registerResponse = await axios.post(
						process.env.REACT_APP_BACKEND_LINK + "/users/register",
						user
					);
					if (registerResponse.status === 201) {
						// success
						navigate("/login");
					}
				}
			} catch (error) {
				if (error.response) {
					// Backend provides specific error message in response
					const message =
						error.response.data.error ||
						error.response.data.message;
					setErrorMessage(`Error:  ${message}`);
				} else {
					// Fallback error message for network issues or unexpected errors
					setErrorMessage(
						"An error occurred during registration. Please try again."
					);
				}
			}
			// doesn't pop up since submit button is disabled until all fields are filled out... get rid of
		} else {
			setErrorMessage(
				"Please ensure all fields are filled out correctly before submitting."
			);
		}
	};

	// Render the sign-up form with validation feedback and navigation options
	return (
		<div className="vertical-center" style={{marginTop: "110px"}}>
			<div>
				<div className="small-container drop-shadow">
					<div className="vertical-center">
						<img className="logo-img" src={logoImage} alt="Logo" style={{marginTop:"20px"}}/>
					</div>
          <h5 className="text-center" style={{ fontSize: "18px" }}>Create an Account</h5>
					<form onSubmit={handleSubmit}>

						{errorMessage && <div style={{marginLeft:"10px", marginTop:"20px", color:"#C4302B", fontSize:"12px"}}>{errorMessage}</div>}


						<div className="input margin"> 
							<p
								className={
									user.email.length > 0
										? "input-label-full"
										: "input-label-empty unselectable"
								}
							>
								Email
							</p>
							
							<input
								type="email"
								name="email"
								id="email"
								value={user.email}
								maxLength="50"
								onChange={handleChange}
								autoComplete="off"
								required
								style={{ paddingRight: "2.5rem", fontSize: "13px", 								
								paddingTop: user.email ? "16px" : "12px",
								paddingBottom: user.email ? "8px" : "12px"}}
							/>
							<div className="input-icon" style={{marginTop:"-3px"}}>
								{user.email.length > 0 ? (
									isInputValid("email", user.email) ? (
										<FaCheckCircle
											style={{color: "#20609C"}}
										/>
									) : (
										<FaTimesCircle style={{color: "#C4302B"}} />
									)
								) : null}
							</div>
						</div>

						<div className="input margin">
							<p
								className={
									user.phoneNumber.length > 0
										? "input-label-full"
										: "input-label-empty unselectable"
								}
							>
								Phone Number
							</p>
							
							<input
								type="tel"
								name="phoneNumber"
								id="phoneNumber"
								value={user.phoneNumber}
								maxLength="10"
								onChange={handleChange}
								style={{ paddingRight: "2.5rem", fontSize: "13px", 								
								paddingTop: user.phoneNumber ? "16px" : "12px",
								paddingBottom: user.phoneNumber ? "8px" : "12px"}}
								autoComplete="off"
								required
							/>

							<div className="input-icon" style={{marginTop:"-3px"}}>
								{user.phoneNumber.length > 0 ? (
									isInputValid(
										"phoneNumber",
										user.phoneNumber
									) ? (
										<FaCheckCircle
											style={{color: "#20609C"}}
										/>
									) : (
										<FaTimesCircle style={{color: "#C4302B"}} />
									)
								) : null}
							</div>
						</div>

						<div className="input margin">
							<p
								className={
									user.username.length > 0
										? "input-label-full"
										: "input-label-empty unselectable"
								}
							>
								Username
							</p>
							<input
								type="text"
								name="username"
								id="username"
								value={user.username}
								maxLength="25"
								onChange={handleChange}
								style={{ paddingRight: "2.5rem", fontSize: "13px", 								
								paddingTop: user.username ? "16px" : "12px",
								paddingBottom: user.username ? "8px" : "12px"}}
								autoComplete="off"
								required
							/>
							<div className="input-icon" style={{marginTop:"-3px"}}>
								{user.username.length > 0 ? (
									isInputValid("username", user.username) ? (
										<FaCheckCircle
											style={{color: "#20609C"}}
										/>
									) : (
										<FaTimesCircle style={{color: "#C4302B"}} />
									)
								) : null}
							</div>
						</div>

						<div className="input margin">
							<p
								className={
									user.fullName.length > 0
										? "input-label-full"
										: "input-label-empty unselectable"
								}
							>
								Full Name
							</p>
							<input
								type="text"
								name="fullName"
								id="fullName"
								maxLength="40"
								value={user.fullName}
								onChange={handleChange}
								style={{ paddingRight: "2.5rem", fontSize: "13px", 								
								paddingTop: user.fullName ? "16px" : "12px",
								paddingBottom: user.fullName ? "8px" : "12px"}}
								autoComplete="off"
								required
							/>
							<div className="input-icon" style={{marginTop:"-3px"}}>
								{user.fullName.length > 0 ? (
									isInputValid(
										"fullName",
										user.fullName
									) ? (
										<FaCheckCircle
											style={{color: "#20609C"}}
										/>
									) : (
										<FaTimesCircle style={{color: "#C4302B"}} />
									)
								) : null}
							</div>
						</div>

						<div className="input margin">
							<p
								className={
									user.password.length > 0
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
								minLength="8"
								value={user.password}
								onChange={handleChange}
								onFocus={handlePasswordFocus}
								onBlur={handlePasswordBlur}
								style={{ paddingRight: "2.5rem", fontSize: "13px", 								
								paddingTop: user.password ? "16px" : "12px",
								paddingBottom: user.password ? "8px" : "12px"}}
								autoComplete="off"
								required
							/>
							<div
								className="input-icon"
								onClick={togglePasswordVisibility}
								style={{marginTop:"-3px"}}
							>
								{passwordVisible ? <FaEye /> : <FaEyeSlash />}
							</div>
						</div>

						{passwordFocused && (
              <div className="margin" style={{marginTop:"20px", marginLeft:"20px"}}>
                <div
                  style={{
                    color: user.password.length >= 8 ? "#20609C" : "#C4302B",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    marginTop: "4px"  // Adjust this value as needed
                  }}
                >
                  {user.password.length >= 8 ? (
                    <FaCheckCircle />
                  ) : (
                    <FaTimesCircle />
                  )}
                  <span style={{ marginLeft: "5px" }}>
                    At least 8 characters
                  </span>
                </div>
                <div
                  style={{
                    color: /[0-9]/.test(user.password) ? "#20609C" : "#C4302B",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    marginTop: "4px"  // Adjust this value as needed
                  }}
                >
                  {/[0-9]/.test(user.password) ? (
                    <FaCheckCircle />
                  ) : (
                    <FaTimesCircle />
                  )}
                  <span style={{ marginLeft: "5px" }}>
                    At least one number
                  </span>
                </div>
                <div
                  style={{
                    color: /[\W_]/.test(user.password) ? "#20609C" : "#C4302B",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    marginTop: "4px"  // Adjust this value as needed
                  }}
                >
                  {/[\W_]/.test(user.password) ? (
                    <FaCheckCircle />
                  ) : (
                    <FaTimesCircle />
                  )}
                  <span style={{ marginLeft: "5px" }}>
                    At least one special character
                  </span>
                </div>
              </div>
            )}

						<div style={{marginTop: "20px"}}>
							<button
								className={`span-button ${isFormValid ? "" : "disabled"}`}
								type="submit"
							>
								Sign Up
							</button>
						</div>

						<p
							className="text-center margin-bottom"
							style={{
								fontSize: "12px",
								marginTop: "20px",
								marginBottom: "10px"
							}}
						>
							By registering you agree to our {}
							<Link to="/terms-of-service">Terms of Service</Link>
							{} and acknowledge our {}
							<Link to="/privacy-policy">Privacy Policy</Link>
						</p>
					</form>
				</div>

				<div
					className="small-container drop-shadow"
					style={{marginTop: "10px"}}
				>
					<p className="text-center" style={{fontSize: "14px"}}>
						Already have an account? {}
						<Link to="/login">Log in</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default SignUpPage;
