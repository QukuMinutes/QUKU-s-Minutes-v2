// /api/save-log.js

// 変更点: import文に変更
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 変更点: export default function handler(...) に変更
export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).send('Method Not Allowed');
    }

    try {
        // 変更点: request.bodyから直接取得
        const { projectId, logContent } = request.body;

        if (!projectId || !logContent) {
            return response.status(400).json({ message: 'projectId and logContent are required' });
        }

        const { data, error } = await supabase
            .from('development_logs')
            .insert([
                { project_id: projectId, log_content: logContent }
            ]);

        if (error) {
            throw error;
        }

        return response.status(200).json({ message: 'Log saved successfully' });

    } catch (error) {
        console.error('Error saving log:', error);
        return response.status(500).json({ message: 'Failed to save log', error: error.message });
    }
}