const express = require('express');
const router = express.Router();

const TEMPLATES = [
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    description: 'Clean and minimal dark theme',
    preview: {
      bg: '#0a0a0a',
      card: 'rgba(255,255,255,0.05)',
      accent: '#ffffff',
      text: '#ffffff',
      button: 'rgba(255,255,255,0.1)',
      glow: 'none',
      font: "'Inter', sans-serif",
    }
  },
  {
    id: 'neon-purple',
    name: 'Neon Purple',
    description: 'Vibrant purple neon glow',
    preview: {
      bg: '#0d0015',
      card: 'rgba(168,85,247,0.08)',
      accent: '#a855f7',
      text: '#e2d5f3',
      button: 'rgba(168,85,247,0.15)',
      glow: '0 0 30px rgba(168,85,247,0.3)',
      font: "'Inter', sans-serif",
    }
  },
  {
    id: 'cyber-blue',
    name: 'Cyber Blue',
    description: 'Futuristic cyber blue aesthetic',
    preview: {
      bg: '#000a14',
      card: 'rgba(56,189,248,0.06)',
      accent: '#38bdf8',
      text: '#d4eef9',
      button: 'rgba(56,189,248,0.12)',
      glow: '0 0 30px rgba(56,189,248,0.25)',
      font: "'Inter', sans-serif",
    }
  },
  {
    id: 'red-glow',
    name: 'Red Glow',
    description: 'Intense red glow effect',
    preview: {
      bg: '#0f0000',
      card: 'rgba(239,68,68,0.06)',
      accent: '#ef4444',
      text: '#fecaca',
      button: 'rgba(239,68,68,0.12)',
      glow: '0 0 30px rgba(239,68,68,0.25)',
      font: "'Inter', sans-serif",
    }
  },
  {
    id: 'glassmorphism',
    name: 'Glassmorphism',
    description: 'Frosted glass modern look',
    preview: {
      bg: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
      card: 'rgba(255,255,255,0.08)',
      accent: '#e2e8f0',
      text: '#e2e8f0',
      button: 'rgba(255,255,255,0.1)',
      glow: 'none',
      font: "'Inter', sans-serif",
      blur: '20px',
      border: '1px solid rgba(255,255,255,0.12)',
    }
  },
  {
    id: 'anime-night',
    name: 'Anime Night',
    description: 'Dark anime-inspired aesthetic',
    preview: {
      bg: '#0c0014',
      card: 'rgba(236,72,153,0.06)',
      accent: '#ec4899',
      text: '#fce7f3',
      button: 'rgba(236,72,153,0.12)',
      glow: '0 0 25px rgba(236,72,153,0.2)',
      font: "'Inter', sans-serif",
    }
  },
  {
    id: 'clean-creator',
    name: 'Clean Creator',
    description: 'Professional clean creator look',
    preview: {
      bg: '#111111',
      card: 'rgba(255,255,255,0.04)',
      accent: '#f59e0b',
      text: '#f3f4f6',
      button: 'rgba(245,158,11,0.1)',
      glow: 'none',
      font: "'Inter', sans-serif",
    }
  },
  {
    id: 'terminal-hacker',
    name: 'Terminal Hacker',
    description: 'Matrix-style terminal green',
    preview: {
      bg: '#000000',
      card: 'rgba(34,197,94,0.05)',
      accent: '#22c55e',
      text: '#22c55e',
      button: 'rgba(34,197,94,0.1)',
      glow: '0 0 20px rgba(34,197,94,0.2)',
      font: "'JetBrains Mono', 'Courier New', monospace",
    }
  },
  {
    id: 'soft-gradient',
    name: 'Soft Gradient',
    description: 'Soft warm gradient tones',
    preview: {
      bg: 'linear-gradient(135deg, #1a0a2e, #2d1b4e, #1a1a3e)',
      card: 'rgba(251,191,36,0.06)',
      accent: '#fbbf24',
      text: '#fef3c7',
      button: 'rgba(251,191,36,0.1)',
      glow: '0 0 20px rgba(251,191,36,0.15)',
      font: "'Inter', sans-serif",
    }
  },
  {
    id: 'black-luxury',
    name: 'Black Luxury',
    description: 'Premium black & gold luxury',
    preview: {
      bg: '#000000',
      card: 'rgba(212,175,55,0.05)',
      accent: '#d4af37',
      text: '#f5e6c8',
      button: 'rgba(212,175,55,0.1)',
      glow: '0 0 20px rgba(212,175,55,0.15)',
      font: "'Inter', sans-serif",
    }
  },
];

// GET /api/templates
router.get('/', (req, res) => {
  res.json({ templates: TEMPLATES });
});

module.exports = router;
