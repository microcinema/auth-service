import { Module } from '@nestjs/common'

import { TelegramRepository } from '@/modules/telegram/telegram.repository'
import { TokenService } from '@/modules/token/token.service'
import { UserRepository } from '@/shared/repositories'

import { TelegramController } from './telegram.controller'
import { TelegramService } from './telegram.service'

@Module({
	controllers: [TelegramController],
	providers: [
		TelegramService,
		TelegramRepository,
		UserRepository,
		TokenService
	]
})
export class TelegramModule {}
