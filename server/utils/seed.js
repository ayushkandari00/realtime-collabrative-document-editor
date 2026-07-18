require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Document = require('../models/Document');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');
};

const seed = async () => {
  await connectDB();

  console.log('🌱 Seeding database...');

  // Clear existing data
  await User.deleteMany({});
  await Document.deleteMany({});

  // Create users
  const alice = await User.create({
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
  });

  const bob = await User.create({
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'password123',
  });

  const carol = await User.create({
    name: 'Carol Williams',
    email: 'carol@example.com',
    password: 'password123',
  });

  console.log('✅ Users created');

  // Create documents
  const doc1 = await Document.create({
    title: 'Project Proposal - Q3 2026',
    content: `<h1>Project Proposal</h1><p>This document outlines the key objectives and deliverables for Q3 2026.</p><h2>Objectives</h2><ul><li>Increase user engagement by 30%</li><li>Launch new collaboration features</li><li>Improve performance by 50%</li></ul><h2>Timeline</h2><p>The project will span <strong>3 months</strong> starting July 2026.</p>`,
    owner: alice._id,
    collaborators: [{ user: bob._id, permission: 'editor' }],
    wordCount: 45,
    characterCount: 280,
    lastEditedBy: alice._id,
  });

  const doc2 = await Document.create({
    title: 'Meeting Notes - Team Sync',
    content: `<h1>Team Sync Notes</h1><p><em>Date: July 8, 2026</em></p><h2>Agenda</h2><ol><li>Sprint review</li><li>Upcoming features</li><li>Blockers</li></ol><h2>Action Items</h2><ul><li>Bob: Complete API integration</li><li>Carol: Design review</li></ul>`,
    owner: bob._id,
    collaborators: [
      { user: alice._id, permission: 'editor' },
      { user: carol._id, permission: 'viewer' },
    ],
    wordCount: 38,
    characterCount: 210,
    lastEditedBy: bob._id,
  });

  const doc3 = await Document.create({
    title: 'Design System Documentation',
    content: `<h1>Design System</h1><p>This guide covers our core design principles, color palette, and component library.</p><h2>Colors</h2><p>Primary: <strong>Indigo 600</strong>, Secondary: <strong>Blue 500</strong></p><h2>Typography</h2><p>Font family: Inter, fallback: system-ui</p>`,
    owner: alice._id,
    collaborators: [{ user: carol._id, permission: 'editor' }],
    wordCount: 42,
    characterCount: 255,
    lastEditedBy: carol._id,
  });

  const doc4 = await Document.create({
    title: 'Personal Notes',
    content: `<h1>Personal Notes</h1><p>Quick jottings and ideas for future reference.</p><ul><li>Read about WebAssembly</li><li>Try Rust for backend</li><li>Explore edge computing</li></ul>`,
    owner: carol._id,
    wordCount: 20,
    characterCount: 130,
    lastEditedBy: carol._id,
  });

  console.log('✅ Documents created');
  console.log('\n📋 Seed Data Summary:');
  console.log('Users:');
  console.log('  alice@example.com / password123');
  console.log('  bob@example.com / password123');
  console.log('  carol@example.com / password123');
  console.log('\nDocuments:', [doc1, doc2, doc3, doc4].map((d) => d.title).join(', '));

  await mongoose.disconnect();
  console.log('\n✅ Seeding complete!');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
