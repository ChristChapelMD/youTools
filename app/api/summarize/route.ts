import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

import { fetchTranscript } from '@/app/api/summarize/fetchTranscript';
import { summarizeTranscript } from '@/app/api/summarize/summarizeTranscript';
import { createClient } from '@/utils/supabase/server';

async function getYouTubeTranscript(video_id: string) {
  if (!video_id) {
    throw new Error('Invalid video URL or missing video ID');
  }

  try {
    const { title, transcript } = await fetchTranscript(video_id);

    return {
      title: title || 'Title not available',
      transcript: transcript?.join(' ') || 'Transcript not available',
    };
  } catch (error: any) {
    console.error('Error fetching transcript:', error.message);
    throw new Error('Failed to fetch transcript');
  }
}

// OPTIONS request for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', // Replace '*' with the Chrome extension origin for stricter security
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const video_id = searchParams.get('video_id') as string;
  const extension = searchParams.get('extension') === 'true';
  const save = searchParams.get('save') === 'true';

  const supabase = await createClient();
  let userId: string | null = null;

  try {
    // Extract or verify user token
    if (!extension) {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log(`Auth Response: user=${user}, error=${error}`);
    
      userId = user ? user.id : null;
    } else {
      const access_token = request.headers.get('Authorization')?.split('Bearer ')[1];

      console.log('Access Token:', access_token);
      
      if (!access_token) throw new Error('Missing access_token');
    
      const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
      try {
        const decodedToken = jwt.verify(access_token, JWT_SECRET);
        userId = decodedToken['sub'];
      } catch (error) {
        console.error('JWT Verification Error:', error);
        throw new Error('Invalid access_token');
      }
    }

    // Check if video exists in database
    const { data: videoData, error: videoError } = await supabase
      .from('videos')
      .select('id, title')
      .eq('video_id', video_id)
      .single();

      console.log("vidData", videoData)

    if (videoError) throw videoError;

    let videoIdInDb = videoData?.id;

    // Insert new video if not found
    if (!videoIdInDb) {
      const { title } = await getYouTubeTranscript(video_id);
      const { data: newVideo, error: insertVideoError } = await supabase
        .from('videos')
        .insert({ video_id, title })
        .select()
        .single();

      if (insertVideoError) throw insertVideoError;
      videoIdInDb = newVideo.id;
    }

    // Check for existing summary
    const { data: existingSummary } = await supabase
      .from('summaries')
      .select('id, content')
      .eq('video_id', videoIdInDb)
      .maybeSingle();

    if (existingSummary) {
      return new Response(JSON.stringify({
        title: videoData?.title,
        summary: existingSummary.content,
      }), { headers: { 'Content-Type': 'application/json' } });
    }

    // Generate new summary
    const { title, transcript } = await getYouTubeTranscript(video_id);
    const summaryContent = await summarizeTranscript(transcript);

    if (save) {
      await supabase.from('summaries').insert({
        video_id: videoIdInDb,
        user_id: userId,
        content: summaryContent,
      });
    }

    return new Response(JSON.stringify({ title, summary: summaryContent }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Error processing summary:', error.message, error.stack);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
