import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "../App";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { Loader2, ArrowLeft, Tag, Sparkles } from "lucide-react";

export default function TagPosts() {
  const { tag } = useParams();
  const decodedTag = decodeURIComponent(tag);
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API}/posts?tag=${encodeURIComponent(decodedTag)}&limit=50`);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [decodedTag]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 page-enter" data-testid="tag-page">
        {/* Header */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-primary transition-colors group"
          data-testid="back-link"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-[hsl(190,100%,60%)]/20 flex items-center justify-center">
            <Tag className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              #{decodedTag}
            </h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              {posts.length} {posts.length === 1 ? "post" : "posts"} tagged
            </p>
          </div>
        </div>

        {/* Posts */}
        <div className="mt-10">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20 cozy-card">
              <div className="text-6xl mb-4">🏷️</div>
              <p className="text-xl text-muted-foreground">
                No posts with this tag
              </p>
            </div>
          ) : (
            <div className="space-y-5" data-testid="tag-posts">
              {posts.map((post) => (
                <PostCard key={post.post_id} post={post} featured />
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
