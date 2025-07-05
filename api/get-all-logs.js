// /api/get-all-logs.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).send('Method Not Allowed');
    }

    const { projectId } = request.query;

    if (!projectId) {
        return response.status(400).send('Missing projectId parameter');
    }

    try {
        // ★変更点： log_content に加えて created_at も取得する
        const { data, error } = await supabase
            .from('development_logs')
            .select('log_content, created_at') // ここ！
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        // ★変更点： 各ログの前に日付を付けて連結する
        const allLogsText = data.map(log => {
            // 日本時間（JST）に変換して、見やすい形式にフォーマット
            const jstDate = new Date(log.created_at).toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit', // ← これを追加！
                timeZone: 'Asia/Tokyo'
            });
            // 出力形式を「[YYYY/MM/DD HH:MM] ログ本文」のようにする
            return `[${jstDate}]\n${log.log_content}`;
        }).join('\n\n---\n\n'); // 各ログの区切り

        response.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return response.status(200).send(allLogsText);
        
    } catch (error) {
        console.error('Error fetching all logs:', error);
        return response.status(500).send('Failed to fetch logs: ' + error.message);
    }
}