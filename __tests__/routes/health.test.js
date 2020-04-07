const app = require('../../src/config/server')
const supertest = require('supertest')
const request = supertest(app)

describe('Health', () => {
	it('Should to return On', () => {
		request
			.get('/api/v1/health')
			.end((err, res) => {
				expect(res.statusCode).toBe(200)
				expect(res.body.status).toHaveProperty('On')
				done()
			})
	})
})
