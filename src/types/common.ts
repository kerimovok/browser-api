export interface BaseRequest {
	url: string
	userAgent?: string
	extraHTTPHeaders?: Record<string, string>
	timeout?: number
	waitForSelector?: string
}
