const request = require('supertest');
const { app } = require('../server');

describe('DevSecOps Training API', () => {
  it('returns health status', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });

  it('logs in and returns a JWT', async () => {
    const res = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'admin123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('blocks access without a token', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(401);
  });

  it('allows admin to list users', async () => {
    const login = await request(app)
      .post('/login')
      .send({ username: 'admin', password: 'admin123' });

    const res = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});
