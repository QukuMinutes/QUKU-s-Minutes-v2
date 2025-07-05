// /api/get-projects.js

// 変更点: import文に変更
import { createClient } from '@supabase/supabase-js';

// Supabaseクライアントを初期化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// 変更点: export default function handler(...) に変更
export default async function handler(request, response) {
    if (request.method !== 'GET') {
        return response.status(405).send('Method Not Allowed');
    }

    try {
        // projects_masterテーブルからidとproject_nameを取得
        const { data, error } = await supabase
            .from('projects_master')
            .select('id, project_name');

        if (error) {
            throw error;
        }

        // 変更点: Vercel推奨のレスポンス形式に変更
        return response.status(200).json(data);
        
    } catch (error) {
        console.error('Error fetching projects:', error);
        return response.status(500).json({ message: 'Failed to fetch projects', error: error.message });
    }
}