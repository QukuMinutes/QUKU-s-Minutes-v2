// /api/save-log.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { projectId, logContent } = JSON.parse(event.body);

        if (!projectId || !logContent) {
            return { statusCode: 400, body: JSON.stringify({ message: 'projectId and logContent are required' }) };
        }

        // development_logsテーブルに新しい行を挿入
        const { data, error } = await supabase
            .from('development_logs')
            .insert([
                { project_id: projectId, log_content: logContent }
            ]);

        if (error) {
            throw error;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Log saved successfully' })
        };
    } catch (error) {
        console.error('Error saving log:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to save log', error: error.message })
        };
    }
};