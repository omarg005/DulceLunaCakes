module.exports = (req, res) => {
  res.status(200).json({ 
    message: 'Hello from Vercel!', 
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing'
    }
  });
};
