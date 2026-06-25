"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function UserProfile() {
  const params = useParams();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // The username from the URL
  const rawUsername = Array.isArray(params.username) ? params.username[0] : (params.username || "");
  const targetUsername = decodeURIComponent(rawUsername).replace(/^@/, '').trim();

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/posts");
      const data = await res.json();
      
      // Filter posts exactly matching the username (case-insensitive)
      const userPosts = data.filter((p: any) => 
        p.username.replace(/^@/, '').trim().toLowerCase() === targetUsername.toLowerCase()
      );
      
      setPosts(userPosts);
    } catch (err) {
      console.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [targetUsername]);

  const getProfileUrl = (platform: string, username: string) => {
    // Strip @, and take only the first part before a space or slash
    const cleanUsername = username.replace(/^@/, '').split(/[\s/]+/)[0].trim();
    switch (platform) {
      case "X (Twitter)": return `https://x.com/${cleanUsername}`;
      case "Instagram": return `https://instagram.com/${cleanUsername}`;
      case "Facebook": return `https://facebook.com/${cleanUsername}`;
      case "Reddit": return `https://reddit.com/user/${cleanUsername}`;
      default: return `https://www.google.com/search?q=${encodeURIComponent(cleanUsername)}`;
    }
  };

  // Profile Stats
  const totalReports = posts.length;
  const totalUpvotes = posts.reduce((sum, post) => sum + (post.upvotes || 0), 0);
  const platformsUsed = Array.from(new Set(posts.map(p => p.platform)));

  return (
    <>
      <div className="background-elements">
        <div className="glow-orb red-orb" style={{ opacity: 0.4 }}></div>
        <div className="glow-orb purple-orb" style={{ opacity: 0.3 }}></div>
      </div>

      <header style={{ textAlign: "center", padding: "4rem 1rem 2rem" }}>
        <div style={{ margin: "0 auto", maxWidth: "800px" }}>
          
          <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", display: "inline-block", marginBottom: "2rem", fontSize: "1.1rem" }}>
            ← Back to Main Feed
          </Link>

          {/* Hall of Shame Profile Header */}
          <div style={{ 
            background: "rgba(0,0,0,0.4)", padding: "3rem 2rem", borderRadius: "20px",
            border: "1px solid rgba(239, 68, 68, 0.2)", boxShadow: "0 0 40px rgba(239, 68, 68, 0.1)",
            position: "relative", overflow: "hidden"
          }}>
            {totalReports >= 5 && (
              <div style={{ position: "absolute", top: "1rem", right: "1rem", background: "rgba(239, 68, 68, 0.2)", color: "var(--accent-red)", padding: "0.5rem 1rem", borderRadius: "20px", fontWeight: "bold", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px" }}>
                ⚠️ High Risk Offender
              </div>
            )}
            
            <h1 style={{ fontSize: "3rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--accent-purple)" }}>
              @{targetUsername}
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.2rem", marginBottom: "2rem" }}>
              Public Accountability Profile
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Reports</div>
                <div style={{ fontSize: "2rem", fontWeight: "800", color: "var(--accent-red)" }}>{totalReports}</div>
              </div>
              <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }}></div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Corroborations</div>
                <div style={{ fontSize: "2rem", fontWeight: "800", color: "#fff" }}>{totalUpvotes}</div>
              </div>
              <div style={{ width: "1px", background: "rgba(255,255,255,0.1)" }}></div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Platforms</div>
                <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "var(--accent-purple)", marginTop: "0.5rem" }}>
                  {platformsUsed.join(", ") || "Unknown"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", flexWrap: "wrap" }}>
              {platformsUsed.map(platform => (
                <a 
                  key={platform}
                  href={getProfileUrl(platform, targetUsername)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                    color: "#fff", padding: "0.8rem 1.5rem", borderRadius: "30px", textDecoration: "none",
                    fontWeight: 600, transition: "all 0.3s ease", display: "inline-block"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
                >
                  View on {platform} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1.5rem 4rem" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "2rem", textAlign: "center" }}>Evidence Log</h2>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {loading ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Loading evidence...</div>
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem", background: "rgba(0,0,0,0.2)", borderRadius: "10px" }}>
              No evidence found for this user.
            </div>
          ) : (
            posts.map((post, i) => (
              <div key={post.id} className="post-card" style={{ animationDelay: `${i * 0.1}s` }}>
                <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px" }}>{post.platform}</span>
                    {post.category && (
                      <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.1)", padding: "0.2rem 0.6rem", borderRadius: "10px", color: "var(--text-muted)" }}>
                        {post.category}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                    {new Date(post.date).toLocaleDateString()}
                  </span>
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
                  
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", marginTop: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                      🛡️ <span style={{ fontWeight: "bold", color: (post.upvotes || 0) > 10 ? "var(--accent-red)" : "inherit" }}>{post.upvotes || 0}</span> 
                      corroborations
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </>
  );
}
