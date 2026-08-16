import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useLocation, Link } from 'react-router-dom';

interface Comment {
  author: string;
  avatar: string;
  text: string;
  time: string;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  major: string;
  time: string;
  tag: string;
  badgeStyle?: string;
  content: string;
  image?: string;
  likes: number;
  liked: boolean;
  commentsCount: number;
  comments: Comment[];
  showComments: boolean;
  isHotTake?: boolean;
  isUpvoteStyle?: boolean;
}

type PostMode = 'gossip' | 'meme' | 'question' | 'photo';

export default function HomeFeed() {
  const location = useLocation();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [posts, setPosts] = useState<Post[]>([
    {
      id: '1',
      author: 'Rohan Sharma',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCb3houXNWLXON9IYsFB6QtYiXNkHjkCtZgQjOfjW8uLVF4Niwp4i7FQSGDFqiwQDy1SkJ6wnl_KaZQeyVIYEIgWzgtdCIO3KRubQofQHdYTiH9bmT1DUkBT1ZSo7i9Wt3hi1_eZgwdtWaDjLD9B5pcZR6pyNtfXLSZ4AWjzxIQr0jnA_oT-e2o7-7jCcd7Zw5dPOTeCYIsbxld6cDb_0KCm5j74eLxB3nZU9DCBmesWH40C4rYiT0O',
      major: 'Mechanical',
      time: '15m ago',
      tag: 'Memes',
      content: 'Me trying to explain to the professor why my code works on my machine but not on the server during the demo. 🤡',
      image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80',
      likes: 412,
      liked: false,
      commentsCount: 2,
      showComments: false,
      comments: [
        {
          author: 'Vikram A.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUXnEH6lKCl6QUFpBOnBCol61TGevdyhB3nbEyqlVaTugoGuGMl303b0fVqFJjhFfu63S_go__AvgbdT-it_fE-1hAV6bz1rrpLB4XbSx4WM9HoFTPDfVm21YfLOFdHN4y9pCRTgbpjaLzL37L0T4ZqalyT2HVDOGxH6LlhGG3KJ6Z8TY-jHonoYZRYiOfmqIASAvp_7nh_vauzHupg6jruXquZTVbYZWfSYINwK_pw1uFDfJnXYBd',
          text: 'Classic student experience, bro! 💀',
          time: '10m ago'
        },
        {
          author: 'Meera K.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8jjI1mgvdtQOgIgy4ITgY16uTSuVwJUFqw6uAVSoyc8WzDlrOC394updzRMMNiVQONA6osROpzMCkkJ0s9TMJaRdRAKZkzoFq8JzgZ_MV1XaS3ZRf_MFSownVoSke29bQ2azYT4xjTzSJY4JGSDWNGchV-hXFrruhzDo9nB9H2hLrisDgun6d4BlWdLotnZMbLZYEZSqhuYGbO4pTsIPmpPcJ4SpA6FodGiyBNSb6GEQWoFfSIuMR',
          text: 'Should have containerized it with Docker!',
          time: '5m ago'
        }
      ]
    },
    {
      id: '2',
      author: 'Ishaan V.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZjNqDwbJvLnKjZxoSz-wKHamiapQLn9xPtLOSCp4wip0ONfOW6wZlhtFaYuDzZbAVS9u-MeP8V1hmGAdb_3zPjyZfowLnjzcBSgPW0BivhvPSF0CaFZ1jnVxs68ErehpeEuaCRKExDy05rwSR2gFNX4TWcXB5Qt1Kie458MCMsUO1WMJM8HXawjBPx70XXtbW8oJdQbqvi3gqeqAw288InId1KEdNKWuXWWM509tck4EAgHvazddm',
      major: 'CS',
      time: '1h ago',
      tag: 'Ask Help',
      badgeStyle: 'bg-secondary-container text-on-secondary-container px-sm py-xs rounded-full text-label-sm flex items-center gap-xs',
      content: 'Bhai ye professor ka assignment samajh aaya? The logic for the third question seems impossible. Anyone figured it out? #AssignmentHelp',
      likes: 24,
      liked: false,
      isUpvoteStyle: true,
      commentsCount: 1,
      showComments: false,
      comments: [
        {
          author: 'Dev S.',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkW0-Q-qSQJaUSxnkuhLJGehGfFkZ9-JOsOic33tWYOfZMTgkYAvx4LIj2OSM0ztDn6yJSjc2G2DG7ZdyFlTly-9WQPa9Qr6-Hg_RErCdMbudMDKfcGdA0RDtvCjU8eg4y3mBqmow1_-a8HqrAwnygiE4BtEwop_5YgfGeN7S8zZ0l_sE_ONmcJSwfol8hkREiuSJg_TuW-KK9uAAFAsLUhZC32SFrKSFop69kioUWXBfVeKSYNXBe',
          text: 'I am stuck on it too, let me know if you get it!',
          time: '30m ago'
        }
      ]
    },
    {
      id: '3',
      author: 'Ananya K.',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8jjI1mgvdtQOgIgy4ITgY16uTSuVwJUFqw6uAVSoyc8WzDlrOC394updzRMMNiVQONA6osROpzMCkkJ0s9TMJaRdRAKZkzoFq8JzgZ_MV1XaS3ZRf_MFSownVoSke29bQ2azYT4xjTzSJY4JGSDWNGchV-hXFrruhzDo9nB9H2hLrisDgun6d4BlWdLotnZMbLZYEZSqhuYGbO4pTsIPmpPcJ4SpA6FodGiyBNSb6GEQWoFfSIuMR',
      major: 'Arts',
      time: '3h ago',
      tag: 'Hot Takes',
      content: "Hot Take: The canteen's coffee is actually just hot bean water. Change my mind. ☕️💀",
      likes: 1200,
      liked: true,
      isHotTake: true,
      commentsCount: 245,
      showComments: false,
      comments: []
    }
  ]);

  const [activeFilter, setActiveFilter] = useState('All');
  const [newPostText, setNewPostText] = useState('');
  const [postMode, setPostMode] = useState<PostMode>('gossip');
  const [attachedImage, setAttachedImage] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (location.hash === '#create-post' && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [location]);

  // Adjust properties when mode changes
  const getPlaceholder = () => {
    switch (postMode) {
      case 'meme':
        return "Share a funny meme or link...";
      case 'question':
        return "What is your question or problem?";
      case 'photo':
        return "Describe the photo you are sharing...";
      default:
        return "What's on your mind, Alex?";
    }
  };

  const handleCreatePost = (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!newPostText.trim() && !attachedImage) return;

    let tag = 'Campus Gossip';
    if (postMode === 'meme') tag = 'Memes';
    else if (postMode === 'question') tag = 'Ask Help';
    else if (postMode === 'photo') tag = 'Photos';

    const newPost: Post = {
      id: Date.now().toString(),
      author: 'Alex (You)',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALGkZg4umnZu-tLOdOYdz0Vnj_OQIO0WmriQJX0_RE30b2Y4w--HOkOne1Y1BmYb3ihB2ex_VUfC0uiboeT3w4POkPSKt3FRyzPQmvGv7ZDPohfY6-KmdOv01SmAeZTvw2vowFicPX7KG_RnaFOhlQEOdu8ArQUo7SUNZGSiX0CsDimvZRnhOkEyJUSZl2Ol5TjPXtrAqbB7Ja_InLmdqZ9j8D3OonDOzHTNLO-8Y5pAdykQ0WGs2z',
      major: 'CS & Engineering',
      time: 'Just now',
      tag: tag,
      content: newPostText,
      image: attachedImage ? attachedImage : undefined,
      likes: 0,
      liked: false,
      commentsCount: 0,
      showComments: false,
      comments: []
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');
    setAttachedImage('');
    setPostMode('gossip');
  };

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === id) {
        return {
          ...post,
          liked: !post.liked,
          likes: post.liked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleToggleComments = (id: string) => {
    setPosts(prev => prev.map(post => post.id === id ? { ...post, showComments: !post.showComments } : post));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          commentsCount: post.commentsCount + 1,
          comments: [
            ...post.comments,
            {
              author: 'Alex (You)',
              avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALGkZg4umnZu-tLOdOYdz0Vnj_OQIO0WmriQJX0_RE30b2Y4w--HOkOne1Y1BmYb3ihB2ex_VUfC0uiboeT3w4POkPSKt3FRyzPQmvGv7ZDPohfY6-KmdOv01SmAeZTvw2vowFicPX7KG_RnaFOhlQEOdu8ArQUo7SUNZGSiX0CsDimvZRnhOkEyJUSZl2Ol5TjPXtrAqbB7Ja_InLmdqZ9j8D3OonDOzHTNLO-8Y5pAdykQ0WGs2z',
              text: text,
              time: 'Just now'
            }
          ]
        };
      }
      return post;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
  };

  const togglePostMode = (mode: PostMode) => {
    setPostMode(current => current === mode ? 'gossip' : mode);
    setAttachedImage('');
  };

  const filteredPosts = activeFilter === 'All' 
    ? posts 
    : posts.filter(post => post.tag.toLowerCase().includes(activeFilter.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, '').trim().toLowerCase()));

  return (
    <div className="flex justify-center p-margin-mobile md:p-margin-desktop gap-xl w-full">
      <div className="w-full max-w-2xl flex flex-col gap-xl">
        
        {/* Create Post Card */}
        <form onSubmit={handleCreatePost} className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col gap-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-container/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
          <div className="flex gap-md items-start">
            <img className="w-12 h-12 rounded-full object-cover border border-outline-variant shrink-0" alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALGkZg4umnZu-tLOdOYdz0Vnj_OQIO0WmriQJX0_RE30b2Y4w--HOkOne1Y1BmYb3ihB2ex_VUfC0uiboeT3w4POkPSKt3FRyzPQmvGv7ZDPohfY6-KmdOv01SmAeZTvw2vowFicPX7KG_RnaFOhlQEOdu8ArQUo7SUNZGSiX0CsDimvZRnhOkEyJUSZl2Ol5TjPXtrAqbB7Ja_InLmdqZ9j8D3OonDOzHTNLO-8Y5pAdykQ0WGs2z" />
            <div className="flex-1 flex flex-col gap-sm">
              <input 
                ref={inputRef}
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                className="w-full bg-transparent border-none text-body-lg text-on-surface placeholder:text-on-surface-variant focus:ring-0 p-0 focus:outline-none" 
                placeholder={getPlaceholder()} 
                type="text" 
              />
              
              {/* Show Image Link input if in photo or meme mode */}
              {(postMode === 'photo' || postMode === 'meme') && (
                <div className="flex flex-col gap-xs mt-xs">
                  <div className="flex gap-xs items-center">
                    <input 
                      type="text" 
                      placeholder="Paste image URL here..." 
                      value={attachedImage} 
                      onChange={(e) => setAttachedImage(e.target.value)} 
                      className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-md py-xs text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                    />
                    <button 
                      type="button"
                      onClick={() => setAttachedImage('https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80')}
                      className="text-primary text-label-sm font-semibold hover:underline shrink-0 bg-surface-container-high px-sm py-xs rounded-lg"
                    >
                      Sample Image
                    </button>
                  </div>
                  {attachedImage && (
                    <div className="relative w-28 h-20 rounded overflow-hidden border border-outline-variant mt-xs">
                      <img src={attachedImage} className="w-full h-full object-cover" alt="Attached preview" />
                      <button 
                        type="button" 
                        onClick={() => setAttachedImage('')}
                        className="absolute top-1 right-1 bg-background/80 hover:bg-background text-on-surface rounded-full p-[2px] flex items-center justify-center"
                      >
                        <span className="material-symbols-outlined text-xs">close</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-sm border-t border-outline-variant/50">
            <div className="flex gap-sm text-on-surface-variant">
              {/* Post Meme Button */}
              <button 
                type="button" 
                onClick={() => togglePostMode('meme')}
                className={`flex items-center gap-xs px-sm py-xs rounded-full transition-colors text-label-sm cursor-pointer ${postMode === 'meme' ? 'bg-[#C85C68]/20 text-[#ffb2b9] border border-[#C85C68]/30 font-bold' : 'hover:bg-surface-container-high hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[20px]">mood</span>
                <span className="hidden sm:inline">Post Meme</span>
              </button>

              {/* Ask Question Button */}
              <button 
                type="button" 
                onClick={() => togglePostMode('question')}
                className={`flex items-center gap-xs px-sm py-xs rounded-full transition-colors text-label-sm cursor-pointer ${postMode === 'question' ? 'bg-[#C85C68]/20 text-[#ffb2b9] border border-[#C85C68]/30 font-bold' : 'hover:bg-surface-container-high hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[20px]">quiz</span>
                <span className="hidden sm:inline">Ask Question</span>
              </button>

              {/* Share Photo Button */}
              <button 
                type="button" 
                onClick={() => togglePostMode('photo')}
                className={`flex items-center gap-xs px-sm py-xs rounded-full transition-colors text-label-sm cursor-pointer ${postMode === 'photo' ? 'bg-[#C85C68]/20 text-[#ffb2b9] border border-[#C85C68]/30 font-bold' : 'hover:bg-surface-container-high hover:text-primary'}`}
              >
                <span className="material-symbols-outlined text-[20px]">photo_camera</span>
                <span className="hidden sm:inline">Share Photo</span>
              </button>
            </div>
            <button type="submit" className="bg-primary-container text-on-primary-container px-lg py-xs rounded-full font-label-md hover:bg-primary hover:text-on-primary transition-all glow-accent cursor-pointer">Post</button>
          </div>
        </form>

        {/* Filters Scrollable list */}
        <div className="flex items-center gap-sm overflow-x-auto scrollbar-hide pb-sm mb-xs">
          {[
            { label: 'All', emoji: '' },
            { label: 'Memes', emoji: '😂' },
            { label: 'Hot Takes', emoji: '🔥' },
            { label: 'Ask Help', emoji: '❓' },
            { label: 'Team Finding', emoji: '🤝' },
            { label: 'Campus Gossip', emoji: '🏫' },
            { label: 'Projects', emoji: '🧑‍💻' },
            { label: 'Photos', emoji: '📸' },
            { label: 'Careers', emoji: '🎓' }
          ].map((filter) => (
            <button 
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              className={`whitespace-nowrap px-lg py-xs rounded-full font-label-md border transition-all active:scale-95 cursor-pointer ${
                activeFilter === filter.label 
                  ? 'bg-primary-container text-on-primary-container border-primary/30' 
                  : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-highest hover:text-on-surface'
              }`}
            >
              {filter.emoji ? `${filter.emoji} ` : ''}{filter.label}
            </button>
          ))}
        </div>

        {/* Posts Feed list */}
        <div className="flex flex-col gap-lg">
          {filteredPosts.map((post) => (
            <article 
              key={post.id} 
              className={`bg-surface border border-outline-variant rounded-xl p-md flex flex-col gap-md transition-all duration-300 ${post.isHotTake ? 'glow-accent' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-sm items-center">
                  <img className="w-10 h-10 rounded-full object-cover border border-outline-variant shrink-0" src={post.avatar} alt="Avatar" />
                  <div>
                    <h3 className="font-label-md text-on-surface">{post.author}</h3>
                    <p className="font-label-sm text-on-surface-variant">{post.major} • {post.time}</p>
                  </div>
                </div>
                {post.badgeStyle ? (
                  <span className={post.badgeStyle}>
                    <span className="material-symbols-outlined text-[14px]">help</span> Helpful
                  </span>
                ) : (
                  <span className="bg-primary/20 text-primary px-sm py-xs rounded-full text-label-sm border border-primary/30">
                    #{post.tag.replace(/\s+/g, '')}
                  </span>
                )}
              </div>
              
              <div className="font-body-md text-on-surface">
                <p>{post.content}</p>
              </div>

              {post.image && (
                <div className="rounded-lg overflow-hidden border border-outline-variant/50 max-h-96 w-full bg-surface-container-low flex items-center justify-center">
                  <img src={post.image} className="w-full h-full object-cover" alt="Post attachment" />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-lg pt-sm border-t border-outline-variant/50 text-on-surface-variant text-label-sm">
                <button 
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center gap-xs transition-colors group cursor-pointer ${post.liked ? 'text-primary' : 'hover:text-primary'}`}
                >
                  {post.isHotTake ? (
                    <span className="material-symbols-outlined" style={{ fontVariationSettings: post.liked ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                  ) : post.isUpvoteStyle ? (
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">keyboard_arrow_up</span>
                  ) : (
                    <span className="material-symbols-outlined group-hover:scale-110 transition-transform">thumb_up</span>
                  )}
                  {post.likes}
                </button>
                <button 
                  onClick={() => handleToggleComments(post.id)}
                  className="flex items-center gap-xs hover:text-primary transition-colors group cursor-pointer"
                >
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">chat_bubble</span>
                  {post.commentsCount}
                </button>
                <button className="flex items-center gap-xs hover:text-primary transition-colors group ml-auto cursor-pointer">
                  <span className="material-symbols-outlined group-hover:scale-110 transition-transform">share</span>
                </button>
              </div>

              {/* Comments Section */}
              {post.showComments && (
                <div className="border-t border-outline-variant/30 pt-md mt-sm flex flex-col gap-sm">
                  {post.comments.map((comment, idx) => (
                    <div key={idx} className="flex gap-sm items-start bg-surface-container-low/50 p-sm rounded-lg border border-outline-variant/20">
                      <img className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0" src={comment.avatar} alt="Avatar" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-xs">
                          <span className="font-label-sm text-on-surface font-semibold">{comment.author}</span>
                          <span className="text-[10px] text-on-surface-variant">{comment.time}</span>
                        </div>
                        <p className="text-body-sm text-on-surface-variant leading-relaxed">{comment.text}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add Comment Input */}
                  <div className="flex gap-sm items-center mt-xs">
                    <img className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuALGkZg4umnZu-tLOdOYdz0Vnj_OQIO0WmriQJX0_RE30b2Y4w--HOkOne1Y1BmYb3ihB2ex_VUfC0uiboeT3w4POkPSKt3FRyzPQmvGv7ZDPohfY6-KmdOv01SmAeZTvw2vowFicPX7KG_RnaFOhlQEOdu8ArQUo7SUNZGSiX0CsDimvZRnhOkEyJUSZl2Ol5TjPXtrAqbB7Ja_InLmdqZ9j8D3OonDOzHTNLO-8Y5pAdykQ0WGs2z" alt="Your Avatar" />
                    <div className="flex-1 flex gap-sm">
                      <input 
                        type="text" 
                        placeholder="Add a comment..."
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-md py-xs text-body-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container"
                      />
                      <button 
                        onClick={() => handleAddComment(post.id)}
                        className="bg-primary-container text-on-primary-container px-md py-xs rounded-lg font-label-sm hover:bg-primary hover:text-on-primary transition-colors cursor-pointer"
                      >
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* Right Sidebar */}
      <aside className="hidden lg:flex w-80 flex-col gap-lg sticky top-margin-desktop h-[calc(100vh-80px)]">
        <div className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col gap-md">
          <div className="flex items-center justify-between border-b border-outline-variant/50 pb-sm">
            <h2 className="font-headline-sm font-bold flex items-center gap-xs text-on-surface">
              <span className="material-symbols-outlined text-primary">rocket_launch</span>
              Project Showcase
            </h2>
          </div>
          <div className="flex flex-col gap-md">
            <Link to="/work" className="group cursor-pointer block">
              <div className="h-32 w-full rounded-lg overflow-hidden border border-outline-variant relative mb-sm">
                <div className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDykJBbCuDCi0HfrIPBD3b4Zghpx020J_6J-cloA8yZcCemduq_nt3xH_FCqRaP-N7QX7ALY2OO5VqUEuaegsNWRsTEUudZdNGoDOxUhSMVeTn86sOX4uA6qXPpeUO20Yg7_QZhaolvIwjmwdY0ftd7y5-oJkzyu1SfRl4UUC48JWB8Shb4N-aJV7j2T72i2qtA_6V7OfH2avsXIf7LUw0cLUcCiR6xrg3SnAxbWUMwKFhawM6-93ER")' }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end p-sm">
                  <span className="bg-primary-container text-on-primary-container text-[10px] font-bold px-xs py-[2px] rounded uppercase tracking-wider">Trending</span>
                </div>
              </div>
              <h3 className="font-label-md text-on-surface group-hover:text-primary transition-colors">Smart Mirror UI Framework</h3>
              <p className="font-body-sm text-on-surface-variant line-clamp-2 mt-xs">An open-source React framework for building personal smart mirror interfaces. Currently looking for contributors!</p>
              <div className="flex items-center gap-xs mt-sm">
                <div className="flex -space-x-2">
                  <img className="w-6 h-6 rounded-full border-2 border-surface shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBkW0-Q-qSQJaUSxnkuhLJGehGfFkZ9-JOsOic33tWYOfZMTgkYAvx4LIj2OSM0ztDn6yJSjc2G2DG7ZdyFlTly-9WQPa9Qr6-Hg_RErCdMbudMDKfcGdA0RDtvCjU8eg4y3mBqmow1_-a8HqrAwnygiE4BtEwop_5YgfGeN7S8zZ0l_sE_ONmcJSwfol8hkREiuSJg_TuW-KK9uAAFAsLUhZC32SFrKSFop69kioUWXBfVeKSYNXBe" alt="Avatar" />
                  <img className="w-6 h-6 rounded-full border-2 border-surface shrink-0" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUXnEH6lKCl6QUFpBOnBCol61TGevdyhB3nbEyqlVaTugoGuGMl303b0fVqFJjhFfu63S_go__AvgbdT-it_fE-1hAV6bz1rrpLB4XbSx4WM9HoFTPDfVm21YfLOFdHN4y9pCRTgbpjaLzL37L0T4ZqalyT2HVDOGxH6LlhGG3KJ6Z8TY-jHonoYZRYiOfmqIASAvp_7nh_vauzHupg6jruXquZTVbYZWfSYINwK_pw1uFDfJnXYBd" alt="Avatar" />
                </div>
                <span className="text-[12px] text-on-surface-variant ml-xs">By David & 2 others</span>
              </div>
            </Link>
            <hr className="border-outline-variant/30" />
            <Link to="/work" className="group cursor-pointer block">
              <h3 className="font-label-md text-on-surface group-hover:text-primary transition-colors flex justify-between items-center">
                AI Study Buddy
                <span className="material-symbols-outlined text-[16px] text-on-surface-variant group-hover:text-primary">arrow_forward</span>
              </h3>
              <p className="font-body-sm text-on-surface-variant line-clamp-2 mt-xs">A fine-tuned LLM that helps quiz you on your specific lecture notes. Built by the NLP study group.</p>
              <div className="mt-sm flex gap-xs flex-wrap">
                <span className="bg-surface-container-high text-on-surface-variant px-xs py-[2px] rounded text-[10px] border border-outline-variant/30">Python</span>
                <span className="bg-surface-container-high text-on-surface-variant px-xs py-[2px] rounded text-[10px] border border-outline-variant/30">AI</span>
              </div>
            </Link>
          </div>
          <Link to="/work">
            <button className="w-full py-sm border border-outline-variant rounded-lg text-label-md text-on-surface hover:bg-surface-container-high transition-colors mt-xs cursor-pointer">
              View All Projects
            </button>
          </Link>
        </div>
        
        {/* Trending Discussions */}
        <div className="bg-surface border border-outline-variant rounded-xl p-md flex flex-col gap-md">
          <div className="flex items-center justify-between border-b border-outline-variant/50 pb-sm">
            <h2 className="font-headline-sm font-bold flex items-center gap-xs text-on-surface">
              <span className="material-symbols-outlined text-primary">trending_up</span> Trending Discussions
            </h2>
          </div>
          <div className="flex flex-col gap-sm">
            <a href="#" className="group">
              <p className="text-label-md text-on-surface group-hover:text-primary transition-colors">#CampusGossip: The library ghost?</p>
              <p className="text-label-sm text-on-surface-variant">1.2k students talking</p>
            </a>
            <a href="#" className="group">
              <p className="text-label-md text-on-surface group-hover:text-primary transition-colors">#HackathonVibes: Team formation</p>
              <p className="text-label-sm text-on-surface-variant">856 students talking</p>
            </a>
            <a href="#" className="group">
              <p className="text-label-md text-on-surface group-hover:text-primary transition-colors">#AssignmentHelp: Math 101</p>
              <p className="text-label-sm text-on-surface-variant">432 students talking</p>
            </a>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-md gap-y-sm text-label-sm text-on-surface-variant/70 px-sm">
          <a className="hover:text-primary transition-colors" href="#">Privacy</a>
          <a className="hover:text-primary transition-colors" href="#">Terms</a>
          <a className="hover:text-primary transition-colors" href="#">Guidelines</a>
          <a className="hover:text-primary transition-colors" href="#">Contact</a>
          <span className="w-full mt-xs">© 2026 TRYBEE Inc.</span>
        </div>
      </aside>
    </div>
  );
}
