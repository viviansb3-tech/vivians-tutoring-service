require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const { initializeDatabase, db, run, get, all } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'vivian-secure-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));

app.locals.title = 'Vivian Sibanda Tutoring';

function requireAuth(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  next();
}

function requireRole(roles) {
  return (req, res, next) => {
    if (!req.session.user) return res.redirect('/login');
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).render('error', { message: 'You do not have permission to access this page.' });
    }
    next();
  };
}

async function getUserProfile(userId) {
  const user = await get('SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return null;
  if (user.role === 'tutor') {
    const tutor = await get('SELECT * FROM tutors WHERE user_id = ?', [user.id]);
    return { user, tutor };
  }
  if (user.role === 'student') {
    const student = await get('SELECT * FROM students WHERE user_id = ?', [user.id]);
    return { user, student };
  }
  return { user };
}

async function createNotification(userId, title, message) {
  await run('INSERT INTO notifications (user_id, title, message) VALUES (?, ?, ?)', [userId, title, message]);
}

async function logAction(userId, action, details) {
  await run('INSERT INTO audit_log (user_id, action, details) VALUES (?, ?, ?)', [userId, action, details]);
}

async function ensureAdminSeed() {
  const adminExists = await get('SELECT id FROM users WHERE email = ?', [process.env.ADMIN_EMAIL || 'viviansb3@gmail.com']);
  if (!adminExists) {
    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'ChangeMe123!', 10);
    const adminUser = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      process.env.ADMIN_NAME || 'Vivian Sibanda',
      process.env.ADMIN_EMAIL || 'viviansb3@gmail.com',
      passwordHash,
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
      '/images/vivian-profile.jpg'
    ]);
    await logAction(adminUser.id, 'admin_created', 'Initial super administrator created.');
  }
}

