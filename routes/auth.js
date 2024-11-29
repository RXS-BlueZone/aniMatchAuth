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

    // Helper to sanitize input
    const sanitizeInput = (input) => sanitizeHtml(input, { allowedTags: [], allowedAttributes: {} });
    user_username = sanitizeInput(user_username);
    user_email = sanitizeInput(user_email);
    terms = sanitizeInput(terms);

    const errors = []; // Collect all validation errors

    // Check for missing fields
    if (!user_username) {
        errors.push({ field: 'username', error: 'Username is required.' });
    }

    if (!user_email) {
        errors.push({ field: 'email', error: 'Email is required.' });
    }

    if (!user_password) {
        errors.push({ field: 'password', error: 'Password is required.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (user_email && !emailRegex.test(user_email)) {
        errors.push({ field: 'email', error: 'Invalid email format.' });
    }

    // Validate username length
    if (user_username && (user_username.length < 3 || user_username.length > 20)) {
        errors.push({ field: 'username', error: 'Username must be between 3 and 20 characters.' });
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/; // At least 8 characters, 1 letter, 1 number
    if (user_password && !passwordRegex.test(user_password)) {
        errors.push({
            field: 'password',
            error: 'Password must be at least 8 characters with at least one letter and one number.',
        });
    }

    // Validate terms acceptance
    if (!terms || terms !== 'on') {
        errors.push({ field: 'terms', error: 'You must agree to the Terms and Privacy Policy.' });
    }

    // Return all validation errors
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }

    try {
        // Check for existing users by username or email
        const { data: existingUsers } = await supabase
            .from('USERS')
            .select('user_username, user_email')
            .or(`user_email.eq.${user_email},user_username.eq.${user_username}`);

        if (existingUsers.length > 0) {
            const conflictField = existingUsers.some(user => user.user_email === user_email) ? 'email' : 'username';
            errors.push({ field: conflictField, error: `${conflictField} is already registered.` });
            return res.status(400).json({ errors });
        }

        // Hash password and insert new user
        const hashedPassword = await bcrypt.hash(user_password, 12);
        await supabase.from('USERS').insert([{ user_username, user_email, user_password: hashedPassword }]);

        return res.status(200).json({ success: true, redirect: '/login' });
    } catch (err) {
        console.error('Signup error: ', { email: user_email, username: user_username, error: err });
        return res.status(500).json({
            errors: [{ field: 'all', error: 'Server error. Please try again later.' }],
        });
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
