// Verifies the Supabase access token when SUPABASE_URL and SUPABASE_ANON_KEY are configured.
// Without them the API keeps its previous behaviour (client-supplied userId) so existing deployments do not break.
export const authConfigured = () => Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

export async function authenticate(req, _res, next) {
    req.user = null;
    const token = (req.headers.authorization || '').replace(/^Bearer /, '');
    if (token && authConfigured()) {
        try {
            const r = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: process.env.SUPABASE_ANON_KEY } });
            if (r.ok) { const u = await r.json(); req.user = { id: u.id, email: u.email }; }
        } catch (err) { console.warn('Auth check failed:', err.message); }
    }
    next();
}

// Returns the trusted user id, or null when auth is configured but the caller is not signed in.
export const resolveUserId = (req, claimed) => (req.user ? req.user.id : authConfigured() ? null : claimed || null);
