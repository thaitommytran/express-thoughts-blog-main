import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API, AuthContext } from "../App";
import { Button } from "../components/ui/button";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  ArrowLeft, 
  LogOut,
  FileText,
  Loader2,
  Sparkles,
  Coffee
} from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/posts?include_unpublished=true&limit=100`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      toast.error("Failed to load posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;

    try {
      const res = await fetch(`${API}/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        setPosts(posts.filter((p) => p.post_id !== postId));
        toast.success("Post deleted");
      } else {
        toast.error("Failed to delete post");
      }
    } catch {
      toast.error("Error deleting post");
    }
  };

  const handleTogglePublish = async (post) => {
    try {
      const res = await fetch(`${API}/posts/${post.post_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ published: !post.published }),
      });

      if (res.ok) {
        setPosts(
          posts.map((p) =>
            p.post_id === post.post_id ? { ...p, published: !p.published } : p
          )
        );
        toast.success(post.published ? "Post unpublished" : "Post published! 🎉");
      } else {
        toast.error("Failed to update post");
      }
    } catch {
      toast.error("Error updating post");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border/50 z-50">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              data-testid="back-to-blog"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Blog</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[hsl(225,100%,84%)] flex items-center justify-center text-white text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {user?.name}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full hover:bg-destructive/10 hover:text-destructive"
              data-testid="logout-button"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="cozy-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <div className="text-3xl font-bold">{posts.length}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </div>
          </div>
          <div className="cozy-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
              <Eye className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <div className="text-3xl font-bold text-green-600">
                {posts.filter((p) => p.published).length}
              </div>
              <div className="text-sm text-muted-foreground">Published</div>
            </div>
          </div>
          <div className="cozy-card p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 flex items-center justify-center">
              <EyeOff className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-600">
                {posts.filter((p) => !p.published).length}
              </div>
              <div className="text-sm text-muted-foreground">Drafts</div>
            </div>
          </div>
        </div>

        {/* Posts Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">All Posts</h2>
          <Link to="/admin/create">
            <Button className="cozy-btn-primary" data-testid="create-post-button">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </Link>
        </div>

        {/* Posts List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 cozy-card">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-xl text-muted-foreground mb-4">
              No posts yet
            </p>
            <Link to="/admin/create">
              <Button className="cozy-btn-primary">
                Create Your First Post
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3" data-testid="posts-list">
            {posts.map((post) => (
              <div
                key={post.post_id}
                className="cozy-card p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-primary/30"
                data-testid={`post-item-${post.post_id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`cozy-badge text-xs ${post.published ? 'bg-green-500/15 text-green-600' : 'bg-yellow-500/15 text-yellow-600'}`}>
                      {post.published ? "Published" : "Draft"}
                    </span>
                    {post.tags?.slice(0, 2).map((tag) => (
                      <span key={tag} className="text-xs text-primary/70">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-semibold truncate mb-1">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(post.created_at)} • {post.comment_count || 0} comments
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePublish(post)}
                    className="rounded-full hover:bg-secondary"
                    title={post.published ? "Unpublish" : "Publish"}
                    data-testid={`toggle-publish-${post.post_id}`}
                  >
                    {post.published ? (
                      <EyeOff className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-green-500" />
                    )}
                  </Button>
                  <Link to={`/admin/edit/${post.post_id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-secondary"
                      data-testid={`edit-post-${post.post_id}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(post.post_id, post.title)}
                    className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                    data-testid={`delete-post-${post.post_id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Link to={`/post/${post.post_id}`} target="_blank">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full hover:bg-secondary"
                      data-testid={`view-post-${post.post_id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
