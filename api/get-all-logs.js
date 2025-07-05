// /api/get-all-logs.js

// 変更点: import文に変更
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 変更点: export default function handler(...) に変更
export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).send('Method Not Allowed');
    }

    // 変更点: request.queryから取得
    const { projectId } = request.query;

    if (!projectId) {
        return response.status(400).send('Missing projectId parameter');
    }

    try {
        const { data, error } = await supabase
            .from('development_logs')
            .select('log_content')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        const allLogsText = data.map(log => log.log_content).join('\n\n---\n\n');

        // 変更点: Vercel推奨のレスポンス形式に変更
        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return response.status(200).send(allLogsText);
        
    } catch (error) {
        console.error('Error fetching all logs:', error);
        return response.status(500).send('Failed to fetch logs: ' + error.message);
    }
}