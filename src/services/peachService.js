export const getPeachToken = async () => {
  const res = await fetch(
    "https://pjxhbjaqtwjmbqfpurcp.supabase.co/functions/v1/get-peach-token",
    {
      method: "POST",
      headers: {
        Authorization: "Bearer YOUR_ANON_KEY",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch Peach token");
  }

  const data = await res.json();
  return data.access_token;
};
