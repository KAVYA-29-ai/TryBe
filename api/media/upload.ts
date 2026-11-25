import type { IncomingMessage, ServerResponse } from 'node:http';
import { createClient } from '@supabase/supabase-js';

const MAX_UPLOAD_BYTES = 30 * 1024 * 1024; // 30 MB

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

const ALLOWED_EXTS = new Set(['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'mov']);

function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage & { body?: unknown }): Promise<string | null> {
  if (req.body) {
    return Promise.resolve(
      typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    );
  }
  return new Promise(resolve => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => {
      size += c.length;
      if (size > MAX_UPLOAD_BYTES) {
        chunks.length = 0;
        resolve(null);
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', () => resolve(null));
  });
}

export default async function handler(
  req: IncomingMessage & { body?: unknown },
  res: ServerResponse,
) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    return send(res, 405, { error: 'method_not_allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !serviceKey) {
    return send(res, 503, { error: 'supabase_not_configured' });
  }

  const raw = await readBody(req);
  if (!raw) {
    return send(res, 413, { error: 'file_too_large' });
  }

  let body: {
    filename?: string;
    mimeType?: string;
    base64?: string;
    ownerId?: string;
  };

  try {
    body = JSON.parse(raw);
  } catch {
    return send(res, 400, { error: 'invalid_json' });
  }

  if (!body.base64 || !body.mimeType) {
    return send(res, 400, { error: 'missing_media_data' });
  }

  // Security Check: Validate media MIME type
  if (!ALLOWED_MIME.has(body.mimeType)) {
    return send(res, 400, { error: 'unsupported_media_type' });
  }

  try {
    const supabase = createClient<any>(supabaseUrl, serviceKey);
    const base64Data = body.base64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const isVideo = body.mimeType.startsWith('video/');
    const rawExt = (body.filename?.split('.').pop() || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    const ext = ALLOWED_EXTS.has(rawExt) ? rawExt : isVideo ? 'mp4' : 'png';
    const safeFilename = `upload_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storagePath = `posts/${safeFilename}`;

    const { error: uploadError } = await supabase.storage
      .from('post-media')
      .upload(storagePath, buffer, {
        contentType: body.mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('[MediaUpload] Storage error:', uploadError);
      return send(res, 500, { error: uploadError.message });
    }

    const { data: urlData } = supabase.storage
      .from('post-media')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    let assetId: string | null = null;
    if (body.ownerId) {
      const { data: assetData } = await supabase
        .from('media_assets')
        .insert({
          owner_id: body.ownerId,
          bucket: 'post-media',
          storage_path: storagePath,
          original_filename: body.filename || safeFilename,
          mime_type: body.mimeType,
          media_type: isVideo ? 'video' : 'image',
          size_bytes: buffer.length,
        })
        .select('id')
        .single();

      if (assetData) assetId = assetData.id;
    }

    return send(res, 200, {
      success: true,
      publicUrl,
      storagePath,
      assetId,
    });
  } catch (err) {
    console.error('[MediaUpload] Error:', err);
    return send(res, 500, { error: 'upload_failed' });
  }
}