async function seedDemoData() {
  const subjectCount = await get('SELECT COUNT(*) AS count FROM subjects');
  if (!subjectCount || Number(subjectCount.count) === 0) {
    await run('INSERT INTO subjects (name, description) VALUES (?, ?)', ['Mathematics', 'Problem solving and analytical reasoning']);
    await run('INSERT INTO subjects (name, description) VALUES (?, ?)', ['Biology', 'Life sciences and scientific investigation']);
    await run('INSERT INTO subjects (name, description) VALUES (?, ?)', ['Physical Science', 'Chemistry and physics foundations']);
    await run('INSERT INTO subjects (name, description) VALUES (?, ?)', ['Statistics', 'Data analysis and probability']);
  }

  const tutorCount = await get('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['tutor']);
  if (!tutorCount || Number(tutorCount.count) === 0) {
    const tutor1 = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      'John Smith', 'tutor@example.com', await bcrypt.hash('Tutor123!', 10), 'tutor', 'active']);
    await run('INSERT INTO tutors (user_id, biography, qualifications, subjects, experience, availability, photo) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      tutor1.id,
      'Experienced mathematics tutor with a passion for exam confidence and logical thinking.',
      'B.Ed. Mathematics',
      'Mathematics, Statistics',
      '6 years',
      'available',
      '/images/tutor-john.jpg'
    ]);

    const tutor2 = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      'Aisha Naidoo', 'aisha@viviansb3.co.za', await bcrypt.hash('Tutor123!', 10), 'tutor', 'active']);
    await run('INSERT INTO tutors (user_id, biography, qualifications, subjects, experience, availability, photo) VALUES (?, ?, ?, ?, ?, ?, ?)', [
      tutor2.id,
      'Biology and life sciences educator supporting students to master practical and theoretical concepts.',
      'B.Sc. Life Sciences',
      'Biology, Physical Science',
      '5 years',
      'available',
      '/images/tutor-aisha.jpg'
    ]);
  }

  const studentCount = await get('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['student']);
  if (!studentCount || Number(studentCount.count) === 0) {
    const tutorUser = await get('SELECT id FROM users WHERE role = ? LIMIT 1', ['tutor']);
    const tutorRec = await get('SELECT id FROM tutors WHERE user_id = ?', [tutorUser.id]);

    const student1 = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      'Demo Student', 'student@example.com', await bcrypt.hash('Student123!', 10), 'student', 'active']);
    await run('INSERT INTO students (user_id, grade, curriculum, subjects, tutor_id) VALUES (?, ?, ?, ?, ?)', [
      student1.id, 'Grade 10', 'CAPS', 'Mathematics, Statistics', tutorRec.id]);

    const student2 = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      'Sipho Khumalo', 'sipho@example.com', await bcrypt.hash('Student123!', 10), 'student', 'active']);
    await run('INSERT INTO students (user_id, grade, curriculum, subjects, tutor_id) VALUES (?, ?, ?, ?, ?)', [
      student2.id, 'Grade 11', 'CAPS', 'Biology, Physical Science', tutorRec.id]);

    const tutor2User = await get('SELECT id FROM users WHERE role = ? AND email = ?', ['tutor', 'aisha@viviansb3.co.za']);
    const tutor2Rec = await get('SELECT id FROM tutors WHERE user_id = ?', [tutor2User.id]);

    const student3 = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
      'Nandi Mbatha', 'nandi@example.com', await bcrypt.hash('Student123!', 10), 'student', 'active']);
    await run('INSERT INTO students (user_id, grade, curriculum, subjects, tutor_id) VALUES (?, ?, ?, ?, ?)', [
      student3.id, 'Grade 12', 'CAPS', 'Mathematics, Biology', tutor2Rec.id]);
  }

  const assessmentCount = await get('SELECT COUNT(*) AS count FROM assessments');
  if (!assessmentCount || Number(assessmentCount.count) === 0) {
    const students = await all('SELECT * FROM students');
    const tutor = await get('SELECT * FROM tutors LIMIT 1');
    const tutorUser = await get('SELECT * FROM users WHERE id = ?', [tutor.user_id]);
    if (students.length > 0) {
      for (const student of students) {
        const user = await get('SELECT * FROM users WHERE id = ?', [student.user_id]);
        await run('INSERT INTO assessments (student_id, tutor_id, subject, assessment_name, assessment_date, assessment_type, max_mark, mark_obtained, percentage, grade, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
          student.id,
          tutor.id,
          'Mathematics',
          'Mathematics Test 1',
          '2026-08-01',
          'Test',
          100,
          72,
          72,
          'B',
          `${user.name} has shown steady improvement in algebra.`
        ]);
      }
    }
  }
}

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.get('/', async (req, res) => {
  const tutors = await all('SELECT u.name, u.email, t.* FROM users u JOIN tutors t ON t.user_id = u.id WHERE u.role = ? ORDER BY u.name', ['tutor']);
  const subjects = await all('SELECT * FROM subjects ORDER BY name');
  res.render('home', { tutors, subjects });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/tutors', async (req, res) => {
  const tutors = await all('SELECT u.name, u.email, t.* FROM users u JOIN tutors t ON t.user_id = u.id WHERE u.role = ? ORDER BY u.name', ['tutor']);
  res.render('tutors', { tutors });
});

app.get('/tutors/:id', async (req, res) => {
  const tutor = await get('SELECT u.name, u.email, t.* FROM users u JOIN tutors t ON t.user_id = u.id WHERE t.id = ?', [req.params.id]);
  if (!tutor) return res.status(404).render('error', { message: 'Tutor not found.' });
  res.render('tutor-profile', { tutor });
});

