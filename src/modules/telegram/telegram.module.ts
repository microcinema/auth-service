import { Module } from '@nestjs/common'

import { TelegramRepository } from '@/modules/telegram/telegram.repository'
import { TokenService } from '@/modules/token/token.service'

import { TelegramController } from './telegram.controller'
import { TelegramService } from './telegram.service'

@Module({
	controllers: [TelegramController],
	providers: [TelegramService, TelegramRepository, TokenService]
})
export class TelegramModule {}
