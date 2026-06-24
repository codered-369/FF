import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { put, del } from '@vercel/blob';

// Initialize Redis
const redis = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) || 
              (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? Redis.fromEnv()
  : null;

let fallbackPosts: any[] = [];

export async function GET() {
  try {
    if (redis) {
      const posts = await redis.get('truthboard_posts');
      return NextResponse.json(posts || []);
    } else {
      return NextResponse.json(fallbackPosts);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const username = formData.get('username') as string;
    const platform = formData.get('platform') as string;
    const comment = formData.get('comment') as string;
    const file = formData.get('screenshot') as File | null;

    let screenshotUrl = null;

    if (file && file.size > 0) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(file.name, file, { access: 'public' });
        screenshotUrl = blob.url;
      } else {
        console.warn("Vercel Blob not connected. Image upload skipped.");
      }
    }

    const newPost = {
      id: Date.now().toString(),
      username: username || 'Unknown',
      platform: platform || 'Other',
      comment: comment || '',
      screenshot: screenshotUrl,
      date: new Date().toISOString()
    };

    if (redis) {
      let posts: any[] = (await redis.get('truthboard_posts')) || [];
      posts.unshift(newPost);
      if (posts.length > 1000) posts = posts.slice(0, 1000);
      await redis.set('truthboard_posts', posts);
    } else {
      fallbackPosts.unshift(newPost);
      if (fallbackPosts.length > 1000) fallbackPosts = fallbackPosts.slice(0, 1000);
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error("Post error:", error);
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, password } = await request.json();

    // Check if the provided password matches the Vercel Environment Variable
    // If running locally without .env, we can fallback to "admin123" for testing
    const correctPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (password !== correctPassword) {
      return NextResponse.json({ error: 'Unauthorized. Wrong password.' }, { status: 401 });
    }

    if (redis) {
      let posts: any[] = (await redis.get('truthboard_posts')) || [];
      const postToDelete = posts.find(p => p.id === id);
      
      if (!postToDelete) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      }

      // If it has a screenshot, delete it from Vercel Blob to save space
      if (postToDelete.screenshot && process.env.BLOB_READ_WRITE_TOKEN) {
        try {
          await del(postToDelete.screenshot);
        } catch (e) {
          console.error("Failed to delete blob:", e);
        }
      }

      posts = posts.filter(p => p.id !== id);
      await redis.set('truthboard_posts', posts);
    } else {
      const postToDelete = fallbackPosts.find(p => p.id === id);
      if (!postToDelete) return NextResponse.json({ error: 'Post not found' }, { status: 404 });
      
      fallbackPosts = fallbackPosts.filter(p => p.id !== id);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
  }
}
