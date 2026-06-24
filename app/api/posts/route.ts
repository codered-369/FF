import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

// Initialize Redis if the environment variables exist (from Vercel Integration)
const redis = (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) || 
              (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
  ? Redis.fromEnv()
  : null;

// Fallback in-memory storage for local testing before Redis is connected
let fallbackPosts: any[] = [];

export async function GET() {
  try {
    if (redis) {
      // Fetch from Redis database
      const posts = await redis.get('truthboard_posts');
      return NextResponse.json(posts || []);
    } else {
      // Fetch from local memory
      return NextResponse.json(fallbackPosts);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const newPost = {
      id: Date.now().toString(),
      username: data.username || 'Unknown',
      platform: data.platform || 'Other',
      comment: data.comment || '',
      screenshot: data.screenshot || null, // expects Base64 string
      date: new Date().toISOString()
    };

    if (redis) {
      // Save to Redis database
      let posts: any[] = (await redis.get('truthboard_posts')) || [];
      posts.unshift(newPost);
      
      // Keep only last 100 posts
      if (posts.length > 100) posts = posts.slice(0, 100);
      
      await redis.set('truthboard_posts', posts);
    } else {
      // Save to local memory fallback
      fallbackPosts.unshift(newPost);
      if (fallbackPosts.length > 100) fallbackPosts = fallbackPosts.slice(0, 100);
    }

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save post' }, { status: 500 });
  }
}
