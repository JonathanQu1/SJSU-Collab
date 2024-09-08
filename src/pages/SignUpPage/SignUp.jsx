import { useState } from 'react';
import { Link } from 'react-router-dom'; // Import the Link component
import './SignUp.css'; // Make sure the path is correct based on where you place your CSS file
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.endsWith("@sjsu.edu")) {
      alert("Error signing up: email must end with @sjsu.edu");
      return; // Prevent the sign up process if the email does not match the SJSU domain
    }
    
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // User created successfully
        const user = userCredential.user;
        console.log('Account created:', user);
        
        // Send email verification
        sendEmailVerification(user)
          .then(() => {
            alert('Account created! Please verify your email before logging in.');
            // Optional: you can redirect the user to a "check your email" page or a login page
            navigate('/');
          })
          .catch((error) => {
            console.error('Error sending email verification:', error);
            alert('Error sending verification email. Please try again.');
          });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Error signing up:', errorCode, errorMessage);
        alert('Error signing up: ' + errorCode);
      });
  };

  return (
    <div className="signup-page">
      <img
        src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ec/San_Jose_State_Spartans_logo.svg/1200px-San_Jose_State_Spartans_logo.svg.png"
        alt="San Jose State Spartans Logo"
        className="signup-logo"
      />
      <div className="signup-container">
        <form onSubmit={handleSubmit} className="signup-form">
          <h2>CREATE AN ACCOUNT</h2>
          <p>Create an account to access all the features for free!</p>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Create Account</button>
          <p>
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUp;
