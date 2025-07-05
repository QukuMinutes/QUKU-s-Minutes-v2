// /api/get-projects.js

const { createClient } = require('@supabase/supabase-js');

// Supabaseクライアントを初期化
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        // projects_masterテーブルからidとproject_nameを取得
        const { data, error } = await supabase
            .from('projects_master')
            .select('id, project_name');

        if (error) {
            throw error;
        }

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        };
    } catch (error) {
        console.error('Error fetching projects:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to fetch projects', error: error.message })
        };
    }
};