import app from './app'

const port = process.env.PORT || 3004

app.listen(port, () => {
	console.log(`Server is running on http://0.0.0.0:${port}`)
})
