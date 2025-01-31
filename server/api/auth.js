

export const setRefreshToken = async (req, res) => {
  const { access_token, refresh_token } = req.body;

  res.setHeader('Set-Cookie', [
    `access_token=${access_token}; ` +
    'HttpOnly; ' +  // Makes cookie inaccessible to JavaScript
    'Secure; ' +  // Cookie is only sent over HTTPS
    'SameSite=Strict; ' +  // Prevents the cookie from being sent with requests to other sites
    'Path=/; ' +  // Cookie is only valid for the current path
    'Max-Age=3600; ' +  // Cookie expires in 1 hour
    'Expires=${new Date(Date.now() + 3600 * 1000).toUTCString()}'  // Set expiration date
  ]);

  res.status(200).json({ message: 'Refresh token set successfully' });
}

export const clearRefreshToken = async (req, res) => {
  res.setHeader('Set-Cookie', 'refresh_token=; HttpOnly; Secure; SameSite=Strict; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT');
  res.status(200).json({ message: 'Refresh token cleared successfully' });
}

