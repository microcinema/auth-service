import { Module } from '@nestjs/common'

import { AccountRepository } from '@/modules/account/account.repository'
import { OtpService } from '@/modules/otp/otp.service'
import { UserRepository } from '@/shared/repositories'

import { AccountController } from './account.controller'
import { AccountService } from './account.service'

@Module({
	controllers: [AccountController],
	providers: [AccountService, AccountRepository, UserRepository, OtpService]
})
export class AccountModule {}
