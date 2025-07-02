// Setup environment variables
import dotenv from "dotenv";
dotenv.config();

// Import necessary modules
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import morgan from "morgan";
import { db } from './db/index.js';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import crypto from "crypto";
import nodemailer from "nodemailer";
import helmet from "helmet";
import { Filter } from 'bad-words'
import { ensureAuthenticated, ensureAdmin } from './AdminAuth.js';

// Initialize filter for bad words
const filter = new Filter();

// Express application setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const saltRounds = 10;

// Middlewares
app.use(morgan("dev"));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// CORS setup with allowed origins
const corsOptions = {
  origin: (origin, callback) => {
    const whitelist = ['http://localhost:5173'];
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
  ,
  credentials: true
};
app.use(cors(corsOptions));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 30 * 60 * 1000,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  }
}));

// Passport setup
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

const router = express.Router();
app.use('/', router);

// Passport authentication strategy
passport.use(
  new LocalStrategy(
    {
      username: 'email',
      password: 'password',
    },
    async function verify(email, password, cb) {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
          return cb(null, false, { message: "User not found. Please try again!" });
        }

        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password);

        if (match) {
          return cb(null, user, { message: "Welcome back, book lover!" });
        } else {
          return cb(null, false, { message: "Incorrect username or password." });
        }
      } catch (err) {
        console.error(err);
        return cb(err);
      }
    }
  )
);

// Serialize and deserialize user for sessions
passport.serializeUser((user, cb) => {
  cb(null, user.id);
});


passport.deserializeUser(async (id, cb) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    if (result.rows.length === 0) return cb(null, false);
    cb(null, result.rows[0]);
  } catch (err) {
    cb(err);
  }
});

// Get books with images and average rating based on status
const getBooksWithImages = async (status) => {
  const result = await db.query(`
    SELECT 
      h.id,
      h.book_title,
      h.book_description,
      h.status,
      i.book_cover,
      ROUND(AVG(ubr.rating)::numeric, 1) AS average_rating
    FROM havereadbooks h
    LEFT JOIN images i ON h.id = i.image_id
    LEFT JOIN user_book_ratings ubr ON h.id = ubr.book_id
    WHERE h.status = $1
    GROUP BY h.id, h.book_title, h.book_description, h.status, i.book_cover
    ORDER BY h.id
  `, [status]);

  const books = result.rows.map((book) => ({
    ...book,
    image: book.book_cover
      ? `data:image/jpeg;base64,${book.book_cover.toString('base64')}`
      : null,
    averageRating: book.average_rating || null,
  }));

  return books;
};


async function getBookDescription(bookId) {
  try {
    const query = 'SELECT book_description FROM havereadbooks WHERE id = $1';
    const result = await db.query(query, [bookId]);
    return result.rows[0]?.book_description || '';
  } catch (error) {
    console.error('Error fetching book description:', error);
    throw error;
  }
}

async function cleanAdLinksInDatabase() {
  try {
    const result = await db.query("SELECT id, link FROM book_ads");

    for (const row of result.rows) {
      const cleanedLink = sanitizeUrl(row.link);
      if (cleanedLink !== row.link) {
        await db.query("UPDATE book_ads SET link = $1 WHERE id = $2", [cleanedLink, row.id]);
        console.log(`Cleaned ad link for ad id ${row.id}`);
      }
    }

    console.log(" Ad links cleaned in database.");
  } catch (err) {
    console.error(" Failed to clean ad links:", err);
  }
}


function sanitizeUrl(url) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname === 'www.google.com' && parsedUrl.pathname === '/url') {
      const params = new URLSearchParams(parsedUrl.search);
      const actualUrl = params.get('url') || params.get('q');
      return actualUrl || url;
    }

    return url;
  } catch {
    return url;
  }
}


async function updateBookDescription(bookId, description) {
  const query = 'UPDATE havereadbooks SET book_description = $1 WHERE id = $2';
  await db.query(query, [description, bookId]);
}

// Request to update a book's description (only admin allowed)
router.put('/books/:id/description', ensureAdmin, async (req, res) => {
  const bookId = req.params.id;
  const { description } = req.body;

  try {
    await updateBookDescription(bookId, description);
    res.status(200).json({ message: 'Book description updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update description.' });
  }
});

// Check if the user is an admin
app.get('/api/check-admin', (req, res) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return res.json({ isAdmin: true });
  }
  res.json({ isAdmin: false });
});

// Check if the user is authenticated
app.get('/api/check-user', (req, res) => {
  if (req.isAuthenticated()) {
    return res.json({ isUser: true });
  }
  res.json({ isUser: false });

});

