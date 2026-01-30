import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Save, X, Eye, Loader2 } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

export default function EditPost() {
  const { postId } = useParams();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`${API}/posts/${postId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const post = await res.json();
          setTitle(post.title);
          setContent(post.content);
          setPreview(post.preview || "");
          setTags(post.tags || []);
          setPublished(post.published);
        } else {
          toast.error("Post not found");
          navigate("/admin");
        }
      } catch {
        toast.error("Error loading post");
        navigate("/admin");
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, navigate]);

  const handleAddTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API}/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          preview: preview.trim() || undefined,
          tags,
          published,
        }),
      });

      if (res.ok) {
        toast.success("Post updated!");
        navigate("/admin");
      } else {
        const data = await res.json();
        toast.error(data.detail || "Failed to update post");
      }
    } catch {
      toast.error("Error updating post");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b-2 border-foreground sticky top-0 bg-background z-50">
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="text-sm uppercase tracking-widest hover:text-primary transition-colors flex items-center gap-2"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl md:text-2xl font-bold uppercase tracking-tighter">
              Edit Post
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                id="published"
                checked={published}
                onCheckedChange={setPublished}
                data-testid="publish-switch"
              />
              <Label htmlFor="published" className="text-sm uppercase tracking-widest cursor-pointer">
                {published ? "Published" : "Draft"}
              </Label>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="brutalist-btn-primary flex items-center gap-2"
              data-testid="save-post-button"
            >
              {saving ? "Saving..." : "Save"}
              <Save className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2 font-bold">
              Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="YOUR POST TITLE"
              className="brutalist-input w-full text-xl md:text-2xl font-bold uppercase"
              data-testid="title-input"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2 font-bold">
              Tags (press Enter to add)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="rounded-none uppercase text-xs flex items-center gap-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                    data-testid={`remove-tag-${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="TYPE AND PRESS ENTER..."
              className="brutalist-input w-full"
              data-testid="tag-input"
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-xs uppercase tracking-widest mb-2 font-bold">
              Preview Text
            </label>
            <Input
              type="text"
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              placeholder="CUSTOM PREVIEW TEXT..."
              className="brutalist-input w-full"
              data-testid="preview-input"
            />
          </div>

          {/* Content (Markdown Editor) */}
          <div data-color-mode="light">
            <label className="block text-xs uppercase tracking-widest mb-2 font-bold">
              Content (Markdown)
            </label>
            <div className="border-2 border-foreground" data-testid="content-editor">
              <MDEditor
                value={content}
                onChange={setContent}
                height={500}
                preview="edit"
                className="!border-0"
              />
            </div>
          </div>

          {/* Preview Section */}
          {content && (
            <div>
              <label className="block text-xs uppercase tracking-widest mb-2 font-bold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </label>
              <div className="border-2 border-foreground p-6 bg-secondary/20">
                <MDEditor.Markdown source={content} />
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
