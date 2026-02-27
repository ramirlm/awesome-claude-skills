'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Resolve the root of the skills repo (one level up from api/)
const SKILLS_ROOT = path.resolve(__dirname, '../../../');

// Allow-list of valid skill directory names (no dynamic enumeration at request time)
const ALLOWED_SKILLS = [
  'artifacts-builder',
  'brand-guidelines',
  'canvas-design',
  'changelog-generator',
  'connect',
  'content-research-writer',
  'developer-growth-analysis',
  'internal-comms',
  'langsmith-fetch',
  'mcp-builder',
  'skill-creator',
  'skill-share',
  'template-skill',
  'theme-factory',
  'twitter-algorithm-optimizer',
  'webapp-testing',
];

/**
 * Parse YAML front-matter from a SKILL.md string.
 * Returns { name, description, license, body }.
 */
function parseFrontMatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { name: null, description: null, license: null, body: raw.trim() };

  const yamlBlock = match[1];
  const body = match[2].trim();

  const get = (key) => {
    const re = new RegExp(`^${key}:\\s*(.+)$`, 'm');
    const m = yamlBlock.match(re);
    return m ? m[1].trim() : null;
  };

  return {
    name: get('name'),
    description: get('description'),
    license: get('license'),
    body,
  };
}

/**
 * Build a summary object for a skill from its SKILL.md.
 */
function buildSkillSummary(skillName) {
  const skillDir = path.join(SKILLS_ROOT, skillName);
  const skillFile = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(skillFile)) return null;

  const raw = fs.readFileSync(skillFile, 'utf8');
  const { name, description, license } = parseFrontMatter(raw);

  return {
    id: skillName,
    name: name || skillName,
    description: description || null,
    license: license || null,
  };
}

// GET /api/skills — list all curated skills (summary)
router.get('/', (_req, res) => {
  const skills = ALLOWED_SKILLS.map(buildSkillSummary).filter(Boolean);
  res.json({ total: skills.length, skills });
});

// GET /api/skills/:name — get full detail for one skill
router.get('/:name', (req, res) => {
  const { name } = req.params;

  // Reject any name not in the explicit allow-list (prevents path traversal)
  if (!ALLOWED_SKILLS.includes(name)) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  const skillDir = path.join(SKILLS_ROOT, name);
  const skillFile = path.join(skillDir, 'SKILL.md');

  if (!fs.existsSync(skillFile)) {
    return res.status(404).json({ error: 'Skill not found' });
  }

  const raw = fs.readFileSync(skillFile, 'utf8');
  const { name: skillName, description, license, body } = parseFrontMatter(raw);

  // List non-hidden files inside the skill directory (no recursion, safe listing)
  const files = fs.readdirSync(skillDir).filter((f) => !f.startsWith('.'));

  res.json({
    id: name,
    name: skillName || name,
    description: description || null,
    license: license || null,
    files,
    content: body,
  });
});

module.exports = router;
