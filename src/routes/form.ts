import { Router, type Request, type Response } from 'express'
import { BrowserPool } from '../utils/browser-pool'
import type { FormRequest } from '../types/common'

const router = Router()

router.post(
	'/form',
	async (req: Request<{}, {}, FormRequest>, res: Response) => {
		const browserManager =
			await BrowserPool.getInstance().getBrowserManager()

		try {
			const {
				formSelector,
				formData,
				submitButtonSelector,
				...baseOptions
			} = req.body
			const page = await browserManager.createPage()

			await browserManager.setupPage(page, baseOptions)
			await page.waitForSelector(formSelector)

			// Fill form fields
			for (const [field, value] of Object.entries(formData)) {
				await page.type(`${formSelector} [name="${field}"]`, value)
			}

			// Submit form
			await page.click(submitButtonSelector)
			await page.waitForNavigation()

			const result = await page.content()
			res.send({ result })
		} catch (error) {
			console.error('Error submitting form:', error)
			res.status(500).send({ error: 'Failed to submit form' })
		} finally {
			BrowserPool.getInstance().releaseBrowserManager(browserManager)
		}
	}
)

export default router