// Fetch comments for a specific book
app.get('/comments/:id', async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  if (isNaN(bookId)) return res.status(400).send("Invalid book ID");

  const client = await db.connect();

  try {
    const bookResult = await client.query(
      `SELECT h.*, i.book_cover
       FROM havereadbooks h
       LEFT JOIN images i ON h.id = i.image_id
       WHERE h.id = $1`,
      [bookId]
    );

    const book = bookResult.rows[0];
    if (!book) return res.status(404).send("Book not found");

    const image = book.book_cover
      ? `data:image/jpeg;base64,${book.book_cover.toString("base64")}`
      : null;

    const avgResult = await client.query(
      `SELECT AVG(rating)::numeric(3,2) AS average_rating
       FROM user_book_ratings
       WHERE book_id = $1`,
      [bookId]
    );

    res.json({
      id: book.id,
      book_title: book.book_title,
      image,
      averageRating: avgResult.rows[0]?.average_rating || null
    });
  } catch (err) {
    console.error("Error in /comments/:id:", err);
    res.status(500).send("Internal Server Error");
  } finally {
    client.release();
  }
});

// Fetch advertisements and sanitize the links
app.get('/api/ads', async (req, res) => {
  try {
    const getAdsData = await db.query("SELECT * FROM book_ads");
    const sanitizedAds = getAdsData.rows.map(ad => ({
      ...ad,
      link: sanitizeUrl(ad.link),
    }));

    res.json(sanitizedAds);
  } catch (err) {
    console.error("Failed to fetch ads:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fetch past books
app.get('/pastBooks', async (req, res) => {
  try {
    const books = await getBooksWithImages('past');
    res.json(books);
  } catch (err) {
    console.error('Error fetching past books:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch books being read currently
app.get('/presentBooks', async (req, res) => {
  try {
    const books = await getBooksWithImages('present');
    res.json(books);
  } catch (err) {
    console.error('Error fetching present books:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch books planned for future reading
app.get('/futureBooks', async (req, res) => {
  try {
    const books = await getBooksWithImages('future');
    res.json(books);
  } catch (err) {
    console.error('Error fetching future books:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch a specific book by id
app.get('/book/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(`
            SELECT h.*, i.book_cover
            FROM havereadbooks h
            LEFT JOIN images i ON h.id = i.image_id
            WHERE h.id = $1
        `, [id]);

    if (result.rows.length > 0) {
      const book = result.rows[0];
      if (book.book_cover) {
        const imageBuffer = Buffer.from(book.book_cover, 'binary');
        res.set('Content-Type', 'image/jpeg');
        res.set('Content-Length', imageBuffer.length);
        res.send(imageBuffer);
      } else {
        res.status(404).send('Image not found');
      }
    } else {
      res.status(404).send('Book not found');
    }
  } catch (err) {
    console.error('Error retrieving book image:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Fetch a specific book description by id
app.get('/api/book/:id/description', async (req, res) => {
  const bookId = parseInt(req.params.id, 10);
  if (isNaN(bookId)) {
    return res.status(400).json({ error: 'Invalid book ID' });
  }

  try {
    const description = await getBookDescription(bookId);
    if (!description) {
      return res.status(404).json({ error: 'Description not found' });
    }
    res.json({ description });
  } catch (error) {
    console.error('Error fetching description:', error);
    res.status(500).json({ error: 'Failed to fetch description' });
  }
});

// Fetch all book comments
app.get('/comments/:id/all', async (req, res) => {
  const bookId = parseInt(req.params.id, 10);

  try {
    const result = await db.query(
      `SELECT c.comment, c.created_at, u.username , r.rating
       FROM userComments c 
       JOIN users u ON c.user_id = u.id
       JOIN user_book_ratings r ON r.user_id = c.user_id AND r.book_id = c.book_id
       WHERE c.book_id = $1
       ORDER BY c.created_at DESC`,
      [bookId]
    );
    filter.clean();
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching comments:", err);
    res.status(500).send("Failed to fetch comments");
  }
});

// Check if a user is authenticated
app.get('/api/check-auth', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ authenticated: true, user: req.user });
  } else {
    res.json({ authenticated: false });
  }
});

// Register a new user
app.post('/register', async (req, res) => {
  const { email, username, password } = req.body;

  try {
    const checkEmailResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    const checkUsernameResult = await db.query("SELECT * FROM users WHERE username = $1", [username]);

    if (checkEmailResult.rows.length > 0) {
      return res.status(400).send("Email already exists. Try logging in.");
    }

    if (checkUsernameResult.rows.length > 0) {
      return res.status(400).send("Username already exists. Choose a different one.");
    }

    const hash = await bcrypt.hash(password, saltRounds);

    await db.query(
      "INSERT INTO users (email, username, password, role) VALUES ($1, $2, $3, $4)",
      [email, username, hash, 'user']
    );

    res.status(201).send("User registered successfully");
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send("Something went wrong");
  }
});

// Login route
app.post('/login', (req, res, next) => {
  console.log('Login Request Body:', req.body);

  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);

    if (!user) {
      return res.status(401).json({ message: info?.message || "Login failed" });
    }

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.status(200).send("Welcome , our dear book lover!");
    });
  })(req, res, next);
});

// Logout route
app.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).send("Logout error");

    req.session.destroy(err => {
      if (err) return res.status(500).send("Session destroy error");

      res.clearCookie("connect.sid");
      res.status(200).json({ message: "You have successfully logged out." });
    });
  });
});

// Send a password reset link to a user's email.
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "No account with that email." });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString("hex");
    const expiration = new Date(Date.now() + 3600000);

    await db.query(
      "UPDATE users SET reset_token = $1, token_expiration = $2 WHERE email = $3",
      [token, expiration, email]
    );

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"BooksIRead App" <${process.env.EMAIL_USER}>`,
      to: ["booksiread88@gmail.com",],
      subject: "Password Reset",
      html: `
          <p>Click the link below to reset your password:</p>
          <a href="${resetLink}">${resetLink}</a>
          <p>This link expires in 1 hour.</p>
        `,
    };

    await transporter.sendMail(mailOptions);

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// Validate the token sent in the reset link (used by frontend before allowing password reset).
app.post("/api/auth/validate-reset-token", async (req, res) => {
  const { token } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE reset_token = $1 AND token_expiration > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.json({ valid: false });
    }

    res.json({ valid: true });
  } catch (err) {
    res.status(500).json({ valid: false });
  }
});

// Update the user's password using the token and new password.
app.post("/api/auth/reset-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    const result = await db.query(
      "SELECT * FROM users WHERE reset_token = $1 AND token_expiration > NOW()",
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "UPDATE users SET password = $1, reset_token = NULL, token_expiration = NULL WHERE reset_token = $2",
      [hashedPassword, token]
    );

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});

// Add a comment and rating for a book
app.post('/comments', async (req, res) => {
  const { bookId, comment, rating } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).send("Unauthorized");

  if (filter.isProfane(comment)) {
    return res.status(400).json({ error: 'Inappropriate language discovered' });
  }

  const cleanComment = filter.clean(comment);
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO userComments (book_id, user_id, comment)
       VALUES ($1, $2, $3)`,
      [bookId, userId, cleanComment]
    );

    await client.query(
      `INSERT INTO user_book_ratings (book_id, user_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (book_id, user_id)
       DO UPDATE SET rating = EXCLUDED.rating`,
      [bookId, userId, rating]
    );

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: "Comment and rating saved" });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error("Error saving comment and rating:", err);
    res.status(500).send("Failed to save comment and rating");
  } finally {
    client.release();
  }
});

// Admin route to add a new book
app.post('/admin/add-book', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const { title, description, rating, status, imageBase64 } = req.body;

  const client = await db.connect();

  try {
    await client.query('BEGIN');

    console.log('Received book:', { title, description, rating, status });
    console.log('Image base64 (first 100 chars):', imageBase64?.slice(0, 100));

    const bookResult = await client.query(
      'INSERT INTO havereadbooks (book_title, book_description, status) VALUES ($1, $2, $3) RETURNING id',
      [title, description, status]
    );
    const bookId = bookResult.rows[0].id;

    await client.query(
      'INSERT INTO user_book_ratings (book_id, rating) VALUES ($1, $2)',
      [bookId, rating]
    );

    const imageBuffer = Buffer.from(imageBase64, 'base64');
    await client.query(
      'INSERT INTO images (book_cover, image_id) VALUES ($1, $2)',
      [imageBuffer, bookId]
    );

    await client.query('COMMIT');
    res.status(201).json({ message: 'Book, rating, and image added successfully' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in /admin/add-book:', error);
    res.status(500).json({ error: 'Failed to add book and related data' });
  } finally {
    client.release();
  }
});

// Move a book to "Past" status
app.post('/moveToPast', async (req, res) => {
  const { bookId } = req.body;
  if (isNaN(bookId)) {
    return res.status(400).send('Invalid book ID');
  }
  try {
    await db.query('UPDATE havereadbooks SET status = $1 WHERE id = $2', ['past', bookId]);
    res.status(200).send('Book moved to past');
  } catch (err) {
    console.error('Error moving book to past:', err);
    res.status(500).send('Error moving book to past');
  }
});

// Move a book to "Present" status
app.post('/moveToPresent', async (req, res) => {
  const { bookId } = req.body;
  if (isNaN(bookId)) {
    return res.status(400).send('Invalid book ID');
  }
  try {
    await db.query('UPDATE havereadbooks SET status = $1 WHERE id = $2', ['present', bookId]);
    res.status(200).send('Book moved to present');
  } catch (err) {
    console.error('Error moving book to present:', err);
    res.status(500).send('Error moving book to present');
  }
});

// Admin route to delete a book
app.delete('/admin/delete-book/:id', ensureAuthenticated, ensureAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM images WHERE image_id = $1', [id]);
    const result = await db.query('DELETE FROM havereadbooks WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.status(200).json({ message: 'Book and image deleted successfully' });
  } catch (error) {
    console.error('Error in /admin/delete-book:', error);
    res.status(500).json({ error: 'Failed to delete book and image' });
  }
});


const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

