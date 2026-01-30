import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, X, Eye, Sparkles } from "lucide-react";
import MDEditor from "@uiw/react-md-editor";

export default function CreatePost() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [preview, setPreview] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);

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
      const res = await fetch(`${API}/posts`, {
        method: "POST",
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
        toast.success("Post created! 🎉");
        navigate("/admin");
      } else {
        const data = await res.json();
        toast.error(data.detail || "Failed to create post");
      }
    } catch {
      toast.error("Error creating post");
    } finally {
      setSaving(false);
    }
  };

  // Tag color classes
  const tagColors = [
    "bg-primary/15 text-primary",
    "bg-[hsl(225,100%,84%)]/40 text-[hsl(225,60%,45%)]",
    "bg-[hsl(190,100%,60%)]/25 text-[hsl(190,100%,30%)]",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-lg border-b border-border/50 z-50">
        <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-5xl mx-auto">
          <div className="flex items-center gap-4">
            <Link 
              to="/admin" 
              className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              data-testid="back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              New Post
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
              <Label htmlFor="published" className="text-sm cursor-pointer">
                {published ? "Publish" : "Draft"}
              </Label>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="cozy-btn-primary"
              data-testid="save-post-button"
            >
              {saving ? "Saving..." : "Save"}
              <Save className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Your awesome post title..."
              className="cozy-input w-full text-xl font-semibold"
              data-testid="title-input"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Tags (press Enter to add)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${tagColors[index % tagColors.length]}`}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:opacity-70 transition-opacity"
                    data-testid={`remove-tag-${tag}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <Input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type and press Enter..."
              className="cozy-input w-full"
              data-testid="tag-input"
            />
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Preview Text (optional - auto-generated from content)
            </label>
            <Input
              type="text"
              value={preview}
              onChange={(e) => setPreview(e.target.value)}
              placeholder="Custom preview text..."
              className="cozy-input w-full"
              data-testid="preview-input"
            />
          </div>

          {/* Content (Markdown Editor) */}
          <div data-color-mode="light">
            <label className="block text-sm font-medium mb-2">
              Content (Markdown)
            </label>
            <div className="cozy-card overflow-hidden" data-testid="content-editor">
              <MDEditor
                value={content}
                onChange={setContent}
                height={500}
                preview="edit"
              />
            </div>
          </div>

          {/* Preview Section */}
          {content && (
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                Preview
              </label>
              <div className="cozy-card p-6">
                <MDEditor.Markdown source={content} />
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}
