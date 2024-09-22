// Importing necessary React hooks and Axios for HTTP requests
import React, {useState} from "react";
import axios from "axios";
// Importing logo and styling components
import logoImage from "../../assets/gridiron_gpt_secondary_dark.png";
import {Link} from "react-router-dom";
import {FaCheckCircle, FaTimesCircle} from "react-icons/fa";

// Component for the "Forgot Password" page
const ForgotPasswordPage = () => {
	// State hooks for managing email input and message display
	const [email, setEmail] = useState("");
	const [errorMessage, setErrorMessage] = useState("");
	const [isSuccess, setIsSuccess] = useState(false);
	//const navigate = useNavigate();

	// check if valid email
	const isValidEmail = email => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};

	// Event handler for updating the email state on input change
	const handleChange = event => {
		setEmail(event.target.value);
	};

	// Event handler for form submission
	const handleSubmit = async event => {
		event.preventDefault();
		try {
			const response = await axios.post(
				process.env.REACT_APP_BACKEND_LINK + "/users/forgot-password",
				{email}
			);
			// Assuming the API responds with a success message
			setErrorMessage(
				response.data.message ||
					"If an account with that email exists, we have sent a reset password link."
			);
			setIsSuccess(true);
		} catch (error) {
			setErrorMessage("Error: Failed to reset password. Please try again.");
			setIsSuccess(false);
		}
	};

	// Rendering the Forgot Password page
	return (
		<div className="vertical-center margin-top">
			<div>
				<div className="small-container drop-shadow">
					
					<div className="vertical-center">
						<img className="logo-img" src={logoImage} alt="Logo" style={{marginTop:"10px"}}/>
					</div>
          			
					<h5 className="text-center" style={{ fontSize: "17px", marginLeft: "5px", marginRight: "15px", fontColor: "#2d2c2b" }}>Forgot Password?</h5>
					

					<form onSubmit={handleSubmit}>
                    {errorMessage && <div style={{marginLeft:"10px", marginTop:"10px", color: isSuccess ? "green" : "red", fontSize:"12px"}}>{errorMessage}</div>}

						<div className="input margin" style={{marginTop: "10px"}}>
							<p
								className={
									email.length > 0
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
								value={email}
								onChange={handleChange}
								required
								style={{ paddingRight: "2.5rem", fontSize: "13px", 								
								paddingTop: email ? "14px" : "10px",
								paddingBottom: email ? "6px" : "10px"}}
							/>
							<div className="input-icon" style={{marginTop:"-3px"}}>
								{email.length > 0 ? (
									isValidEmail(email) ? (
										<FaCheckCircle style={{color: "#20609C"}}/>
									) : (
										<FaTimesCircle style={{color: "#C4302B"}} />
									)
								) : null}
							</div>
						</div>

						<button
							className="span-button"
							type="submit"
							disabled={!isValidEmail(email)}
							style={{marginTop: "10px"}}
						>
							Send Reset Link
						</button>
					</form>
				</div>

				<div className="small-container drop-shadow" style = {{ marginTop: "10px"}}>
					<div className="text-center">
                        <p className="text-center" style={{fontSize: "14px"}}>
                            Return to {}
                            <Link to="/login">Log in</Link>
                        </p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ForgotPasswordPage;
