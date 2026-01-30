import { useState, useContext } from "react";
import { API, AuthContext } from "../App";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { toast } from "sonner";
import { MessageSquare, Trash2, Send, Heart } from "lucide-react";

export default function CommentSection({ postId, comments, onCommentAdded, onCommentDeleted }) {
  const { user } = useContext(AuthContext);
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!authorName.trim() || !content.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API}/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author_name: authorName.trim(),
          content: content.trim(),
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        onCommentAdded(newComment);
        setContent("");
        toast.success("Comment added! 💜");
      } else {
        toast.error("Failed to add comment");
      }
    } catch {
      toast.error("Error adding comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("Delete this comment?")) return;

    try {
      const res = await fetch(`${API}/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        onCommentDeleted(commentId);
        toast.success("Comment deleted");
      } else {
        toast.error("Failed to delete comment");
      }
    } catch {
      toast.error("Error deleting comment");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <section className="mt-16 pt-12 border-t border-border/50" data-testid="comment-section">
      <h2 className="text-2xl md:text-3xl font-bold mb-8 flex items-center gap-3">
        <MessageSquare className="h-7 w-7 text-primary" />
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-10 cozy-card p-6" data-testid="comment-form">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Heart className="h-4 w-4 text-primary" />
          Leave a comment
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-muted-foreground">
              Your Name
            </label>
            <Input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="John Doe"
              className="cozy-input w-full"
              data-testid="comment-author-input"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2 text-muted-foreground">
            Your Comment
          </label>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts..."
            className="cozy-input w-full min-h-[120px] resize-none"
            data-testid="comment-content-input"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={submitting}
          className="cozy-btn-primary flex items-center gap-2"
          data-testid="comment-submit-button"
        >
          {submitting ? "Posting..." : "Post Comment"}
          <Send className="h-4 w-4" />
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-12 cozy-card">
            <div className="text-4xl mb-3">💬</div>
            <p className="text-muted-foreground">
              No comments yet. Be the first to share your thoughts!
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.comment_id} 
              className="cozy-card p-5 relative group"
              data-testid={`comment-${comment.comment_id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(225,100%,84%)] to-primary/50 flex items-center justify-center text-white text-sm font-medium">
                      {comment.author_name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium">
                      {comment.author_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-foreground/90 whitespace-pre-wrap pl-11">{comment.content}</p>
                </div>
                
                {user?.is_admin && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(comment.comment_id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity rounded-full hover:bg-destructive/10 hover:text-destructive"
                    data-testid={`delete-comment-${comment.comment_id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
