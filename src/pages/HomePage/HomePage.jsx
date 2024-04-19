import './HomePage.css';
import { useState, useEffect } from 'react';
import Header from '../../components/Header/Header.jsx';
import { getDatabase, ref, onValue, push, set } from 'firebase/database';
import firebaseApp from '../../configuration/firebase-config';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [replyTexts, setReplyTexts] = useState({}); // State to hold reply texts for each post

  // Reference to the posts in the database
  const db = getDatabase(firebaseApp);
  const postsRef = ref(db, 'posts');

  // Fetch posts on component mount
  useEffect(() => {
    // Subscribe to posts updates
    const unsubscribe = onValue(postsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const formattedPosts = Object.entries(data).map(([key, value]) => ({
        id: key,
        title: value.title,
        content: value.content,
        replies: value.replies || [],
      }));
      setPosts(formattedPosts);
      // Reset replyTexts for each post
      const initialReplyTexts = formattedPosts.reduce((acc, post) => {
        acc[post.id] = '';
        return acc;
      }, {});
      setReplyTexts(initialReplyTexts);
    });

    // Unsubscribe from updates on unmount
    return () => unsubscribe();
  }, []);

  const handleCreatePost = () => {
    const newPostRef = push(postsRef);
    set(newPostRef, { ...newPost, replies: [] });
    setNewPost({ title: '', content: '' });
  };

  const handleAddReply = (postId, replyText) => {
    if (replyText.trim()) {
      const postRepliesRef = ref(db, `posts/${postId}/replies`);
      const newReplyRef = push(postRepliesRef);
      set(newReplyRef, { text: replyText });
      // Reset the reply text field
      setReplyTexts({...replyTexts, [postId]: ''});
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
        Create a Post
      </button>

      {posts.map((post) => (
        <div className="post" key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.content}</p>
          <div className="replies">
            {post.replies && typeof post.replies === 'object'
              ? Object.values(post.replies).map((reply, index) => (
                  <div className="reply" key={index}>
                    {reply.text}
                  </div>
                ))
              : null}
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
                onClick={() => handleAddReply(post.id, replyTexts[post.id])}
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
