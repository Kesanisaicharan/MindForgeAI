const supabaseUrl = () => (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const supabaseKey = () => process.env.SUPABASE_ANON_KEY || '';

export const requireAuth = async (req, res, next) => {
    const token = req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7).trim()
        : '';
    if (!token || !supabaseUrl() || !supabaseKey()) {
        return res.status(401).json({ success: false, error: 'Sign in is required.' });
    }
    try {
        const response = await fetch(`${supabaseUrl()}/auth/v1/user`, {
            headers: { apikey: supabaseKey(), Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return res.status(401).json({ success: false, error: 'Invalid or expired session.' });
        const user = await response.json();
        if (!user?.id) return res.status(401).json({ success: false, error: 'Invalid session.' });
        req.user = user;
        next();
    } catch (error) {
        console.error('Authentication verification failed:', error.message);
        return res.status(503).json({ success: false, error: 'Authentication service is unavailable.' });
    }
};

export const requireTeacher = (req, res, next) => {
    const configuredTeachers = (process.env.TEACHER_USER_IDS || '').split(',').map(id => id.trim()).filter(Boolean);
    const metadataRole = req.user?.app_metadata?.role;
    if (metadataRole !== 'teacher' && !configuredTeachers.includes(req.user?.id)) {
        return res.status(403).json({ success: false, error: 'Teacher access is required.' });
    }
    next();
};
