const express = require('express');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// API to check session status
router.get('/api/session', (req, res) => {
    if (req.session && req.session.user) {
        res.json({
            loggedIn: true,
            username: req.session.user.username,
            genresCompleted: req.session.user.genresCompleted || false,
        });
    } else {
        res.json({
            loggedIn: false,
            genresCompleted: false,
        });
    }
});

// Signup route
const sanitizeHtml = require('sanitize-html');

router.post('/signup', async (req, res) => {
    let { user_username, user_email, user_password, terms } = req.body;

    const sanitizeInput = (input) => sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
    user_username = sanitizeInput(user_username);
    user_email = sanitizeInput(user_email);
    terms = sanitizeInput(terms);

    const handleError = (res, field, message, code = 400) => {
        return res.status(code).json({ field, error: message });
    };

    // Check for missing fields
    if (!user_username || !user_email || !user_password) {
        return handleError(res, 'all', 'All fields are required.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(user_email)) {
        return handleError(res, 'email', 'Invalid email format.');
    }

    // Validate username length
    if (user_username.length < 3 || user_username.length > 20) {
        return handleError(res, 'username', 'Username must be between 3 and 20 characters.');
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // At least 8 characters, 1 letter, 1 number
    if (!passwordRegex.test(user_password)) {
        return handleError(res, 'password', 'Password must be at least 8 characters with at least one letter and one number.');
    }

    // Validate terms acceptance
    if (!terms || terms !== 'on') {
        return handleError(res, 'terms', 'You must agree to the Terms and Privacy Policy.');
    }

    try {
        // Check for existing users by username or email
        const { data: existingUser } = await supabase
            .from("USERS")
            .select('user_id, user_email')
            .or(`user_email.eq.${user_email},user_username.eq.${user_username}`)
            .limit(1);

        if (existingUser && existingUser.length > 0) {
            const conflictField = existingUser[0].user_email === user_email ? 'email' : 'username';
            return handleError(res, conflictField, 'Email or username is already registered.');
        }

        // Hash password and insert new user
        const hashedPassword = await bcrypt.hash(user_password, 12);
        await supabase.from('USERS').insert([{ user_username, user_email, user_password: hashedPassword }]);

        return res.status(200).json({ success: true, redirect: '/login' });
    } catch (err) {
        console.error('Signup error: ', { email: user_email, username: user_username, error: err });
        return handleError(res, 'all', 'Server error. Please try again later.', 500);
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { user_email, user_password } = req.body;

    if (!user_email || !user_password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    try {
        const { data: user, error } = await supabase
            .from("USERS")
            .select('*')
            .eq('user_email', user_email)
            .single();

        if (error || !user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const match = await bcrypt.compare(user_password, user.user_password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Check if the user has completed onboarding
        const { data: genres } = await supabase
            .from("GENRE_PREFERENCES")
            .select('genre_selected')
            .eq('user_id', user.user_id);

        // Set session
        req.session.user = {
            id: user.user_id,
            username: user.user_username,
            email: user.user_email,
            genresCompleted: genres && genres.length >= 3,
        };

        if (!req.session.user.genresCompleted) {
            return res.status(200).json({ redirect: '/onboarding' });
        }

        res.status(200).json({ redirect: '/index' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Error logging out. Please try again.');
        }
        res.redirect('/login');
    });
});

module.exports = router;
