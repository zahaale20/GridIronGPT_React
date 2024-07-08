import React, {useState, useEffect} from "react";
import axios from "axios";
import {useNavigate, Link} from "react-router-dom";
import logoImage from "../../assets/gridirongpt.png";
import "./AuthenticationStyling.css"; // Ensure the same CSS file is used

function AdditionalDetailsPage() {
	const navigate = useNavigate();
	const [userData, setUserData] = useState({
		username: "",
		phoneNumber: "",
		email: new URLSearchParams(window.location.search).get("email"), // Get 'email' from URL
		name: new URLSearchParams(window.location.search).get("name") // Get 'name' from URL
	});

	console.log("Email from query:", userData.email);
	console.log("Name from query:", userData.name);

	const [isFormValid, setIsFormValid] = useState(false);
	const [errorMessage, setErrorMessage] = useState("");

	// Handle input changes
	const handleChange = event => {
		const {name, value} = event.target;
		setUserData({...userData, [name]: value});
	};

	// Validate form
	useEffect(() => {
		const isValid =
			userData.username.trim().length > 0 &&
			userData.phoneNumber.trim().length > 0;
		setIsFormValid(isValid);
	}, [userData]);

	// Submit handler
	const handleSubmit = async event => {
		event.preventDefault();
		if (!isFormValid) {
			setErrorMessage("Please fill all fields correctly.");
			return;
		}
		try {
			const response = await axios.post(
				process.env.REACT_APP_BACKEND_LINK +
					"/users/register-google-user",
				userData
			);
			localStorage.setItem(
				process.env.REACT_APP_JWT_TOKEN_NAME,
				response.data.token
			);
			navigate("/profile"); // Redirect to profile page after registration
		} catch (error) {
			const errorText = error.response
				? error.response.data.error
				: error.message;
			setErrorMessage(`Registration failed: ${errorText}`);
			console.error("Registration failed:", error);
		}
	};

    return (
        <div className="vertical-center margin-top">
            <div className="small-container drop-shadow">
                <div className="vertical-center">
                    <img className="logo-img" src={logoImage} alt="Haggle Logo" />
                </div>
                <form onSubmit={handleSubmit}>
                    <h5 className="text-center" style={{ fontSize: "18px", marginTop: "20px" }}>
                        Complete Your Registration
                    </h5>
					<p className="text-center" style={{ fontSize: "14px", marginTop:"20px" }}>Add your username and phone number to finish registering.</p>
                    {errorMessage && <div>{errorMessage}</div>}
                    <div className="margin input" style ={{marginTop:"20px"}}>
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
							style={{fontSize: "13px", 								
							paddingTop: userData.username ? "16px" : "12px",
							paddingBottom: userData.username ? "8px" : "12px"}}
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
							style={{fontSize: "13px", 								
							paddingTop: userData.phoneNumber ? "16px" : "12px",
							paddingBottom: userData.phoneNumber ? "8px" : "12px"}}
                        />
                    </div>

					<button
						className={`span-button ${isFormValid ? "" : "disabled"}`}
						type="submit"
						style={{marginTop: "20px"}}
					>
						Complete Registration
					</button>

					<p
						className="text-center"
						style={{fontSize: "12px", marginTop: "20px"}}
					>
						By registering you agree to our{" "}
						<Link to="/terms-of-service">Terms of Service</Link> and
						acknowledge our{" "}
						<Link to="/privacy-policy">Privacy Policy</Link>
					</p>
				</form>
			</div>
		</div>
	);
}

export default AdditionalDetailsPage;
