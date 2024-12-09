import { Router, type Request, type Response } from 'express'
import { BrowserManager } from '../utils/browser'
import type { PDFRequest } from '../types/common'

const router = Router()

router.post('/pdf', async (req: Request<{}, {}, PDFRequest>, res: Response) => {
	const browserManager = new BrowserManager()

	try {
		const {
			format = 'A4',
			margin,
			printBackground = true,
			...baseOptions
		} = req.body
		const page = await browserManager.createPage()

		await browserManager.setupPage(page, baseOptions)

		const pdfBuffer = await page.pdf({
			format: format as any,
			margin,
			printBackground,
		})

		res.send({ pdf: pdfBuffer.toString('base64') })
	} catch (error) {
		console.error('Error generating PDF:', error)
		res.status(500).send({ error: 'Failed to generate PDF' })
	} finally {
		await browserManager.close()
	}
})

export default router
