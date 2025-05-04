import type { BaseRequest } from '../types/common'
import puppeteer, {
	Browser,
	Page,
	type PuppeteerLaunchOptions,
	type GoToOptions,
} from 'puppeteer'

export class BrowserManager {
	private static readonly launchOptions: PuppeteerLaunchOptions = {
		headless: true,
		executablePath:
			process.env.NODE_ENV === 'production'
				? process.env.PUPPETEER_EXECUTABLE_PATH
				: puppeteer.executablePath(),
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
	}

	private static readonly navigationOptions: GoToOptions = {
		waitUntil: 'networkidle2',
	}

	private browser: Browser | null = null

	async initialize(): Promise<Browser> {
		this.browser = await puppeteer.launch(BrowserManager.launchOptions)
		return this.browser
	}

	async createPage(): Promise<Page> {
		if (!this.browser) {
			await this.initialize()
		}
		return await this.browser!.newPage()
	}

	async close(): Promise<void> {
		if (this.browser) {
			await this.browser.close()
			this.browser = null
		}
	}

	static getNavigationOptions(): GoToOptions {
		return this.navigationOptions
	}

	async setupPage(page: Page, options: BaseRequest): Promise<void> {
		if (options.userAgent) {
			await page.setUserAgent(options.userAgent)
		}

		if (options.extraHTTPHeaders) {
			await page.setExtraHTTPHeaders(options.extraHTTPHeaders)
		}

		if (options.timeout) {
			page.setDefaultTimeout(options.timeout)
		}

		await page.goto(options.url, {
			...BrowserManager.navigationOptions,
			...options.goToOptions,
		})

		if (options.waitForSelector) {
			await page.waitForSelector(options.waitForSelector)
		}
	}
}
