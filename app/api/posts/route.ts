import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { put } from '@vercel/blob';

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

    // Check if there is a file and Vercel Blob is configured
    if (file && file.size > 0) {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        // Upload to Vercel Blob
        const blob = await put(file.name, file, { access: 'public' });
        screenshotUrl = blob.url;
      } else {
        // Fallback: If blob is not set up, just ignore the image to save space,
        // or you could optionally fallback to base64 for local dev.
        console.warn("Vercel Blob not connected. Image upload skipped.");
      }
    }

    const newPost = {
      id: Date.now().toString(),
      username: username || 'Unknown',
      platform: platform || 'Other',
      comment: comment || '',
      screenshot: screenshotUrl, // Now saving a short URL instead of massive base64
      date: new Date().toISOString()
    };

    if (redis) {
      let posts: any[] = (await redis.get('truthboard_posts')) || [];
      posts.unshift(newPost);
      
      // We can easily store 10,000+ posts now, but let's cap at 1000 for safety
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
