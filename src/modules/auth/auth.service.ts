import { RpcStatus } from '@microcinema/common'
import type {
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest
} from '@microcinema/contracts/gen/auth'
import { PassportService, TokenPayload } from '@microcinema/passport'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RpcException } from '@nestjs/microservices'
import { Account } from '@prisma/generated/client'

import type { AllConfigs } from '@/config'

import { OtpService } from '../otp/otp.service'

import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
	private readonly ACCESS_TOKEN_TTL: number
	private readonly REFRESH_TOKEN_TTL: number

	public constructor(
		private readonly configService: ConfigService<AllConfigs>,
		private readonly authRepository: AuthRepository,
		private readonly otpService: OtpService,
		private readonly passportService: PassportService
	) {
		this.ACCESS_TOKEN_TTL = this.configService.get('passport.accessTtl', {
			infer: true
		})
		this.REFRESH_TOKEN_TTL = this.configService.get('passport.refreshTtl', {
			infer: true
		})
	}

	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier, type } = data

		let account: Account | null

		if (type === 'phone')
			account = await this.authRepository.findByPhone(identifier)
		else account = await this.authRepository.findByEmail(identifier)

		if (!account) {
			account = await this.authRepository.createAccount({
				email: type === 'email' ? identifier : undefined,
				phone: type === 'phone' ? identifier : undefined
			})
		}

		const code = await this.otpService.send(
			identifier,
			type as 'email' | 'phone'
		)

		console.debug('code', code)

		return {
			ok: true
		}
	}

	public async verifyOtp(data: VerifyOtpRequest) {
		const { identifier, code, type } = data

		await this.otpService.verify(
			identifier,
			code,
			type as 'email' | 'phone'
		)

		let account: Account | null

		if (type === 'phone')
			account = await this.authRepository.findByPhone(identifier)
		else account = await this.authRepository.findByEmail(identifier)

		if (!account)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found'
			})

		if (type === 'phone' && !account.isPhoneVerified)
			await this.authRepository.update(account.id, {
				isPhoneVerified: true
			})

		if (type === 'email' && !account.isEmailVerified)
			await this.authRepository.update(account.id, {
				isEmailVerified: true
			})

		return this.generateTokens(account.id)
	}

	private generateTokens(userId: string) {
		const payload: TokenPayload = { sub: userId }

		const accessToken = this.passportService.generate(
			String(payload.sub),
			this.ACCESS_TOKEN_TTL
		)
		const refreshToken = this.passportService.generate(
			String(payload.sub),
			this.REFRESH_TOKEN_TTL
		)
		return {
			accessToken,
			refreshToken
		}
	}
}
