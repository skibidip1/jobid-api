const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Load jobs from file
function loadJobs() {
    try {
        const data = fs.readFileSync('jobs.json');
        return JSON.parse(data);
    } catch (err) {
        return {};
    }
}

// Save jobs to file
function saveJobs(jobs) {
    fs.writeFileSync('jobs.json', JSON.stringify(jobs, null, 2));
}

// POST webhook - Nhận JobId
app.post('/webhook/:category', (req, res) => {
    const jobs = loadJobs();
    const category = req.params.category;
    const { JobId } = req.body;

    if (!JobId) {
        return res.status(400).json({ error: 'JobId is required.' });
    }

    const timestamp = Math.floor(Date.now() / 1000);

    if (!jobs[category]) {
        jobs[category] = {};
    }
    jobs[category][JobId] = timestamp;
    saveJobs(jobs);

    res.json({ message: `JobId ${JobId} saved to ${category}.` });
});

// GET API - Lấy danh sách JobId
app.get('/JobId/:category', (req, res) => {
    const jobs = loadJobs();
    const category = req.params.category;

    if (!jobs[category]) {
        return res.status(404).json({ Amount: 0, JobId: [] });
    }

    const now = Math.floor(Date.now() / 1000);
    const activeJobs = Object.entries(jobs[category])
        .filter(([id, timestamp]) => now - timestamp <= 300) // 5 phút
        .map(([id, timestamp]) => ({ [id]: timestamp }));

    res.json({ Amount: activeJobs.length, JobId: activeJobs });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
