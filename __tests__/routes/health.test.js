const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

describe('Health', () => {
	it('Should to return On', done => {
		request
			.get('/api/v1/health')
			.end((err, res) => {
				if (err) done(err)
				
				expect(res.statusCode).toBe(200)
				expect(res.body.status).toBe('On')
				done()
			})
	})
})
