import { Injectable } from '@nestjs/common'
import { Account } from '@prisma/generated/client'
import type { AccountCreateInput } from '@prisma/generated/models'

import { PrismaService } from '@/infrastructure/prisma/prisma.service'

@Injectable()
export class AuthRepository {
	public constructor(private readonly prismaService: PrismaService) {}

	public async create(data: AccountCreateInput): Promise<Account> {
		return await this.prismaService.account.create({
			data
		})
	}
}
