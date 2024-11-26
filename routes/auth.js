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
router.post('/signup', async (req, res) => {
    const { user_username, user_email, user_password } = req.body;

    if (!user_username || !user_email || !user_password) {
        return res.status(400).send('All fields are required.');
    }

    try {
        // Check for existing users by username or email
        const { data: existingUser } = await supabase
            .from("USERS")
            .select('user_id')
            .or(`user_email.eq.${user_email},user_username.eq.${user_username}`)
            .limit(1);

        if (existingUser && existingUser.length > 0) {
            return res.status(400).send('Email or username is already registered.');
        }

        // Hash password and insert new user
        const hashedPassword = await bcrypt.hash(user_password, 10);
        await supabase.from('USERS').insert([{ user_username, user_email, user_password: hashedPassword }]);

        res.redirect('/login');
    } catch (err) {
        console.error('Error during signup:', err);
        res.status(500).send('Server error. Please try again later.');
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { user_email, user_password } = req.body;

    if (!user_email || !user_password) {
        return res.status(400).send('Email and password are required.');
    }

    try {
        const { data: user, error } = await supabase
            .from("USERS")
            .select('*')
            .eq('user_email', user_email)
            .single();

        if (error || !user) {
            return res.status(401).send('Invalid email or password.');
        }

        const match = await bcrypt.compare(user_password, user.user_password);
        if (!match) {
            return res.status(401).send('Invalid email or password.');
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
            genresCompleted: genres && genres.length >= 3, // Set genresCompleted flag
        };

        // Redirect to appropriate page
        if (!req.session.user.genresCompleted) {
            return res.redirect('/onboarding');
        }

        res.redirect('/index');
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).send('Internal server error');
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
