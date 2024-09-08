import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import './LoginPage.css';
import groupworkLogo from '../../assets/groupworkLogo.png';

function LoginPage() {
  const navigate = useNavigate(); // Hook to navigate to other routes
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (event) => {
    event.preventDefault();

    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;

        if (user.emailVerified) {
          // If email is verified, allow user to proceed
          console.log('Logged in:', user);
          navigate('/home'); // Redirect the user to the homepage
        } else {
          // If email is not verified, show an alert
          alert('Please verify your email before logging in.');
        }
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error('Error signing in:', errorCode, errorMessage);
        alert("Username or password is incorrect, please try again!");
      });
  };

  return (
    <div className="container">
      <div className="login-form">
        <img className="sjsu_logo" src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ec/San_Jose_State_Spartans_logo.svg/1200px-San_Jose_State_Spartans_logo.svg.png" alt="SJSU Logo" />
        <h2>Welcome Back!</h2>
        <p>Discover a space where diverse talents merge seamlessly. Get started for free.</p>
        <form id="loginForm" onSubmit={handleLogin}>
          <input type="email" id="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" id="submit">Login</button>
        </form>
        <p>Not a member? <Link to="/signup">Register Now</Link></p>
      </div>
      <div className="welcome-back">
        <h1>Spartan Collab</h1>
        <p>Where Talents Merge, Projects Emerge.</p>
        <img className="login_logo" src={groupworkLogo} alt="Collab Logo" />
      </div>
    </div>
  );
}

export default LoginPage;
