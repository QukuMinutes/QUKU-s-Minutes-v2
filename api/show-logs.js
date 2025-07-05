import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// HTMLエスケープ用のヘルパー関数
const escapeHtml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
};

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).send('Method Not Allowed');
    }

    const { projectId } = request.query;

    if (!projectId) {
        return response.status(400).send('Missing projectId parameter');
    }

    try {
        const { data, error } = await supabase
            .from('development_logs')
            .select('log_content, created_at')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const allLogsText = data.map(log => {
            const jstDate = new Date(log.created_at).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Tokyo'
            });
            return `[${jstDate}]\n${log.log_content}`;
        }).join('\n\n---\n\n');

        // HTMLとして返す
        const htmlContent = `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>プロジェクト議事録 (ID: ${projectId})</title>
    <style>
        body { font-family: sans-serif; line-height: 1.6; background-color: #111; color: #eee; margin: 2em; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    <pre>${escapeHtml(allLogsText)}</pre>
</body>
</html>
        `;

        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        return response.status(200).send(htmlContent);

    } catch (error) {
        console.error('Error rendering log page:', error);
        return response.status(500).send('Failed to render log page: ' + error.message);
    }
} 