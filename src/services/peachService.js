export const getPeachToken = async () => {
  const res = await fetch(
    "https://pjxhbjaqtwjmbqfpurcp.supabase.co/functions/v1/get-peach-token",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqeGhiamFxdHdqbWJxZnB1cmNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxODQ4MTIsImV4cCI6MjA3MTc2MDgxMn0.h2jYfA6Y9FRAFG2s3-J8C4qTOOVALHtJ9H8PNw0jqZE",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Peach token");
  }

  const data = await res.json();
  return data.access_token;
};
