import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getDatabase, ref, onValue, push, set, get, remove } from 'firebase/database';
import firebaseApp from '../../configuration/firebase-config';
import './HomePage.css';
import Header from '../../components/Header/Header.jsx';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [replyTexts, setReplyTexts] = useState({});
  const [isOldestFirst, setIsOldestFirst] = useState(false);  // State to track sorting order
  const db = getDatabase(firebaseApp);
  const auth = getAuth(firebaseApp);

  useEffect(() => {
    const postsRef = ref(db, 'posts');
    const unsubscribe = onValue(postsRef, async (snapshot) => {
      const data = snapshot.val() || {};
      let formattedPosts = await Promise.all(Object.entries(data).map(async ([key, value]) => {
        const userRef = ref(db, `users/${value.userId}`);
        const userDataSnap = await get(userRef);
        const userData = userDataSnap.val();
  
        let replies = value.replies || {};
        const formattedReplies = await Promise.all(Object.entries(replies).map(async ([replyKey, replyValue]) => {
          const replyUserRef = ref(db, `users/${replyValue.userId}`);
          const replyUserDataSnap = await get(replyUserRef);
          const replyUserData = replyUserDataSnap.val();
  
          return {
            id: replyKey,
            ...replyValue,
            username: replyUserData?.username || 'Anonymous',  // Fetch username dynamically for replies
            userImageURL: replyUserData?.imageURL || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',
          };
        }));
  
        return {
          id: key,
          ...value,
          username: userData?.username || 'Anonymous',  // Fetch username dynamically for posts
          userImageURL: userData?.imageURL || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',
          replies: formattedReplies.reduce((acc, curr) => ({...acc, [curr.id]: curr}), {}),
        };
      }));
  
      if (!isOldestFirst) {
        formattedPosts = formattedPosts.reverse();
      }
      setPosts(formattedPosts);
    });
  
    return () => {
      unsubscribe();
    };
  }, [db, isOldestFirst]);
  
  
  const handleCreatePost = async () => {
    const user = auth.currentUser;
    const postsRef = ref(db, 'posts');
    const newPostRef = push(postsRef);
    const timestamp = Date.now();

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
        thumbsDown: 0,
        votes: {},
        timestamp
      });

    } else {
      set(newPostRef, {
        ...newPost,
        username: 'Anonymous',
        userImageURL: 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg',
        replies: [],
        thumbsUp: 0,
        thumbsDown: 0,
        timestamp
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

  const handleVote = async (postId, isReply = false, replyId = null, voteType = 'up') => {
    if (!replyId && isReply) {
      console.error("No reply ID provided for voting.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Please log in to vote.");
      return;
    }

    const refPath = isReply ? `posts/${postId}/replies/${replyId}` : `posts/${postId}`;
    const postRef = ref(db, refPath);
    const snap = await get(postRef);
    const data = snap.val();

    if (data) {
      const currentVotes = data.votes || {};
      const userVote = currentVotes[user.uid];

      if (userVote === voteType) {
        // Toggle off
        delete currentVotes[user.uid];
      } else {
        // Add or switch vote
        currentVotes[user.uid] = voteType;
      }

      const thumbsUpCount = Object.values(currentVotes).filter(vote => vote === 'up').length;
      const thumbsDownCount = Object.values(currentVotes).filter(vote => vote === 'down').length;

      set(postRef, {
        ...data,
        votes: currentVotes,
        thumbsUp: thumbsUpCount,
        thumbsDown: thumbsDownCount,
      });
    } else {
      console.log("Failed to find data at", refPath);
    }
  };

  const handleDeletePost = async (postId) => {
    const postRef = ref(db, `posts/${postId}`);
    try {
      await remove(postRef);
      console.log('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handleDeleteReply = async (postId, replyId) => {
    const replyRef = ref(db, `posts/${postId}/replies/${replyId}`);
    try {
      await remove(replyRef);
      console.log('Reply deleted successfully');
    } catch (error) {
      console.error('Error deleting reply:', error);
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
        <button className="sort-button" onClick={() => setIsOldestFirst(!isOldestFirst)}>
          {isOldestFirst ? 'Sort: Latest to Oldest' : 'Sort: Oldest to Latest'}
        </button>
        {posts.map((post) => (
          <div className="post" key={post.id}>
            <div className="post-header">
              <img src={post.userImageURL || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'} alt={`${post.username || "Anonymous"}'s avatar`} className="post-avatar" />
              <span className="post-username">{post.username || "Anonymous"}</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <div className="vote-and-delete">
              <div>
                <button className="post-thumbs" onClick={() => handleVote(post.id, false, null, 'up')}>👍 ({post.thumbsUp || 0})</button>
                <button className="post-thumbs" onClick={() => handleVote(post.id, false, null, 'down')}>👎 ({post.thumbsDown || 0})</button>
              </div>
              <div>
                {post.userId === auth.currentUser?.uid && (
                  <button className="delete-button" onClick={() => handleDeletePost(post.id)}>
                    Delete Post
                  </button>
                )}
              </div>
            </div>
            <div className="replies">
              {post.replies && Object.entries(post.replies).map(([replyId, reply]) => (
                <div className="reply" key={replyId}>
                  <img src={reply.userImageURL || 'https://static.vecteezy.com/system/resources/previews/009/292/244/original/default-avatar-icon-of-social-media-user-vector.jpg'} alt={`${reply.username || "Anonymous"}'s avatar`} className="reply-avatar" />
                  <span className="reply-username">{reply.username || "Anonymous"}</span>
                  <p id="reply-content">{reply.text}</p>
                  <div className="vote-and-delete">
                    <div>
                      <button className="reply-thumbs" onClick={() => handleVote(post.id, true, replyId, 'up')}>👍 ({reply.thumbsUp || 0})</button>
                      <button className="reply-thumbs" onClick={() => handleVote(post.id, true, replyId, 'down')}>👎 ({reply.thumbsDown || 0})</button>
                    </div>
                    <div>
                      {reply.userId === auth.currentUser?.uid && (
                        <button className="delete-button" onClick={() => handleDeleteReply(post.id, replyId)}>
                          Delete Reply
                        </button>
                      )}
                    </div>
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
