import pgConnection from './dbconnection';
interface AppSyncEvent {
    info: {
        fieldName: string
    }
    arguments: {
        meeting_id: string
    }
}
exports.handler = async (event: AppSyncEvent) => {
    let { pool } = await pgConnection();
    let { meeting_id } = event.arguments
    let result = await pool.query(
        `SELECT * FROM evs."MS_SCREENS" WHERE meeting_id = :meetingId AND is_deleted = false ORDER BY display_seq;`,
        {
            replacements: { meetingId: meeting_id },
        },
    );
    result = result.rows;
    let data = {
        statusCode: 200,
        body: result
    }
    return data
}