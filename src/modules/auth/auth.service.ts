import { RpcStatus } from '@microcinema/common'
import type {
	RefreshRequest,
	SendOtpRequest,
	SendOtpResponse,
	VerifyOtpRequest
} from '@microcinema/contracts/gen/auth'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { Account } from '@prisma/generated/client'

import { TokenService } from '@/modules/token/token.service'
import { UserRepository } from '@/shared/repositories'

import { OtpService } from '../otp/otp.service'

@Injectable()
export class AuthService {
	public constructor(
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService,
		private readonly tokenService: TokenService
	) {}

	public async sendOtp(data: SendOtpRequest): Promise<SendOtpResponse> {
		const { identifier, type } = data

		let account: Account | null

		if (type === 'phone')
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account) {
			account = await this.userRepository.create({
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
			account = await this.userRepository.findByPhone(identifier)
		else account = await this.userRepository.findByEmail(identifier)

		if (!account)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found'
			})

		if (type === 'phone' && !account.isPhoneVerified)
			await this.userRepository.update(account.id, {
				isPhoneVerified: true
			})

		if (type === 'email' && !account.isEmailVerified)
			await this.userRepository.update(account.id, {
				isEmailVerified: true
			})

		return this.tokenService.generate(account.id)
	}

	public async refresh(data: RefreshRequest) {
		const { refreshToken } = data

		const result = this.tokenService.verify(refreshToken)

		if (!result.valid) {
			throw new RpcException({
				code: RpcStatus.UNAUTHENTICATED,
				details: result.reason
			})
		}

		return this.tokenService.generate(result.userId)
	}
}
