import type {
	TelegramInitResponse,
	TelegramVerifyRequest,
	TelegramVerifyResponse
} from '@microcinema/contracts/gen/auth'
import { Controller } from '@nestjs/common'
import { GrpcMethod } from '@nestjs/microservices'

import { TelegramService } from './telegram.service'

@Controller()
export class TelegramController {
	public constructor(private readonly telegramService: TelegramService) {}

	@GrpcMethod('AuthService', 'TelegramInit')
	public async getAuthUrl(): Promise<TelegramInitResponse> {
		return this.telegramService.getAuthUrl()
	}

	@GrpcMethod('AuthService', 'TelegramVerify')
	public async verify(
		data: TelegramVerifyRequest
	): Promise<TelegramVerifyResponse> {
		return this.telegramService.verify(data)
	}
}
