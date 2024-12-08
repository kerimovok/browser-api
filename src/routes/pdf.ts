import { Router, type Request, type Response } from 'express'
import { BrowserManager } from '../utils/browser'
import type { BaseRequest } from '../types/common'

export interface PDFRequest extends BaseRequest {
	format?: string
	margin?: {
		top?: string
		right?: string
		bottom?: string
		left?: string
	}
	printBackground?: boolean
}
const router = Router()

router.post('/pdf', async (req: Request<{}, {}, PDFRequest>, res: Response) => {
	const browserManager = new BrowserManager()

	try {
		const { url, format = 'A4', margin, printBackground = true } = req.body
		const page = await browserManager.createPage()

		await page.goto(url, BrowserManager.getNavigationOptions())

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
