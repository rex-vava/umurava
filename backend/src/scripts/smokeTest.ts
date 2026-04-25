/* eslint-disable */
// Smoke test: spins up in-memory MongoDB, boots the API, hits endpoints, validates responses.
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-smoke-testing-only';
process.env.GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'test-gemini-key';

import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import http from 'http';

async function request(opts: { method: string; path: string; token?: string; body?: any }) {
  return new Promise<{ status: number; body: any }>((resolve, reject) => {
    const data = opts.body ? JSON.stringify(opts.body) : undefined;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5050,
        path: opts.path,
        method: opts.method,
        headers: {
          'Content-Type': 'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data).toString() } : {}),
          ...(opts.token ? { Authorization: `Bearer ${opts.token}` } : {}),
        },
      },
      (res) => {
        let chunks = '';
        res.on('data', (c) => (chunks += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode || 0, body: chunks ? JSON.parse(chunks) : null });
          } catch {
            resolve({ status: res.statusCode || 0, body: chunks });
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log('▶ Starting in-memory MongoDB...');
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.PORT = '5050';

  console.log('▶ Loading server...');
  // Patch connectDatabase to use the in-memory URI without exiting on error.
  const { default: express } = await import('express');
  const helmet = (await import('helmet')).default;
  const cors = (await import('cors')).default;
  const { errorHandler, notFound } = await import('../middleware/errorHandler');
  const authRoutes = (await import('../routes/authRoutes')).default;
  const jobRoutes = (await import('../routes/jobRoutes')).default;
  const candidateRoutes = (await import('../routes/candidateRoutes')).default;
  const screeningRoutes = (await import('../routes/screeningRoutes')).default;

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✓ Connected to in-memory MongoDB');

  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.get('/api/health', (_req, res) => res.json({ success: true, message: 'ok' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/candidates', candidateRoutes);
  app.use('/api/screening', screeningRoutes);
  app.use(notFound);
  app.use(errorHandler);

  const server = app.listen(5050);
  await new Promise((r) => server.once('listening', r));
  console.log('✓ Server listening on :5050');

  let passed = 0;
  let failed = 0;
  const expect = (name: string, cond: boolean, detail?: any) => {
    if (cond) {
      console.log(`  ✓ ${name}`);
      passed++;
    } else {
      console.log(`  ✗ ${name}`, detail ?? '');
      failed++;
    }
  };

  // 1. Health
  console.log('\n[1] Health check');
  const health = await request({ method: 'GET', path: '/api/health' });
  expect('GET /api/health → 200', health.status === 200, health);
  expect('Health success=true', health.body?.success === true);

  // 2. Validation error on bad register
  console.log('\n[2] Validation handling');
  const badReg = await request({ method: 'POST', path: '/api/auth/register', body: { email: 'nope' } });
  expect('Bad register → 400', badReg.status === 400, badReg.body);
  expect('Validation errors array present', Array.isArray(badReg.body?.errors));

  // 3. Register
  console.log('\n[3] Register');
  const reg = await request({
    method: 'POST',
    path: '/api/auth/register',
    body: {
      firstName: 'Alice',
      lastName: 'Recruiter',
      email: 'alice@umurava.test',
      password: 'StrongPass123!',
      company: 'Umurava',
    },
  });
  expect('Register → 201', reg.status === 201, reg.body);
  expect('Token returned', typeof reg.body?.data?.token === 'string');
  const token = reg.body?.data?.token;

  // 4. Duplicate register
  console.log('\n[4] Duplicate register');
  const dup = await request({
    method: 'POST',
    path: '/api/auth/register',
    body: {
      firstName: 'Alice',
      lastName: 'Recruiter',
      email: 'alice@umurava.test',
      password: 'StrongPass123!',
      company: 'Umurava',
    },
  });
  expect('Duplicate → 4xx', dup.status >= 400 && dup.status < 500, dup.body);

  // 5. Login
  console.log('\n[5] Login');
  const login = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'alice@umurava.test', password: 'StrongPass123!' },
  });
  expect('Login → 200', login.status === 200, login.body);
  expect('Login token returned', typeof login.body?.data?.token === 'string');

  // 6. Bad login
  const badLogin = await request({
    method: 'POST',
    path: '/api/auth/login',
    body: { email: 'alice@umurava.test', password: 'wrong' },
  });
  expect('Bad login → 401', badLogin.status === 401, badLogin.body);

  // 7. Profile (protected)
  console.log('\n[6] Protected route');
  const noAuth = await request({ method: 'GET', path: '/api/auth/profile' });
  expect('No token → 401', noAuth.status === 401);
  const profile = await request({ method: 'GET', path: '/api/auth/profile', token });
  expect('Profile with token → 200', profile.status === 200, profile.body);

  // 8. Create job
  console.log('\n[7] Job CRUD');
  const job = await request({
    method: 'POST',
    path: '/api/jobs',
    token,
    body: {
      title: 'Senior Backend Engineer',
      description: 'Build scalable backend services for Umurava platform.',
      department: 'Engineering',
      location: 'Kigali',
      type: 'full-time',
      experienceLevel: 'senior',
      requirements: ['Node.js', 'MongoDB', 'TypeScript'],
      responsibilities: ['Design APIs', 'Mentor juniors'],
      preferredSkills: ['AWS', 'GraphQL'],
    },
  });
  expect('Create job → 201', job.status === 201, job.body);
  const jobId = job.body?.data?.job?._id;
  expect('Job id returned', typeof jobId === 'string');

  const jobs = await request({ method: 'GET', path: '/api/jobs', token });
  expect('List jobs → 200', jobs.status === 200);
  expect('At least one job listed', Array.isArray(jobs.body?.data?.jobs) && jobs.body.data.jobs.length >= 1);

  const jobDetail = await request({ method: 'GET', path: `/api/jobs/${jobId}`, token });
  expect('Get job by id → 200', jobDetail.status === 200, jobDetail.body);

  // Cleanup
  await new Promise((r) => server.close(r));
  await mongoose.disconnect();
  await mongo.stop();

  console.log(`\n========================================`);
  console.log(`Smoke test results: ${passed} passed, ${failed} failed`);
  console.log(`========================================`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Smoke test crashed:', err);
  process.exit(1);
});
