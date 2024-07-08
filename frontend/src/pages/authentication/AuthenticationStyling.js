// Styled components for authentication related pages, using styled-components for CSS-in-JS
import styled, {css} from "styled-components";

/*

General Components

*/
// Container for centering and styling the main content area
export const Container = styled.div`
	display: flex;
	flex-direction: column;
	max-width: 400px;
	margin: 0 auto;
	margin-top: 35px;
	margin-bottom: 15px;
	padding: 40px;
	padding-bottom: 15px;
	font-family: "arial";
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	align-items: center;
	border-radius: 7px;
`;

export const Container2 = styled.div`
	display: flex;
	flex-direction: column;
	max-width: 500px;
	margin: 0 auto;
	padding: 40px;
	font-family: "arial";
	align-items: center;
	border-radius: 7px;
`;


// Form styled component for styling form elements collectively
export const Form = styled.form`
	display: flex;
	flex-direction: column;
`;

export const LogoImage = styled.img`
	display: block;
	margin: 0 auto 0px;
	width: 200px;
	height: auto;
`;

export const ErrorLabel = styled.label`
	display: block;
	color: red;
	margin-top: -10px;
	font-size: 12px;
	text-align: left;
	font-weight: normal;
`;

export const SuccessLabel = styled.label`
	display: block;
	color: green;
	margin-top: -10px;
	font-size: 12px;
	text-align: left;
	font-weight: normal;
`;

// InputGroup styled component for grouping input fields and their labels
export const InputGroup = styled.div`
	margin-left: 10px;
	position: relative;
	margin-bottom: 8px;
	width: 330px;
`;

// InputLabel styled component for customizing input labels
export const InputLabel = styled.label`
	position: absolute;
	top: -15%;
	left: 4%;
	font-size: 14px;
	color: #999;
	transition: all 0.3s ease;
	pointer-events: none;
	font-weight: normal;

	// Conditional styling when the input field has content
	${props =>
		props.hasContent &&
		css`
			transform: translate(0%, -45%);
			font-size: 10px;
			font-weight: normal;
			color: #999;
		`}
`;

// Input styled component for customizing text inputs
export const Input = styled.input`
  width: 100%;
  padding-top: ${props => (props.hasContent ? "22px" : "14px")};
  padding-bottom: ${props => (props.hasContent ? "8px" : "8px")}
  line-height: ${props => (props.hasContent ? "22px" : "16px")};

  height: 40px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 12px;
  transition: border 0.3s, box-shadow 0.3s;

  // Styles for when the input is focused
  &:focus {
    outline: none;
    border-color: #007b00;
    box-shadow: 0 0 8px rgba(0, 183, 0, 0.8);
  }
`;

// VisibilityToggle styled component for the password visibility toggle icon
export const VisibilityToggle = styled.span`
	position: absolute;
	top: 20%;
	right: 10px;
	color: #666;
	cursor: pointer;
`;

// Linked Label for 'terms of service' and 'privacy policy'
export const LinkedLabel = styled.label`
	color: #666;
	font-size: 12px;
	text-align: center;
	margin-top: 12px;
	font-weight: normal;
`;

// Main button styling with hover, focus, and disabled states for visual feedback
export const Button = styled.button`
	padding: 8px;
	background-color: #14a44a;
	align-items: center; // Align items vertically
	justify-content: center; // Center content horizontally
	color: white;
	border: none;
	margin-top: 10px;
	border-radius: 4px;
	cursor: pointer;
	width: 100%;
	transition:
		background-color 0.3s,
		box-shadow 0.3s; // Added box-shadow to the transition for a smooth effect

	&:hover {
		background-color: #138a3e; // Darker green on hover
		border-color: #138a3e;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.2); // Subtle shadow for depth, adjust as needed
	}

	&:focus,
	&:active {
		background-color: #14a44a; // Keep the original green color
		outline: none; // Removes the default focus outline
		border-color: #14a44a; // Ensures the border color stays consistent
		box-shadow: 0 0 0 2px rgba(22, 164, 74, 0.5); // Optional: Adds a custom focus glow
	}

	&:disabled {
		background-color: #8ccba1;
		cursor: not-allowed;
		border-color: transparent;
	}
`;

// Container for additional info/navigation at the bottom of the page (already have an account?) (don't have an account?)
export const BottomContainer = styled.div`
	max-width: 400px;
	min-height: 60px;
	margin: 10px auto;
	display: flex;
	justify-content: center;
	align-items: center;
	font-family: "arial";
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
`;

// Label at for text in BottomContainer, use with <Link> to navigate to another page
export const BottomLabel = styled.label`
	color: #666;
	font-size: 14px;
	text-align: center;
	margin: 25px;
	font-weight: normal;
`;

export const ErrorMessage = styled.div`
	color: red;
	font-size: 14px;
	margin-top: 5px;
	text-align: center;
`;
/*

Components specific to LoginPage.js

*/

