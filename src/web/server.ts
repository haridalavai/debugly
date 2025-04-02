import express from 'express';
import path from 'path';

const app = express();
const PORT = 3000;

// In-memory storage for errors and suggestions
const errors: { id: number; error: string; suggestion: string }[] = [];

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to fetch errors
app.get('/api/errors', (req, res) => {
    res.json(errors);
});

// Add a new error (for testing purposes)
app.post('/api/errors', express.json(), (req, res) => {
    const { error, suggestion } = req.body;
    const id = errors.length + 1;
    errors.push({ id, error, suggestion });
    res.status(201).json({ id });
});

// Export the server start function
export function startServer() {
    app.listen(PORT, () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}