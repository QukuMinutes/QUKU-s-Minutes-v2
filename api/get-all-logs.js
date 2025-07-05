// /api/get-all-logs.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'GET') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    const projectId = event.queryStringParameters.projectId;

    if (!projectId) {
        return { statusCode: 400, body: 'Missing projectId parameter' };
    }

    try {
        // development_logsテーブルから指定されたproject_idのログを全て取得
        // created_atで昇順（古い順）にソート
        const { data, error } = await supabase
            .from('development_logs')
            .select('log_content')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (error) {
            throw error;
        }

        // 取得したログのlog_contentを連結
        const allLogsText = data.map(log => log.log_content).join('\n\n---\n\n');

        return {
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            body: allLogsText
        };
    } catch (error) {
        console.error('Error fetching all logs:', error);
        return {
            statusCode: 500,
            body: 'Failed to fetch logs: ' + error.message
        };
    }
};