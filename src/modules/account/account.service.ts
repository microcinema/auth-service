import { RpcStatus } from '@microcinema/common'
import { convertEnum } from '@microcinema/common'
import {
	ConfirmEmailChangeRequest,
	ConfirmPhoneChangeRequest,
	GetAccountRequest,
	InitEmailChangeRequest,
	InitPhoneChangeRequest
} from '@microcinema/contracts/gen/account'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { AccountRepository } from '@/modules/account/account.repository'
import { OtpService } from '@/modules/otp/otp.service'
import { UserRepository } from '@/shared/repositories'

enum Role {
	USER = 0,
	ADMIN = 1,
	UNRECOGNIZED = -1
}

@Injectable()
export class AccountService {
	public constructor(
		private readonly accountRepository: AccountRepository,
		private readonly userRepository: UserRepository,
		private readonly otpService: OtpService
	) {}

	public async getAccount(data: GetAccountRequest) {
		const { id } = data

		const account = await this.accountRepository.findById(id)

		if (!account)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Account not found'
			})

		return {
			id: account.id,
			phone: account.phone,
			email: account.email,
			isPhoneVerified: account.isPhoneVerified,
			isEmailVerified: account.isEmailVerified,
			role: convertEnum(Role, account.role)
		}
	}

	public async initEmailChange(data: InitEmailChangeRequest) {
		const { email, userId } = data

		const existing = await this.userRepository.findByEmail(email)

		if (existing)
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: 'Email already in use'
			})

		const { code, hash } = await this.otpService.send(email, 'email')

		console.log(code)

		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: 'email',
			value: email,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		return { ok: true }
	}

	public async confirmEmailChange(data: ConfirmEmailChangeRequest) {
		const { email, code, userId } = data

		const pending = await this.accountRepository.findPendingChange(
			userId,
			'email'
		)

		if (!pending)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'No pending request'
			})

		if (pending.value !== email)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Email mismatch'
			})

		if (pending.expiresAt < new Date())
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Code expired'
			})

		this.otpService.verify(pending.value, code, 'email')

		await this.userRepository.update(userId, {
			email,
			isEmailVerified: true
		})

		await this.accountRepository.deletePendingChange(userId, 'email')

		return { ok: true }
	}

	public async initPhoneChange(data: InitPhoneChangeRequest) {
		const { phone, userId } = data

		const existing = await this.userRepository.findByPhone(phone)

		if (existing)
			throw new RpcException({
				code: RpcStatus.ALREADY_EXISTS,
				details: 'Phone already in use'
			})

		const { code, hash } = await this.otpService.send(phone, 'phone')

		console.log(code)

		await this.accountRepository.upsertPendingChange({
			accountId: userId,
			type: 'phone',
			value: phone,
			codeHash: hash,
			expiresAt: new Date(Date.now() + 5 * 60 * 1000)
		})

		return { ok: true }
	}

	public async confirmPhoneChange(data: ConfirmPhoneChangeRequest) {
		const { phone, code, userId } = data

		const pending = await this.accountRepository.findPendingChange(
			userId,
			'phone'
		)

		if (!pending)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'No pending request'
			})

		if (pending.value !== phone)
			throw new RpcException({
				code: RpcStatus.INVALID_ARGUMENT,
				details: 'Phone mismatch'
			})

		if (pending.expiresAt < new Date())
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Code expired'
			})

		this.otpService.verify(pending.value, code, 'phone')

		await this.userRepository.update(userId, {
			phone,
			isPhoneVerified: true
		})

		await this.accountRepository.deletePendingChange(userId, 'phone')

		return { ok: true }
	}
}
