"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState("Upload Screenshot Proof");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Professional Features State
  const [searchQuery, setSearchQuery] = useState("");
  const [activePlatformFilter, setActivePlatformFilter] = useState("All");
  const [activeMonthFilter, setActiveMonthFilter] = useState("All Time");

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("Upload Screenshot Proof");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        setFileName("Upload Screenshot Proof");
        fetchPosts();
        
        document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        const errorData = await res.json();
        alert("Failed to submit entry: " + (errorData.error || "Unknown Error"));
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const password = prompt("Enter Admin Password to delete this post:");
    if (!password) return;

    try {
      const res = await fetch("/api/posts", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password })
      });

      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to delete post");
      }
    } catch (err) {
      alert("An error occurred while deleting.");
    }
  };

  const handleUpvote = async (id: string) => {
    // Optimistic UI update
    setPosts(posts.map(p => p.id === id ? { ...p, upvotes: (p.upvotes || 0) + 1 } : p));
    
    try {
      await fetch("/api/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
    } catch (err) {
      // Revert if failed
      fetchPosts();
    }
  };

  // Derived State for Stats
  const totalEvidence = posts.length;
  const platformCounts = posts.reduce((acc, post) => {
    acc[post.platform] = (acc[post.platform] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const mostReportedPlatform = Object.keys(platformCounts).length > 0 
    ? Object.keys(platformCounts).reduce((a, b) => platformCounts[a] > platformCounts[b] ? a : b) 
    : "None";

  // Derive Unique Months for Archives
  const uniqueMonths = Array.from(new Set(posts.map(post => {
    const date = new Date(post.date);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  })));

  // Derived State for Filtering
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.comment.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (post.category && post.category.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPlatform = activePlatformFilter === "All" || post.platform === activePlatformFilter;
    
    const postMonth = new Date(post.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    const matchesMonth = activeMonthFilter === "All Time" || postMonth === activeMonthFilter;

    return matchesSearch && matchesPlatform && matchesMonth;
  });

  const platforms = ["All", "X (Twitter)", "Instagram", "Facebook", "Reddit", "Other"];

  const getProfileUrl = (platform: string, username: string) => {
    // Strip the @ symbol if the user included it
    const cleanUsername = username.replace(/^@/, '').trim();
    
    switch (platform) {
      case "X (Twitter)": return `https://x.com/${cleanUsername}`;
      case "Instagram": return `https://instagram.com/${cleanUsername}`;
      case "Facebook": return `https://facebook.com/${cleanUsername}`;
      case "Reddit": return `https://reddit.com/user/${cleanUsername}`;
      default: return `https://www.google.com/search?q=${encodeURIComponent(cleanUsername)}`;
    }
  };

  return (
    <>
      <div className="background-elements">
        <div className="glow-orb red-orb"></div>
        <div className="glow-orb purple-orb"></div>
      </div>

      <header style={{ textAlign: "center", padding: "4rem 1rem 2rem" }}>
        <div style={{ margin: "0 auto", maxWidth: "800px" }}>
          
          {/* Live Stats Dashboard */}
          <div style={{ 
            display: "flex", justifyContent: "center", gap: "2rem", marginBottom: "2rem",
            background: "rgba(255,255,255,0.02)", padding: "1.5rem", borderRadius: "15px",
            border: "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap",
            boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)", backdropFilter: "blur(5px)"
          }}>
            <div style={{ textAlign: "center", padding: "0 1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "1.1rem" }}>📋</span> Total Reports Submitted
              </div>
              <div style={{ fontSize: "2.5rem", fontWeight: "800", color: "var(--accent-red)", textShadow: "0 0 20px rgba(239, 68, 68, 0.4)" }}>{totalEvidence}</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }}></div>
            <div style={{ textAlign: "center", padding: "0 1rem" }}>
              <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "0.5rem", marginTop: "0.2rem" }}>Most Reported Platform</div>
              <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-purple)", marginTop: "0.5rem" }}>{mostReportedPlatform}</div>
            </div>
          </div>

          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Truth<span style={{ color: "var(--accent-purple)" }}>Board</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Bringing internet accountability to light. Search the database or share evidence to warn others.
          </p>

          {/* Search Bar */}
          <div style={{ marginTop: "2.5rem", position: "relative", maxWidth: "550px", margin: "2.5rem auto 0" }}>
            <span style={{ position: "absolute", left: "1.5rem", top: "50%", transform: "translateY(-50%)", fontSize: "1.2rem", opacity: 0.5 }}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by username, tag, or keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "1.2rem 1.2rem 1.2rem 3.5rem",
                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "30px", color: "#fff", fontSize: "1.1rem",
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.1)", transition: "all 0.3s ease",
                outline: "none"
              }}
              onFocus={(e) => e.target.style.boxShadow = "0 0 25px rgba(139, 92, 246, 0.3)"}
              onBlur={(e) => e.target.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.1)"}
            />
          </div>

        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 4rem", display: "flex", flexDirection: "column", gap: "4rem" }}>
        
        {/* Add Entry Section */}
        <section className="glass-panel" style={{ padding: "2rem", height: "fit-content" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>Add an Entry</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Target Username / Name</label>
              <input type="text" name="username" className="input-field" placeholder="e.g. @toxic_user123" required />
            </div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Platform</label>
                <select name="platform" className="input-field">
                  <option value="X (Twitter)">X (Twitter)</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>Category Tag</label>
                <input 
                  type="text" 
                  name="category" 
                  list="category-options" 
                  className="input-field" 
                  placeholder="e.g. #Scam or type your own" 
                  defaultValue="#ToxicBehavior"
                  required 
                />
                <datalist id="category-options">
                  <option value="#ToxicBehavior" />
                  <option value="#Scam" />
                  <option value="#HateSpeech" />
                  <option value="#FakeFeminism" />
                  <option value="#Harassment" />
                  <option value="#Creep" />
                  <option value="#Fraud" />
                  <option value="#Misinformation" />
                  <option value="#Bullying" />
                  <option value="#General" />
                </datalist>
              </div>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Their Comments / Remarks</label>
              <textarea name="comment" className="input-field" rows={4} placeholder="Quote what they said..." required></textarea>
            </div>

            <div>
              <label style={{ 
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", 
                padding: "1.2rem", border: "1px dashed rgba(255, 255, 255, 0.2)", borderRadius: "10px", 
                cursor: "pointer", background: "rgba(255,255,255,0.03)", transition: "background 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              >
                <span style={{ fontSize: "1.5rem" }}>📸</span>
                <span style={{ color: fileName !== "Upload Screenshot Proof" ? "var(--accent-purple)" : "inherit" }}>
                  {fileName}
                </span>
                <input 
                  type="file" 
                  name="screenshot" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  ref={fileInputRef}
                  style={{ display: "none" }} 
                />
              </label>
            </div>

            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Publishing..." : "Publish Entry"}
            </button>
          </form>
        </section>

        {/* Feed Section */}
        <section id="feed" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <h2 style={{ fontSize: "1.8rem" }}>Database Log</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <select 
                value={activeMonthFilter} 
                onChange={(e) => setActiveMonthFilter(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", padding: "0.4rem 1rem", borderRadius: "8px", outline: "none",
                  cursor: "pointer", fontSize: "0.9rem"
                }}
              >
                <option value="All Time">All Time Archives</option>
                {uniqueMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-red)", background: "rgba(239, 68, 68, 0.1)", padding: "0.4rem 0.8rem", borderRadius: "20px", fontWeight: 600, fontSize: "0.9rem" }}>
                <span className="pulse"></span> Live
              </div>
            </div>
          </div>

          {/* Platform Filters */}
          <div style={{ display: "flex", gap: "0.5rem", overflowX: "auto", paddingBottom: "1rem", marginBottom: "1rem" }} className="hide-scrollbar">
            {platforms.map(platform => (
              <button
                key={platform}
                onClick={() => setActivePlatformFilter(platform)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "20px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: activePlatformFilter === platform ? "var(--accent-purple)" : "rgba(0,0,0,0.3)",
                  color: "#fff",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s ease"
                }}
              >
                {platform}
              </button>
            ))}
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {loading ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Loading database...</div>
            ) : filteredPosts.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem", background: "rgba(0,0,0,0.2)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                No entries match your criteria.
              </div>
            ) : (
              filteredPosts.map((post, i) => (
                <div key={post.id} className="post-card" style={{ animationDelay: `${i * 0.05}s` }}>
                  <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      <Link 
                        href={`/user/${encodeURIComponent(post.username.replace(/^@/, '').trim())}`}
                        style={{ fontWeight: 700, fontSize: "1.2rem", letterSpacing: "0.5px", color: "var(--accent-purple)", textDecoration: "none" }}
                        title={`View ${post.username}'s Profile`}
                      >
                        {post.username} ↗
                      </Link>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{post.platform}</span>
                        {post.category && (
                          <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.1)", padding: "0.2rem 0.6rem", borderRadius: "10px", color: "var(--text-muted)" }}>
                            {post.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        {new Date(post.date).toLocaleDateString()}
                      </span>
                      <button 
                        onClick={() => handleDelete(post.id)}
                        style={{ background: "transparent", border: "none", color: "var(--accent-red)", cursor: "pointer", fontSize: "1.1rem", opacity: 0.7, transition: "opacity 0.2s" }}
                        title="Admin Delete"
                        onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={(e) => e.currentTarget.style.opacity = "0.7"}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ fontSize: "1.05rem", color: "#e4e4e7", marginBottom: "1.5rem", whiteSpace: "pre-wrap", lineHeight: 1.6, fontStyle: "italic" }}>
                      "{post.comment}"
                    </div>
                    {post.screenshot && (
                      <div style={{ width: "100%", borderRadius: "8px", overflow: "hidden", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.05)", marginBottom: "1rem" }}>
                        <img src={post.screenshot} alt="Evidence against user" style={{ width: "100%", height: "auto", display: "block" }} />
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                      <div style={{ display: "flex", gap: "1rem" }}>
                        <button 
                          onClick={() => handleUpvote(post.id)}
                          style={{
                            background: "rgba(139, 92, 246, 0.15)", border: "1px solid rgba(139, 92, 246, 0.3)",
                            color: "#fff", padding: "0.5rem 1rem", borderRadius: "20px", fontSize: "0.9rem",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
                            transition: "all 0.3s ease"
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(139, 92, 246, 0.3)"; e.currentTarget.style.boxShadow = "0 0 15px rgba(139, 92, 246, 0.4)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)"; e.currentTarget.style.boxShadow = "none"; }}
                        >
                          🛡️ Corroborate
                        </button>

                        <button 
                          onClick={() => {
                            const url = `${window.location.origin}/user/${encodeURIComponent(post.username.replace(/^@/, '').trim())}`;
                            if (navigator.share) {
                              navigator.share({
                                title: `Evidence against ${post.username}`,
                                text: `Check out this public accountability report regarding ${post.username} on TruthBoard.`,
                                url: url
                              }).catch(console.error);
                            } else {
                              navigator.clipboard.writeText(url);
                              alert("Profile link copied to clipboard!");
                            }
                          }}
                          style={{
                            background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "#fff", padding: "0.5rem 1rem", borderRadius: "20px", fontSize: "0.9rem",
                            cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
                            transition: "all 0.3s ease"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                        >
                          📤 Share
                        </button>
                      </div>
                      
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                        <span style={{ fontWeight: "bold", color: (post.upvotes || 0) > 10 ? "var(--accent-red)" : "inherit" }}>{post.upvotes || 0}</span> 
                        people verified this
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </>
  );
}
