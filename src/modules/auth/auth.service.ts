import type {
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest
} from '@microcinema/contracts/gen/auth'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Account } from '@prisma/generated/client'

import { OtpService } from '../otp/otp.service'

import { AuthRepository } from './auth.repository'

@Injectable()
export class AuthService {
	public constructor(
		private readonly authRepository: AuthRepository,
		private readonly otpService: OtpService
	) {}

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

		if (!account) throw new RpcException('Account not found')

		if (type === 'phone' && !account.isPhoneVerified)
			await this.authRepository.update(account.id, {
				isPhoneVerified: true
			})

		if (type === 'email' && !account.isEmailVerified)
			await this.authRepository.update(account.id, {
				isEmailVerified: true
			})

		return {
			accessToken: '1234567890',
			refreshToken: '1234567890'
		}
	}
}
