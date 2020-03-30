module.exports = (app) => {
    app.get('/api/v1/health', (req, res) => res.status(200).send({ status: 'On' }))
}
