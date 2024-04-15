import { useState } from 'react';
import { Link } from 'react-router-dom'; // Import the Link component
import './SignUp.css'; // Make sure the path is correct based on where you place your CSS file
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';



function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.endsWith("@sjsu.edu")) {
      alert("Error signing up: Email must end with @sjsu.edu");
      // Here you can set an error message in your state and show it to the user
      return; // Prevent the sign up process
    }
    
    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        console.log('Account created:', user);
        alert('Account successfully created! You will be redirected to login.');
        navigate('/login'); // Redirect the user after success

        // You can redirect the user to the home page or show a success message
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // Handle Errors here.
        console.error('Error signing up:', errorCode, errorMessage);
        alert('Error signing up: ' + errorCode)
        // You can show the error message to the user
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
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
export default SignUp;