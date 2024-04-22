import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as databaseRef, set, get } from 'firebase/database';
import Header from '../../components/Header/Header.jsx';
import './ProfilePage.css';

function ProfilePage() {
  const [username, setUsername] = useState('');
  const [userImage, setUserImage] = useState(null);
  const [userImageURL, setUserImageURL] = useState('');
  const auth = getAuth();
  const storage = getStorage();
  const database = getDatabase();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, see docs for a list of available properties
        // https://firebase.google.com/docs/reference/js/firebase.User
        const uid = user.uid;
        // Fetch the username and image URL from the database
        getUserProfile(uid);
      } else {
        // User is signed out
      }
    });
  }, [auth, database]); // Dependencies array for the useEffect hook

  const getUserProfile = (uid) => {
    const userProfileRef = databaseRef(database, 'users/' + uid);
    get(userProfileRef).then((snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setUsername(data.username);
        setUserImageURL(data.imageURL);
      } else {
        console.log("No data available");
      }
    }).catch((error) => {
      console.error(error);
    });
  };

  const handleUsernameChange = (event) => {
    setUsername(event.target.value);
  };

  const handleImageChange = (event) => {
    if (event.target.files.length > 0) {
      setUserImage(event.target.files[0]);
    }
  };

  const handleSaveProfile = (event) => {
    event.preventDefault();
    const uid = auth.currentUser.uid;
    const userImageRef = storageRef(storage, `userImages/${uid}`);
    uploadBytes(userImageRef, userImage).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        const userProfileRef = databaseRef(database, 'users/' + uid);
        set(userProfileRef, {
          username: username,
          imageURL: downloadURL
        });
        setUserImageURL(downloadURL);
      });
    });
  };

  return (
    <div className="profile-page">
      <Header/>
      <main>
        <div className="profile-container">
          <img src={userImageURL || "https://via.placeholder.com/150"} alt="User Avatar" />
          <form onSubmit={handleSaveProfile}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={handleUsernameChange}
            />
        <div className="input-group">
          <label htmlFor="file-button" className="btn file-button-label">
            Profile Image: Choose File
            <input
              id="file-button"
              type="file"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </label>
        </div>
            <button type="submit">Save Profile</button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
