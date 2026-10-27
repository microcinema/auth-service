import { Module } from '@nestjs/common'

import { TokenService } from '@/modules/token/token.service'
import { UserRepository } from '@/shared/repositories'

import { OtpService } from '../otp/otp.service'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	controllers: [AuthController],
	providers: [AuthService, UserRepository, OtpService, TokenService]
})
export class AuthModule {}
