import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';  // Updated here
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { getDatabase, ref as databaseRef, get } from 'firebase/database';
import './Header.css';

const Header = () => {
  const [userProfileImage, setUserProfileImage] = useState('https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg');
  const auth = getAuth();
  const database = getDatabase();
  const navigate = useNavigate(); // Updated here

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        const userProfileRef = databaseRef(database, 'users/' + uid);
        get(userProfileRef).then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            setUserProfileImage(data.imageURL || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg');
          }
        }).catch((error) => {
          console.error(error);
        });
      }
    });
  }, [auth, database]);

  const handleSignOut = () => {
    signOut(auth).then(() => {
      navigate('/'); // Redirect to the sign-in page after sign-out using navigate
    }).catch((error) => {
      console.error('Sign out error:', error);
    });
  };

  return (
    <header>
      <img 
        id="homepageLogo" 
        src="https://upload.wikimedia.org/wikipedia/en/thumb/e/ec/San_Jose_State_Spartans_logo.svg/1200px-San_Jose_State_Spartans_logo.svg.png" 
        alt="SJSU Logo" 
      />
      <h1>SJSU COLLAB</h1>
      <div className="dropdown">
        <button className="dropbtn">
        <img
          id="profile-image"
          src={userProfileImage}
          alt="Profile"
          onError={(e) => { e.target.onerror = null; e.target.src = 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'; }}
        />
        </button>
        <div className="dropdown-content">
          <p><Link to="/profile">Profile</Link></p>
          <p><Link to="/home">Home</Link></p>
          <p id = "signOutButton" onClick={handleSignOut} style={{cursor: 'pointer'}}>Sign Out</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
