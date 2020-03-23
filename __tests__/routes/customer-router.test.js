const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

describe('CRUD Customer', () => {
  it('Find All By Company', async done => {
    const res = await request
      .get('/api/v1/customers/all')
      .set({ token: '123' })
    
    expect(res.status).toBe(200)
    done()
  })
})