import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API } from "../App";
import { Tag, Sparkles } from "lucide-react";

export default function TagCloud() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const res = await fetch(`${API}/tags`);
        if (res.ok) {
          const data = await res.json();
          setTags(data);
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="cozy-card p-5 animate-pulse">
        <div className="h-5 bg-secondary rounded-full w-24 mb-4"></div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-7 w-16 bg-secondary rounded-full"></div>
          ))}
        </div>
      </div>
    );
  }

  if (tags.length === 0) return null;

  // Color classes for tags
  const tagColors = [
    "bg-primary/10 text-primary hover:bg-primary/20",
    "bg-[hsl(225,100%,84%)]/30 text-[hsl(225,60%,50%)] hover:bg-[hsl(225,100%,84%)]/50",
    "bg-[hsl(190,100%,60%)]/20 text-[hsl(190,100%,35%)] hover:bg-[hsl(190,100%,60%)]/30",
    "bg-[hsl(213,97%,59%)]/15 text-[hsl(213,97%,45%)] hover:bg-[hsl(213,97%,59%)]/25",
  ];

  return (
    <div className="cozy-card p-5" data-testid="tag-cloud">
      <h3 className="font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Topics
      </h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => (
          <Link key={tag.name} to={`/tag/${encodeURIComponent(tag.name)}`}>
            <span 
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all cursor-pointer hover:scale-105 ${tagColors[index % tagColors.length]}`}
              data-testid={`tag-${tag.name}`}
            >
              <Tag className="h-3 w-3" />
              {tag.name}
              <span className="text-xs opacity-60">({tag.count})</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
