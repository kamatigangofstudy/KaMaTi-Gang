import { query } from '../../../utils/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { title, description } = body;
    if (!title || !description) {
      return Response.json({ error: 'Missing title or description' }, { status: 400 });
    }
    await query(
      'INSERT INTO community_doubt (title, description) VALUES ($1, $2)',
      [title, description]
    );
    return Response.json({ success: true, message: 'Doubt posted successfully' }, { status: 201 });
  } catch (error) {
    console.error('Error posting doubt:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
