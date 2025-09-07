// Utility functions for API calls
export async function submitFeedback(score, comment) {
  const res = await fetch('/api/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ score, comment }),
  });
  return res.json();
}

export async function submitCommunityDoubt(title, description) {
  const res = await fetch('/api/community', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, description }),
  });
  return res.json();
}
