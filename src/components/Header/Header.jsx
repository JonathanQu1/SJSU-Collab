import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase, ref as databaseRef, get } from 'firebase/database';
import './Header.css';

const Header = () => {
  const [userProfileImage, setUserProfileImage] = useState('https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg');
  const auth = getAuth();
  const database = getDatabase();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        const uid = user.uid;
        // Fetch the user's profile image URL from the database
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
          <p><Link to="/">Sign Out</Link></p>
        </div>
      </div>
    </header>
  );
};

export default Header;
