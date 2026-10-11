import { RpcStatus } from '@microcinema/common'
import { convertEnum } from '@microcinema/common'
import { GetAccountRequest } from '@microcinema/contracts/gen/account'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'

import { AccountRepository } from '@/modules/account/account.repository'

enum Role {
	USER = 0,
	ADMIN = 1,
	UNRECOGNIZED = -1
}

@Injectable()
export class AccountService {
	public constructor(private readonly accountRepository: AccountRepository) {}

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
}
