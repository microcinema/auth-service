import { Injectable } from '@nestjs/common'
import { Account, Prisma } from '@prisma/generated/client'

import { PrismaService } from '@/infrastructure/prisma/prisma.service'

@Injectable()
export class AuthRepository {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findByPhone(phone: string): Promise<Account | null> {
		return await this.prismaService.account.findUnique({
			where: {
				phone
			}
		})
	}

	public async findByEmail(email: string): Promise<Account | null> {
		return await this.prismaService.account.findUnique({
			where: {
				email
			}
		})
	}

	public async createAccount(
		data: Prisma.AccountCreateInput
	): Promise<Account> {
		return await this.prismaService.account.create({
			data
		})
	}

	public async update(
		id: string,
		data: Prisma.AccountUpdateInput
	): Promise<Account> {
		return await this.prismaService.account.update({
			where: {
				id
			},
			data
		})
	}
}
