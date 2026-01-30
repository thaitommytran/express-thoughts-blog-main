import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { API } from "../App";
import Layout from "../components/Layout";
import PostCard from "../components/PostCard";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Search, Loader2, ArrowLeft, Sparkles } from "lucide-react";

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    if (query) {
      searchPosts(query);
    }
  }, [query]);

  const searchPosts = async (q) => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/posts?search=${encodeURIComponent(q)}&limit=50`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 page-enter" data-testid="search-page">
        {/* Header */}
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-8 hover:text-primary transition-colors group"
          data-testid="back-link"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
          <Search className="h-8 w-8 text-primary" />
          Search
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10" data-testid="search-form">
          <Input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts..."
            className="cozy-input flex-1 text-lg"
            data-testid="search-input"
          />
          <Button type="submit" className="cozy-btn-primary" data-testid="search-button">
            <Search className="h-5 w-5" />
          </Button>
        </form>

        {/* Results */}
        {query && (
          <p className="text-sm text-muted-foreground mb-6 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            {loading ? "Searching..." : `${posts.length} results for "${query}"`}
          </p>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          query && (
            <div className="text-center py-20 cozy-card">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-xl text-muted-foreground">
                No posts found
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try a different search term
              </p>
            </div>
          )
        ) : (
          <div className="space-y-5" data-testid="search-results">
            {posts.map((post) => (
              <PostCard key={post.post_id} post={post} featured />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
