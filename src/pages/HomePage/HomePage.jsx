import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, push, set, get } from 'firebase/database';
import firebaseApp from '../../configuration/firebase-config';
import './HomePage.css';
import Header from '../../components/Header/Header.jsx';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [replyTexts, setReplyTexts] = useState({});
  const db = getDatabase(firebaseApp);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formattedPosts = Object.entries(data).map(([key, value]) => ({
        id: key,
        ...value,
      }));
      setPosts(formattedPosts.reverse());
    });
  
    // Cleanup function
    return () => {
      unsubscribe(); // This is the correct way to unsubscribe
    };
  }, [db]);
  
  const handleCreatePost = async () => {
    const user = auth.currentUser;
    const postsRef = ref(db, 'posts');
    const newPostRef = push(postsRef);
  
    if (user) {
      const userRef = ref(db, `users/${user.uid}`);
      const userDataSnap = await get(userRef);
      const userData = userDataSnap.val();
  
      set(newPostRef, {
        ...newPost,
        username: userData?.username || 'Anonymous',
        userImageURL: userData?.imageURL || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',
        replies: [],
        userId: user.uid,
        thumbsUp: 0,
        thumbsDown: 0
      });
    } else {
      set(newPostRef, {
        ...newPost,
        username: 'Anonymous',
        userImageURL: 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',
        replies: [],
        thumbsUp: 0,
        thumbsDown: 0
      });
    }
    setNewPost({ title: '', content: '' });
  };
  
  
  const handleAddReply = async (postId, replyText) => {
    const user = auth.currentUser;
    const postRepliesRef = ref(db, `posts/${postId}/replies`);
    const newReplyRef = push(postRepliesRef);
  
    if (replyText.trim() && user) {
      const userRef = ref(db, `users/${user.uid}`);
      const userDataSnap = await get(userRef);
      const userData = userDataSnap.val();
  
      set(newReplyRef, {
        text: replyText,
        username: userData?.username || 'Anonymous',
        userImageURL: userData?.imageURL || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',
        userId: user.uid,
        thumbsUp: 0,
        thumbsDown: 0
      });
    } else {
      set(newReplyRef, {
        text: replyText.trim(),
        username: 'Anonymous',
        userImageURL: 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',
        thumbsUp: 0,
        thumbsDown: 0
      });
    }
    setReplyTexts({ ...replyTexts, [postId]: '' });
  };

  const handleThumbsUp = async (postId, isReply = false, replyId = null) => {
    if (!replyId && isReply) {
      console.error("No reply ID provided for thumbs up.");
      return;
    }
    const refPath = isReply ? `posts/${postId}/replies/${replyId}` : `posts/${postId}`;
    const postRef = ref(db, refPath);
    const snap = await get(postRef);
    const data = snap.val();
    
    if (data) {
      set(postRef, {
        ...data,
        thumbsUp: (data.thumbsUp || 0) + 1,
      });
    } else {
      console.log("Failed to find data at", refPath);
    }
  };
  
  const handleThumbsDown = async (postId, isReply = false, replyId = null) => {
    if (!replyId && isReply) {
      console.error("No reply ID provided for thumbs down.");
      return;
    }
    const refPath = isReply ? `posts/${postId}/replies/${replyId}` : `posts/${postId}`;
    const postRef = ref(db, refPath);
    const snap = await get(postRef);
    const data = snap.val();
    
    if (data) {
      set(postRef, {
        ...data,
        thumbsDown: (data.thumbsDown || 0) + 1,
      });
    } else {
      console.log("Failed to find data at", refPath);
    }
  };
  
  return (
    <div>
      <Header />
      <main className="create-post-container">
        <input
          id="postTitle"
          type="text"
          placeholder="Title"
          value={newPost.title}
          className="post-input"
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
        />
        <textarea
          id="postContent"
          placeholder="Content"
          className="post-input"
          value={newPost.content}
          onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
        ></textarea>
        <button className="new-post-button" onClick={handleCreatePost}>
          Create Post
        </button>
        {posts.map((post) => (
          <div className="post" key={post.id}>
            <div className="post-header">
              <img src={post.userImageURL || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'} alt={`${post.username || "Anonymous"}'s avatar`} className="post-avatar" />
              <span className="post-username">{post.username || "Anonymous"}</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <div>
              <button onClick={() => handleThumbsUp(post.id)}>👍 ({post.thumbsUp || 0})</button>
              <button onClick={() => handleThumbsDown(post.id)}>👎 ({post.thumbsDown || 0})</button>
            </div>
            <div className="replies">
              {post.replies && Object.entries(post.replies).map(([replyId, reply]) => (
                <div className="reply" key={replyId}>
                  <img src={reply.userImageURL || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'} alt={`${reply.username || "Anonymous"}'s avatar`} className="reply-avatar" />
                  <span className="reply-username">{reply.username || "Anonymous"}</span>
                  <p>{reply.text}</p>
                  <div>
                    <button onClick={() => handleThumbsUp(post.id, true, replyId)}>👍 ({reply.thumbsUp || 0})</button>
                    <button onClick={() => handleThumbsDown(post.id, true, replyId)}>👎 ({reply.thumbsDown || 0})</button>
                  </div>
                </div>
              ))}
              <div className="reply-input-container">
                <input
                  className="reply-input"
                  type="text"
                  placeholder="Write a reply..."
                  value={replyTexts[post.id] || ''}
                  onChange={(e) => setReplyTexts({ ...replyTexts, [post.id]: e.target.value })}
                />
                <button
                  className="reply-button"
                  onClick={() => handleAddReply(post.id, replyTexts[post.id] || '')}
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>
      <footer>
        <p>SJSU Collab © 2024</p>
      </footer>
    </div>
  );
  
  
};

export default HomePage;
