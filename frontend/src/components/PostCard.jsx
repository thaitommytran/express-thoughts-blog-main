import { Link } from "react-router-dom";
import { Calendar, MessageSquare, ArrowRight } from "lucide-react";

export default function PostCard({ post, featured = false }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (featured) {
    return (
      <article 
        className="cozy-card-elevated p-6 md:p-8 group"
        data-testid={`featured-post-${post.post_id}`}
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-9">
            <div className="flex flex-wrap gap-2 mb-4">
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
            
            <Link to={`/post/${post.post_id}`}>
              <h2 
                className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight"
                data-testid={`post-title-${post.post_id}`}
              >
                {post.title}
              </h2>
            </Link>
            
            <p className="text-muted-foreground mb-6 line-clamp-2 text-base md:text-lg">
              {post.preview}
            </p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary/60" />
                {formatDate(post.created_at)}
              </span>
              <span className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary/60" />
                {post.comment_count || 0} comments
              </span>
            </div>
          </div>
          
          <div className="md:col-span-3 flex items-end justify-start md:justify-end">
            <Link 
              to={`/post/${post.post_id}`}
              className="cozy-btn-primary flex items-center gap-2 group/btn"
              data-testid={`read-post-${post.post_id}`}
            >
              Read more
              <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article 
      className="cozy-card p-5 group hover:border-primary/30"
      data-testid={`post-card-${post.post_id}`}
    >
      <div className="flex flex-wrap gap-2 mb-3">
        {post.tags?.slice(0, 2).map((tag) => (
          <Link key={tag} to={`/tag/${encodeURIComponent(tag)}`}>
            <span 
              className="text-xs text-primary/80 hover:text-primary transition-colors"
              data-testid={`post-tag-${tag}`}
            >
              #{tag}
            </span>
          </Link>
        ))}
      </div>
      
      <Link to={`/post/${post.post_id}`}>
        <h3 
          className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2"
          data-testid={`post-title-${post.post_id}`}
        >
          {post.title}
        </h3>
      </Link>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {post.preview}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(post.created_at)}
        </span>
        <span className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          {post.comment_count || 0}
        </span>
      </div>
    </article>
  );
}
