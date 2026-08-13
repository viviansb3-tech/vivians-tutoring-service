require('dotenv').config();
const { initializeDatabase, run, get, all } = require('../db');
const bcrypt = require('bcryptjs');

async function seed() {
  await initializeDatabase();

  const admin = await get('SELECT * FROM users WHERE email = ?', [process.env.ADMIN_EMAIL || 'viviansb3@gmail.com']);
  if (!admin) {
    const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
    const hash = await bcrypt.hash(adminPassword, 10);
    const adminUser = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      process.env.ADMIN_NAME || 'Vivian Sibanda',
      process.env.ADMIN_EMAIL || 'viviansb3@gmail.com',
      hash,
      'super_admin',
      'active'
    ]);
    await run('INSERT INTO tutors (user_id, biography, qualifications, subjects, experience, availability, photo) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      adminUser.id,
      'Founder and lead educator focused on academic excellence and student confidence.',
      'BSc, Postgraduate Study in Teaching & Learning',
      'Mathematics, Statistics, Science',
      '8+ years',
      'available',
      '/images/profile-placeholder.svg'
    ]);
  }

  const subjectCount = await get('SELECT COUNT(*) AS count FROM subjects');
  if (!subjectCount || Number(subjectCount.count) === 0) {
    await run('INSERT INTO subjects (name, description) VALUES (?, ?)', ['Mathematics', 'Problem solving and analytical reasoning']);
    await run('INSERT INTO subjects (name, description) VALUES (?, ?)', ['Biology', 'Life sciences and scientific investigation']);
    await run('INSERT INTO subjects (name, description) VALUES (?, ?)', ['Physical Science', 'Chemistry and physics foundations']);
    await run('INSERT INTO subjects (name, description) VALUES (?, ?)', ['Statistics', 'Data analysis and probability']);
  }

  const tutorCheck = await get('SELECT id FROM users WHERE role = ? LIMIT 1', ['tutor']);
  if (!tutorCheck) {
    const tutorId = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      'John Smith',
      'tutor@example.com',
      await bcrypt.hash('Tutor123!', 10),
      'tutor',
      'active'
    ]);
    await run('INSERT INTO tutors (user_id, biography, qualifications, subjects, experience, availability) VALUES (?, ?, ?, ?, ?, ?)', [
      tutorId.id,
      'Experienced mathematics tutor.',
      'B.Ed. Mathematics',
      'Mathematics, Statistics',
      '6 years',
      'available'
    ]);
  }

  const studentCheck = await get('SELECT id FROM users WHERE role = ? LIMIT 1', ['student']);
  if (!studentCheck) {
    const tutorUser = await get('SELECT id FROM users WHERE role = ? LIMIT 1', ['tutor']);
    const tutor = await get('SELECT id FROM tutors WHERE user_id = ?', [tutorUser.id]);
    const studentId = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      'Demo Student',
      'student@example.com',
      await bcrypt.hash('Student123!', 10),
      'student',
      'active'
    ]);
    await run('INSERT INTO students (user_id, grade, curriculum, subjects, tutor_id) VALUES (?, ?, ?, ?, ?)', [
      studentId.id,
      'Grade 10',
      'CAPS',
      'Mathematics, Statistics',
      tutor.id
    ]);
  }

  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
