import { useState, useEffect } from "react";
import { API } from "../App";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import TagCloud from "../components/TagCloud";
import { Button } from "../components/ui/button";
import { ChevronLeft, ChevronRight, Loader2, Coffee, Sparkles } from "lucide-react";

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 6;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const [postsRes, countRes] = await Promise.all([
          fetch(`${API}/posts?page=${page}&limit=${limit}`),
          fetch(`${API}/posts/count`),
        ]);

        if (postsRes.ok) {
          const postsData = await postsRes.json();
          setPosts(postsData);
        }
        if (countRes.ok) {
          const countData = await countRes.json();
          setTotalCount(countData.count);
        }
      } catch (err) {
        console.error("Error fetching posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden" data-testid="hero-section">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary/20 to-[hsl(190,100%,60%)]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[hsl(225,100%,84%)]/30 to-primary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 cozy-badge-primary mb-6">
                <Coffee className="h-4 w-4" />
                Welcome to my corner
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Express
                <span className="text-primary">/</span>
                <span className="font-handwritten text-5xl md:text-6xl lg:text-7xl">Thoughts</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-lg mb-8">
                A cozy space for ideas, reflections, and technical adventures. 
                Grab a cup of coffee and stay a while ☕
              </p>
              <div className="flex items-center gap-4">
                <div className="cozy-card px-6 py-4 inline-flex items-center gap-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <div>
                    <div className="text-3xl font-bold text-primary">{totalCount}</div>
                    <div className="text-sm text-muted-foreground">Posts Published</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative blob */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-br from-primary/30 via-[hsl(225,100%,84%)]/40 to-[hsl(190,100%,60%)]/30 blob float" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl">✨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Featured Post */}
            {posts.length > 0 && page === 1 && (
              <div className="mb-10">
                <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-0.5 bg-primary rounded-full" />
                  Latest Post
                </h2>
                <PostCard post={posts[0]} featured />
              </div>
            )}

            {/* Posts Grid */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                <span className="w-8 h-0.5 bg-primary rounded-full" />
                {page === 1 ? "More Posts" : `Page ${page}`}
              </h2>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-20 cozy-card">
                  <div className="text-6xl mb-4">📝</div>
                  <p className="text-xl text-muted-foreground">
                    No posts yet
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Check back soon for new content!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" data-testid="posts-grid">
                  {(page === 1 ? posts.slice(1) : posts).map((post) => (
                    <PostCard key={post.post_id} post={post} />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-12" data-testid="pagination">
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="rounded-full"
                    data-testid="prev-page-button"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-muted-foreground px-4 py-2 rounded-full bg-secondary/50">
                    Page {page} of {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="rounded-full"
                    data-testid="next-page-button"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            <TagCloud />
            
            <div className="cozy-card p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Coffee className="h-4 w-4 text-primary" />
                About
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Welcome to my digital space! Here I share thoughts on technology, 
                life, and everything in between. Thanks for stopping by! 💜
              </p>
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