app.get('/booking/:id', async (req, res) => {
  if (!req.session.user || req.session.user.role !== 'student') {
    return res.redirect('/login');
  }
  const tutor = await get('SELECT u.name, u.email, t.* FROM users u JOIN tutors t ON t.user_id = u.id WHERE t.id = ?', [req.params.id]);
  if (!tutor) return res.status(404).render('error', { message: 'Tutor not found.' });
  res.render('booking', { tutor });
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please complete all fields.' });
  }
  await logAction(null, 'contact_form_submission', `Name: ${name}, Email: ${email}`);
  const adminUser = await get('SELECT * FROM users WHERE role = ?', ['super_admin']);
  if (adminUser) {
    await createNotification(adminUser.id, 'New contact form submission', `${name} sent a message from ${email}.`);
  }
  res.json({ success: true, message: 'Your message has been sent successfully.' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Invalid login details.' });
  }

  const user = await get('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (!user) {
    return res.status(401).json({ error: 'Invalid login details.' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid login details.' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Your account is currently suspended.' });
  }

  req.session.user = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  await logAction(user.id, 'login', 'User logged in.');
  return res.json({ success: true, redirect: user.role === 'super_admin' ? '/admin' : user.role === 'tutor' ? '/tutor-dashboard' : '/student-dashboard' });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role = 'student' } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Please complete all fields.' });
  }

  const exists = await get('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
  if (exists) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const user = await run('INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?)', [
    name,
    email.trim().toLowerCase(),
    await bcrypt.hash(password, 10),
    role,
    'active'
  ]);

  if (role === 'student') {
    await run('INSERT INTO students (user_id, grade, curriculum, subjects) VALUES (?, ?, ?, ?)', [user.id, 'Grade 10', 'CAPS', 'Mathematics']);
  }

  if (role === 'tutor') {
    await run('INSERT INTO tutors (user_id, biography, qualifications, subjects, experience, availability) VALUES (?, ?, ?, ?, ?, ?)', [
      user.id,
      'New tutor profile created.',
      'Qualification pending verification',
      'Mathematics',
      'New',
      'available'
    ]);
  }

  await logAction(user.id, 'user_created', `${role} account created.`);
  const adminUser = await get('SELECT * FROM users WHERE role = ?', ['super_admin']);
  if (adminUser) {
    await createNotification(adminUser.id, 'New account created', `${name} registered as a ${role}.`);
  }

  res.json({ success: true, message: 'Your account has been created successfully.' });
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/'));
});

