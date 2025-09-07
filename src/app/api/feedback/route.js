export async function POST(request) {
  try {
    const body = await request.json();
    const { score, comment, timestamp } = body;

    // Validate required fields
    if (!score || typeof score !== 'number' || score < 1 || score > 5) {
      return Response.json(
        { error: 'Invalid rating score. Must be between 1 and 5.' },
        { status: 400 }
      );
    }

    if (!timestamp) {
      return Response.json(
        { error: 'Timestamp is required' },
        { status: 400 }
      );
    }

    // Insert feedback into Neon database
    await query(
      'INSERT INTO feedback (score, comment, timestamp) VALUES ($1, $2, $3)',
      [score, comment || '', timestamp]
    );
    return Response.json(
      { success: true, message: 'Feedback submitted successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error processing feedback:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}