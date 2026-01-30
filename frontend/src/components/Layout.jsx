import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, ThemeContext } from "../App";
import { Sun, Moon, Menu, X, Search, User, LogOut, PenLine, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="flex items-center justify-between px-4 md:px-8 py-4 max-w-7xl mx-auto">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center gap-2 group"
          data-testid="header-logo"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[hsl(190,100%,60%)] flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform">
            E
          </div>
          <span className="text-xl font-bold hidden sm:block">
            Express<span className="text-primary">/</span>Thoughts
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-3">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex items-center">
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 cozy-input text-sm"
              data-testid="search-input-desktop"
            />
            <Button 
              type="submit" 
              variant="ghost" 
              size="icon" 
              className="ml-2 rounded-full hover:bg-primary/10"
              data-testid="search-submit-desktop"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full hover:bg-primary/10 wiggle"
            data-testid="theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </Button>

          {/* Auth */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="rounded-full gap-2 hover:bg-primary/10" data-testid="user-menu-trigger">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[hsl(225,100%,84%)] flex items-center justify-center text-white text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium hidden lg:block">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="rounded-xl bg-card border border-border shadow-lg">
                {user.is_admin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer" data-testid="admin-link">
                      <PenLine className="h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={logout} 
                  className="flex items-center gap-2 cursor-pointer text-destructive"
                  data-testid="logout-button"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button className="cozy-btn-primary" data-testid="login-link">
                <Sparkles className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
            data-testid="theme-toggle-mobile"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-primary" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-full"
            data-testid="mobile-menu-button"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 p-4 space-y-4 bg-background/95 backdrop-blur-lg">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 cozy-input"
              data-testid="search-input-mobile"
            />
            <Button type="submit" className="cozy-btn-primary" data-testid="search-submit-mobile">
              <Search className="h-4 w-4" />
            </Button>
          </form>
          
          {user ? (
            <div className="space-y-2">
              <p className="text-sm font-medium flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-[hsl(225,100%,84%)] flex items-center justify-center text-white text-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                {user.name}
              </p>
              {user.is_admin && (
                <Link 
                  to="/admin" 
                  className="block"
                  onClick={() => setMobileMenuOpen(false)}
                  data-testid="admin-link-mobile"
                >
                  <Button variant="outline" className="w-full rounded-xl">
                    <PenLine className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
              )}
              <Button 
                onClick={() => { logout(); setMobileMenuOpen(false); }} 
                variant="outline"
                className="w-full rounded-xl text-destructive border-destructive/30"
                data-testid="logout-button-mobile"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Link 
              to="/login" 
              onClick={() => setMobileMenuOpen(false)}
              data-testid="login-link-mobile"
            >
              <Button className="w-full cozy-btn-primary">
                <Sparkles className="h-4 w-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-card border-t border-border/50 mt-auto">
      {/* Decorative Wave */}
      <div className="h-2 bg-gradient-to-r from-primary via-[hsl(213,97%,59%)] to-[hsl(190,100%,60%)]" />
      
      <div className="px-4 md:px-8 py-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-[hsl(190,100%,60%)] flex items-center justify-center text-white font-bold text-lg">
                E
              </div>
              <span className="text-xl font-bold">Express/Thoughts</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A cozy corner of the internet for thoughts, reflections, and tech adventures. ☕
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <nav className="space-y-2">
              <Link to="/" className="block text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-home">
                Home
              </Link>
              <Link to="/search" className="block text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="footer-search">
                Search
              </Link>
            </nav>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Built With</h4>
            <div className="flex flex-wrap gap-2">
              <span className="cozy-badge">React</span>
              <span className="cozy-badge">FastAPI</span>
              <span className="cozy-badge">MongoDB</span>
            </div>
          </div>
        </div>
        
        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Express/Thoughts • Made with 💜
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