app.get('/admin', requireRole(['super_admin']), async (req, res) => {
  const totalStudents = await get('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['student']);
  const totalTutors = await get('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['tutor']);
  const bookings = await all('SELECT * FROM bookings ORDER BY booking_date ASC LIMIT 10');
  const assessments = await all('SELECT * FROM assessments ORDER BY assessment_date DESC LIMIT 10');
  const messages = await all('SELECT * FROM messages ORDER BY created_at DESC LIMIT 10');
  res.render('admin-dashboard', {
    totalStudents: totalStudents.count,
    totalTutors: totalTutors.count,
    bookings,
    assessments,
    messages
  });
});

app.get('/student-dashboard', requireRole(['student']), async (req, res) => {
  const student = await get('SELECT * FROM students WHERE user_id = ?', [req.session.user.id]);
  const user = await get('SELECT * FROM users WHERE id = ?', [req.session.user.id]);
  const tutor = student && student.tutor_id ? await get('SELECT u.name, t.* FROM users u JOIN tutors t ON t.user_id = u.id WHERE t.id = ?', [student.tutor_id]) : null;
  const assessments = await all('SELECT * FROM assessments WHERE student_id = ? ORDER BY assessment_date DESC', [student.id]);
  const progress = await all('SELECT * FROM progress_records WHERE student_id = ? ORDER BY record_date ASC', [student.id]);
  const homework = await all('SELECT * FROM homework WHERE student_id = ? ORDER BY due_date DESC', [student.id]);
  const messages = await all('SELECT * FROM messages WHERE (sender_id = ? OR receiver_id = ?) ORDER BY created_at DESC', [req.session.user.id, req.session.user.id]);
  res.render('student-dashboard', { user, student, tutor, assessments, progress, homework, messages });
});

app.get('/tutor-dashboard', requireRole(['tutor']), async (req, res) => {
  const tutor = await get('SELECT u.name, t.* FROM users u JOIN tutors t ON t.user_id = u.id WHERE u.id = ?', [req.session.user.id]);
  const students = tutor ? await all('SELECT s.*, u.name FROM students s JOIN users u ON u.id = s.user_id WHERE s.tutor_id = ? ORDER BY u.name', [tutor.id]) : [];
  const bookings = tutor ? await all('SELECT * FROM bookings WHERE tutor_id = ? ORDER BY booking_date ASC', [tutor.id]) : [];
  const assessments = tutor ? await all('SELECT * FROM assessments WHERE tutor_id = ? ORDER BY assessment_date DESC LIMIT 10', [tutor.id]) : [];
  const messages = await all('SELECT * FROM messages WHERE receiver_id = ? OR sender_id = ? ORDER BY created_at DESC', [req.session.user.id, req.session.user.id]);
  res.render('tutor-dashboard', { tutor, students, bookings, assessments, messages });
});

app.get('/api/tutors', async (req, res) => {
  const tutors = await all('SELECT u.name, u.email, t.* FROM users u JOIN tutors t ON t.user_id = u.id WHERE u.role = ? ORDER BY u.name', ['tutor']);
  res.json(tutors);
});

app.get('/api/students', requireRole(['super_admin', 'tutor']), async (req, res) => {
  const userRole = req.session.user.role;
  let query = 'SELECT s.*, u.name, u.email FROM students s JOIN users u ON u.id = s.user_id';
  const params = [];
  if (userRole === 'tutor') {
    const tutor = await get('SELECT id FROM tutors WHERE user_id = ?', [req.session.user.id]);
    query += ' WHERE s.tutor_id = ?';
    params.push(tutor.id);
  }
  query += ' ORDER BY u.name';
  const students = await all(query, params);
  res.json(students);
});

app.post('/api/bookings', requireRole(['student']), async (req, res) => {
  const { tutorId, subject, bookingDate, bookingTime } = req.body;
  if (!tutorId || !subject || !bookingDate || !bookingTime) {
    return res.status(400).json({ error: 'Please complete all booking fields.' });
  }

  const student = await get('SELECT id FROM students WHERE user_id = ?', [req.session.user.id]);
  const tutor = await get('SELECT id FROM tutors WHERE id = ?', [tutorId]);
  if (!tutor) return res.status(404).json({ error: 'Tutor not found.' });

  const existing = await get('SELECT id FROM bookings WHERE tutor_id = ? AND booking_date = ? AND booking_time = ? AND status != ?', [tutorId, bookingDate, bookingTime, 'cancelled']);
  if (existing) {
    return res.status(409).json({ error: 'This appointment has already been booked.' });
  }

  const booking = await run('INSERT INTO bookings (student_id, tutor_id, subject, booking_date, booking_time, status) VALUES (?, ?, ?, ?, ?, ?)', [
    student.id,
    tutor.id,
    subject,
    bookingDate,
    bookingTime,
    'pending'
  ]);

  const tutorUser = await get('SELECT * FROM users WHERE id = ?', [tutor.user_id]);
  const adminUser = await get('SELECT * FROM users WHERE role = ?', ['super_admin']);
  await createNotification(tutorUser.id, 'New booking', `A student has requested a ${subject} lesson on ${bookingDate} at ${bookingTime}.`);
  if (adminUser) await createNotification(adminUser.id, 'Booking created', `A new booking was created for ${subject}.`);
  await logAction(req.session.user.id, 'booking_created', `Booking #${booking.id} created for ${subject}.`);

  res.status(201).json({ success: true, message: 'Booking created successfully.' });
});

app.post('/api/assessments', requireRole(['tutor']), async (req, res) => {
  const { studentId, subject, assessmentName, assessmentDate, assessmentType, maxMark, markObtained, feedback } = req.body;
  if (!studentId || !subject || !assessmentName || !assessmentDate || !maxMark || !markObtained) {
    return res.status(400).json({ error: 'Please complete all assessment fields.' });
  }

  const tutor = await get('SELECT id FROM tutors WHERE user_id = ?', [req.session.user.id]);
  const student = await get('SELECT * FROM students WHERE id = ?', [studentId]);
  if (!student || student.tutor_id !== tutor.id) {
    return res.status(403).json({ error: 'You can only grade your assigned students.' });
  }

  const percentage = Number((Number(markObtained) / Number(maxMark)) * 100).toFixed(2);
  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 50) grade = 'D';
  else if (percentage >= 40) grade = 'E';

  const record = await run('INSERT INTO assessments (student_id, tutor_id, subject, assessment_name, assessment_date, assessment_type, max_mark, mark_obtained, percentage, grade, feedback) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
    student.id,
    tutor.id,
    subject,
    assessmentName,
    assessmentDate,
    assessmentType || 'Test',
    Number(maxMark),
    Number(markObtained),
    Number(percentage),
    grade,
    feedback || ''
  ]);

  await run('INSERT INTO progress_records (student_id, tutor_id, subject, record_date, score, notes) VALUES (?, ?, ?, ?, ?, ?)', [
    student.id,
    tutor.id,
    subject,
    assessmentDate,
    Number(percentage),
    `Assessment: ${assessmentName}`
  ]);

  const user = await get('SELECT * FROM users WHERE id = ?', [student.user_id]);
  await createNotification(user.id, 'New grade added', `${assessmentName} has been graded: ${grade}.`);
  await logAction(req.session.user.id, 'grade_added', `Grade added for ${user.name} in ${subject}.`);

  res.status(201).json({ success: true, message: 'Grade added successfully.', grade, percentage });
});

