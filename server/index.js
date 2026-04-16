import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomUUID } from 'crypto';
import { generateLatex } from './latex-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Paths
const DB_PATH = join(__dirname, 'db.json');
const OUTPUT_DIR = join(__dirname, 'output');
const TEMP_DIR = join(__dirname, 'temp');

// Ensure directories exist
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });
if (!existsSync(TEMP_DIR)) mkdirSync(TEMP_DIR, { recursive: true });

// Serve compiled PDFs
app.use('/output', express.static(OUTPUT_DIR));

// --- DATA API ---

function readDB() {
  return JSON.parse(readFileSync(DB_PATH, 'utf-8'));
}

function writeDB(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Get all data
app.get('/api/data', (req, res) => {
  try {
    const data = readDB();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get specific section
app.get('/api/data/:section', (req, res) => {
  try {
    const data = readDB();
    const section = data[req.params.section];
    if (section === undefined) {
      return res.status(404).json({ error: 'Section not found' });
    }
    res.json(section);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update personal info or education (non-array sections)
app.put('/api/data/:section', (req, res) => {
  try {
    const data = readDB();
    const section = req.params.section;
    if (section !== 'personalInfo' && section !== 'education') {
      return res.status(400).json({ error: 'Use PUT /:section/:id for array sections' });
    }
    data[section] = { ...data[section], ...req.body };
    writeDB(data);
    res.json(data[section]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add item to array section
app.post('/api/data/:section', (req, res) => {
  try {
    const data = readDB();
    const section = req.params.section;
    if (!Array.isArray(data[section])) {
      return res.status(400).json({ error: 'Section is not an array' });
    }
    const newItem = { ...req.body, id: req.body.id || randomUUID() };
    data[section].push(newItem);
    writeDB(data);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item in array section
app.put('/api/data/:section/:id', (req, res) => {
  try {
    const data = readDB();
    const section = req.params.section;
    if (!Array.isArray(data[section])) {
      return res.status(400).json({ error: 'Section is not an array' });
    }
    const idx = data[section].findIndex(item => item.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    data[section][idx] = { ...data[section][idx], ...req.body, id: req.params.id };
    writeDB(data);
    res.json(data[section][idx]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete item from array section
app.delete('/api/data/:section/:id', (req, res) => {
  try {
    const data = readDB();
    const section = req.params.section;
    if (!Array.isArray(data[section])) {
      return res.status(400).json({ error: 'Section is not an array' });
    }
    const idx = data[section].findIndex(item => item.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const removed = data[section].splice(idx, 1)[0];
    writeDB(data);
    res.json(removed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COMPILE API ---

app.post('/api/compile', (req, res) => {
  try {
    const data = readDB();
    const selection = req.body;

    // Generate LaTeX
    const latex = generateLatex(data, selection);

    // Create temp directory for this compilation
    const buildId = randomUUID().slice(0, 8);
    const buildDir = join(TEMP_DIR, buildId);
    mkdirSync(buildDir, { recursive: true });

    const texFile = join(buildDir, 'resume.tex');
    writeFileSync(texFile, latex);

    // Compile with pdflatex (run twice for references)
    try {
      execSync(`pdflatex -interaction=nonstopmode -output-directory="${buildDir}" "${texFile}"`, {
        timeout: 30000,
        stdio: 'pipe'
      });
      // Second pass for any cross-references
      execSync(`pdflatex -interaction=nonstopmode -output-directory="${buildDir}" "${texFile}"`, {
        timeout: 30000,
        stdio: 'pipe'
      });
    } catch (compileErr) {
      // Check if PDF was still generated despite warnings
      const pdfPath = join(buildDir, 'resume.pdf');
      if (!existsSync(pdfPath)) {
        const logFile = join(buildDir, 'resume.log');
        let logContent = '';
        try { logContent = readFileSync(logFile, 'utf-8').slice(-2000); } catch (e) {}
        return res.status(400).json({
          error: 'LaTeX compilation failed',
          log: logContent,
          latex: latex
        });
      }
    }

    // Copy PDF to output
    const pdfSrc = join(buildDir, 'resume.pdf');
    const outputName = `resume_${buildId}.pdf`;
    const pdfDest = join(OUTPUT_DIR, outputName);
    copyFileSync(pdfSrc, pdfDest);

    res.json({
      success: true,
      pdfUrl: `/output/${outputName}`,
      latex: latex
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Download endpoint
app.get('/api/download/:filename', (req, res) => {
  const filePath = join(OUTPUT_DIR, req.params.filename);
  if (!existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.download(filePath, 'Ahmed_Fathy_Resume.pdf');
});

app.listen(PORT, () => {
  console.log(`🚀 CV Builder API running at http://localhost:${PORT}`);
});
