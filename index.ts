import puppeteer from 'puppeteer'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3004
app.use(bodyParser.json())
app.use(cors())

const basePuppeteerOptions = {
	headless: true,
	executablePath:
		process.env.NODE_ENV === 'production'
			? process.env.PUPPETEER_EXECUTABLE_PATH
			: puppeteer.executablePath(),
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
}

const v1Router = express.Router()

v1Router.post('/screenshot', async (req, res) => {
	const { url, viewportWidth, viewportHeight, userAgent, extraHTTPHeaders } =
		req.body
	let browser

	try {
		browser = await puppeteer.launch(basePuppeteerOptions)
		const page = await browser.newPage()

		if (viewportWidth && viewportHeight) {
			await page.setViewport({
				width: viewportWidth,
				height: viewportHeight,
			})
		}

		if (userAgent) {
			await page.setUserAgent(userAgent)
		}

		if (extraHTTPHeaders) {
			await page.setExtraHTTPHeaders(extraHTTPHeaders)
		}

		await page.goto(url, { waitUntil: 'networkidle2' })

		const screenshotBuffer = await page.screenshot({ encoding: 'base64' })
		res.send({ image: screenshotBuffer })
	} catch (error) {
		console.error('Error taking screenshot:', error)
		res.status(500).send({ error: 'Failed to take screenshot' })
	} finally {
		if (browser) {
			await browser.close()
		}
	}
})

v1Router.post('/metadata', async (req, res) => {
	let browser

	try {
		browser = await puppeteer.launch(basePuppeteerOptions)
		const page = await browser.newPage()
		await page.goto(req.body.url, { waitUntil: 'networkidle2' })

		const metadata = await page.evaluate(() => {
			const getMetaContent = (name: string) =>
				document
					.querySelector(`meta[property='og:${name}']`)
					?.getAttribute('content') ||
				document
					.querySelector(`meta[name='${name}']`)
					?.getAttribute('content')

			return {
				ogTitle: getMetaContent('title') || document.title,
				ogDescription: getMetaContent('description'),
				ogImage: getMetaContent('image'),
			}
		})

		res.send(metadata)
	} catch (error) {
		console.error('Error extracting metadata:', error)
		res.status(500).send({ error: 'Failed to extract metadata' })
	} finally {
		if (browser) {
			await browser.close()
		}
	}
})

app.use('/api/v1', v1Router)

app.listen(port, () => {
	console.log(`Server is running on http://0.0.0.0:${port}`)
})
