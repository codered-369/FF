"use client";

import { useState, useEffect, useRef } from "react";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [fileName, setFileName] = useState("Upload Screenshot Proof");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Convert file to Base64
  const toBase64 = (file: File) =>
    new Promise<string | null>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

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
    const username = formData.get("username") as string;
    const platform = formData.get("platform") as string;
    const comment = formData.get("comment") as string;
    const file = formData.get("screenshot") as File;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData, // Send FormData directly
      });

      if (res.ok) {
        (e.target as HTMLFormElement).reset();
        setFileName("Upload Screenshot Proof");
        fetchPosts();
        
        // Scroll to feed
        document.getElementById('feed')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        alert("Failed to submit entry.");
      }
    } catch (err) {
      alert("An error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="background-elements">
        <div className="glow-orb red-orb"></div>
        <div className="glow-orb purple-orb"></div>
      </div>

      <header style={{ textAlign: "center", padding: "4rem 1rem 2rem" }}>
        <div style={{ margin: "0 auto", maxWidth: "600px" }}>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>
            Truth<span style={{ color: "var(--accent-purple)" }}>Board</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
            Bringing internet accountability to light. Share public remarks to warn others.
            (Vercel Ready)
          </p>
        </div>
      </header>

      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem 4rem", display: "grid", gap: "3rem", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}>
        <section className="glass-panel" style={{ padding: "2rem" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>Add an Entry</h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div>
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Target Username / Name</label>
              <input type="text" name="username" className="input-field" placeholder="e.g. @toxic_user123" required />
            </div>
            
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
              <label style={{ display: "block", marginBottom: "0.5rem" }}>Their Comments / Remarks</label>
              <textarea name="comment" className="input-field" rows={4} placeholder="Quote what they said..." required></textarea>
            </div>

            <div>
              <label style={{ 
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.8rem", 
                padding: "1.2rem", border: "1px dashed rgba(255, 255, 255, 0.2)", borderRadius: "10px", 
                cursor: "pointer", background: "rgba(255,255,255,0.03)" 
              }}>
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

        <section id="feed">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.8rem" }}>Recent Entries</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-red)", background: "rgba(239, 68, 68, 0.1)", padding: "0.4rem 0.8rem", borderRadius: "20px", fontWeight: 600, fontSize: "0.9rem" }}>
              <span className="pulse"></span> Live Feed
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {loading ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>Loading evidence...</div>
            ) : posts.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "2rem" }}>No entries yet. Be the first to add one.</div>
            ) : (
              posts.map((post, i) => (
                <div key={post.id} className="post-card" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>{post.username}</span>
                      <span style={{ fontSize: "0.85rem", color: "var(--accent-purple)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>{post.platform}</span>
                    </div>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                      {new Date(post.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div style={{ padding: "1.5rem" }}>
                    <div style={{ fontSize: "1.05rem", color: "#e4e4e7", marginBottom: "1.5rem", whiteSpace: "pre-wrap" }}>
                      {post.comment}
                    </div>
                    {post.screenshot && (
                      <div style={{ width: "100%", borderRadius: "8px", overflow: "hidden", background: "rgba(0,0,0,0.5)" }}>
                        <img src={post.screenshot} alt="Evidence" style={{ width: "100%", height: "auto", display: "block" }} />
                      </div>
                    )}
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
