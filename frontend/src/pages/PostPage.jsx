import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { API } from "../App";
import Layout from "../components/Layout";
import CommentSection from "../components/CommentSection";
import { Calendar, User, ArrowLeft, Loader2, Heart } from "lucide-react";

export default function PostPage() {
  const { postId } = useParams();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [postRes, commentsRes] = await Promise.all([
          fetch(`${API}/posts/${postId}`),
          fetch(`${API}/posts/${postId}/comments`),
        ]);

        if (postRes.ok) {
          const postData = await postRes.json();
          setPost(postData);
        } else if (postRes.status === 404) {
          setError("Post not found");
        }

        if (commentsRes.ok) {
          const commentsData = await commentsRes.json();
          setComments(commentsData);
        }
      } catch (err) {
        setError("Error loading post");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [postId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCommentAdded = (newComment) => {
    setComments([newComment, ...comments]);
    setPost({ ...post, comment_count: (post.comment_count || 0) + 1 });
  };

  const handleCommentDeleted = (commentId) => {
    setComments(comments.filter((c) => c.comment_id !== commentId));
    setPost({ ...post, comment_count: Math.max(0, (post.comment_count || 0) - 1) });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold mb-4">
            {error || "Post Not Found"}
          </h1>
          <Link 
            to="/" 
            className="cozy-btn-primary flex items-center gap-2"
            data-testid="back-home-link"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="page-enter" data-testid={`post-page-${postId}`}>
        {/* Header */}
        <header className="relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/10 to-[hsl(190,100%,60%)]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative max-w-4xl mx-auto px-4 md:px-8 py-12 md:py-16">
            <Link 
              to="/" 
              className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-primary transition-colors group"
              data-testid="back-link"
            >
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Posts
            </Link>

            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags?.map((tag) => (
                <Link key={tag} to={`/tag/${encodeURIComponent(tag)}`}>
                  <span 
                    className="cozy-badge-primary hover:scale-105 transition-transform cursor-pointer"
                    data-testid={`post-tag-${tag}`}
                  >
                    #{tag}
                  </span>
                </Link>
              ))}
            </div>

            <h1 
              className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-8"
              data-testid="post-title"
            >
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[hsl(225,100%,84%)] flex items-center justify-center text-white text-sm">
                  {post.author_name?.charAt(0).toUpperCase()}
                </div>
                {post.author_name}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary/60" />
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>
        </header>

        {/* Decorative divider */}
        <div className="h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent max-w-4xl mx-auto" />

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 py-12">
          <div 
            className="prose"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
            data-testid="post-content"
          />

          {/* Post footer */}
          <div className="mt-12 pt-8 border-t border-border/50 flex items-center justify-center gap-2 text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            <span className="text-sm">Thanks for reading!</span>
          </div>

          {/* Comments */}
          <CommentSection
            postId={postId}
            comments={comments}
            onCommentAdded={handleCommentAdded}
            onCommentDeleted={handleCommentDeleted}
          />
        </div>
      </article>
    </Layout>
  );
}