app.post('/api/messages', requireRole(['student', 'tutor']), async (req, res) => {
  const { receiverId, message } = req.body;
  if (!receiverId || !message) {
    return res.status(400).json({ error: 'Message content is required.' });
  }

  const senderId = req.session.user.id;
  const receiver = await get('SELECT * FROM users WHERE id = ?', [receiverId]);
  if (!receiver) return res.status(404).json({ error: 'Receiver not found.' });

  await run('INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)', [senderId, receiverId, message]);
  await createNotification(receiverId, 'New message', `${req.session.user.name} sent you a new message.`);
  res.status(201).json({ success: true, message: 'Message sent successfully.' });
});

app.get('/api/notifications', requireAuth, async (req, res) => {
  const notifications = await all('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [req.session.user.id]);
  res.json(notifications);
});

app.get('/api/admin/summary', requireRole(['super_admin']), async (req, res) => {
  const summary = {
    totalStudents: await get('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['student']),
    totalTutors: await get('SELECT COUNT(*) AS count FROM users WHERE role = ?', ['tutor']),
    bookings: await get('SELECT COUNT(*) AS count FROM bookings WHERE status = ?', ['pending'])
  };
  res.json(summary);
});

app.get('/api/progress/:studentId', requireRole(['super_admin', 'tutor', 'student']), async (req, res) => {
  const currentUser = req.session.user;
  const student = await get('SELECT * FROM students WHERE id = ?', [req.params.studentId]);
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  if (currentUser.role === 'student' && student.user_id !== currentUser.id) {
    return res.status(403).json({ error: 'You cannot view another student profile.' });
  }

  if (currentUser.role === 'tutor') {
    const tutor = await get('SELECT id FROM tutors WHERE user_id = ?', [currentUser.id]);
    if (student.tutor_id !== tutor.id) {
      return res.status(403).json({ error: 'You can only view your assigned students.' });
    }
  }

  const progress = await all('SELECT * FROM progress_records WHERE student_id = ? ORDER BY record_date ASC', [student.id]);
  res.json(progress);
});

app.get('/api/me', requireAuth, async (req, res) => {
  const user = await get('SELECT * FROM users WHERE id = ?', [req.session.user.id]);
  res.json({ user });
});

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found.' });
});

async function startServer() {
  await initializeDatabase();
  await ensureAdminSeed();
  await seedDemoData();

  app.listen(PORT, () => {
    console.log(`Vivian Sibanda Tutoring app running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