// Styling for forgot password label
export const ForgotPasswordLabel = styled.label`
	color: #666;
	font-size: 12px;
	text-align: center;
	margin-top: 20px;
	margin-bottom: 10px;
	font-weight: normal;
`;

export const GoogleImage = styled.img`
	width: 20px; // Adjusted width for better visual balance
	height: 20px; // Keep height and width the same for a square aspect ratio
	margin-right: 50px; // Adds spacing between the image and the text
	margin-left: -60px; // Moves the image 5px to the left
	vertical-align: middle; // Aligns the image vertically with text
	object-fit: cover;
`;

/*

Components specific to SignUp.js

*/

export const HeaderLabel = styled.label`
	color: #666;
	font-size: 17px;
	text-align: center;
	margin-bottom: 20px;
`;

export const ValidationIcon = styled.span`
	position: absolute;
	top: 65%;
	right: 10px;
	transform: translateY(-85%);
	color: ${props => (props.isValid ? "#138A3E" : "red")};
`;

// also specific to ResetPasswordPage.js
export const PasswordRules = styled.div`
	padding: 10px;
	border-radius: 4px;
	font-size: 12px;
	color: #666;
	position: relative;
	top: 0px;
	width: 300px;
`;

/*

Components specific to ProfilePage.js

*/

export const ButtonContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
	margin-top: 20px;
`;

export const ProfileImage = styled.img`
	width: 120px;
	height: 120px;
	border-radius: 60px;
	margin: 20px;
	display: block;
`;

export const ProfileField = styled.div`
	margin: 10px 0;
`;

export const ProfileLabel = styled.span`
	font-weight: bold;
`;

export const ProfileValue = styled.span`
	margin-left: 10px;
`;

/*

Components specific to ForgotPasswordPage.js

*/

export const HeaderContainer = styled.div`
	display: flex;
	align-items: center;
	gap: 20px;
	justify-content: flex-start; // Adjusted justify-content
`;

export const BackButton = styled.button`
	padding: 6px 12px;
	font-size: 14px;
	background-color: white;
	color: #999;
	border: none;
	margin: 0;
	margin-bottom: 60px;
	cursor: pointer;
	transition:
		background-color 0.3s,
		color 0.3s;
	outline: none; /* Remove default outline style */

	&:hover {
		color: #138a3e;
		background-color: white;
		border: none;
	}

	&:focus {
		color: #138a3e;
		box-shadow: 0 0 0 2px #138a3e;
		background-color: white;
		border: none;
	}
`;

export const Description = styled.p`
	color: #666;
	font-size: 14px;
	text-align: center;
	margin-bottom: 20px;
`;

/*

Components specific to ResetPasswordPage.js

*/

export const Rule = styled.div`
	display: flex;
	align-items: center;
	margin-bottom: 5px;
	font-size: 12px;
	color: ${props => (props.isValid ? "green" : "red")};
`;

/*

Components specific to MakeOfferPage.js

*/

export const OfferGroup = styled.div`
	position: relative;
	margin-bottom: 8px;
	width: 320px;
`;

export const OfferPrefix = styled.span`
	position: absolute;
	left: 10px;
	font-size: 50px;
	top: 50%;
	transform: translateY(-50%);
	pointer-events: none;
	color: black;
`;

export const Offer = styled.input`
	width: 100%;
	line-height: 50px;
	height: 80px;
	color: black;
	border: 1px solid #ddd;
	border-radius: 4px;
	box-sizing: border-box;
	font-size: 50px;
	transition:
		border 0.3s,
		box-shadow 0.3s;

	// Styles for when the input is focused
	&:focus {
		outline: none;
		border-color: #007b00;
		box-shadow: 0 0 8px rgba(0, 183, 0, 0.8);
	}
`;

export const MakeOfferButton = styled.button`
	padding: 8px;
	background-color: #14a44a;
	align-items: center; // Align items vertically
	justify-content: center; // Center content horizontally
	color: white;
	border: none;
	margin-top: 20px;
	margin-bottom: 20px;
	border-radius: 4px;
	cursor: pointer;
	width: 100%;
	transition:
		background-color 0.3s,
		box-shadow 0.3s; // Added box-shadow to the transition for a smooth effect

	&:hover {
		background-color: #138a3e; // Darker green on hover
		border-color: #138a3e;
		box-shadow: 0 0 8px rgba(0, 0, 0, 0.2); // Subtle shadow for depth, adjust as needed
	}

	&:focus,
	&:active {
		background-color: #14a44a; // Keep the original green color
		outline: none; // Removes the default focus outline
		border-color: #14a44a; // Ensures the border color stays consistent
		box-shadow: 0 0 0 2px rgba(22, 164, 74, 0.5); // Optional: Adds a custom focus glow
	}

	&:disabled {
		background-color: #8ccba1;
		cursor: not-allowed;
		border-color: transparent;
	}
`;
