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
        const uid = user.uid;
        getUserProfile(uid);
      }
    });
  }, [auth, database]);

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
    const userProfileRef = databaseRef(database, 'users/' + uid);
  
    if (userImage) {
      const userImageRef = storageRef(storage, `userImages/${uid}`);
      uploadBytes(userImageRef, userImage).then((snapshot) => {
        getDownloadURL(snapshot.ref).then((downloadURL) => {
          set(userProfileRef, {
            username: username,
            imageURL: downloadURL
          }).then(() => {
            alert("Profile updated successfully!");
            window.location.reload();  // Refresh the page
          }).catch((error) => {
            alert("Failed to update profile: " + error.message);
          });
          setUserImageURL(downloadURL);
        });
      });
    } else {
      set(userProfileRef, {
        username: username,
        imageURL: userImageURL || "https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg"
      }).then(() => {
        alert("Profile updated successfully!");
        window.location.reload();  // Refresh the page
      }).catch((error) => {
        alert("Failed to update profile: " + error.message);
      });
    }
  };

  return (
    <div className="profile-page">
      <Header/>
      <main>
        <div className="profile-container">
          <img src={userImageURL || "https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg"} alt="User Avatar" />
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
