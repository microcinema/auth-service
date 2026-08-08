import { RpcStatus } from '@microcinema/common'
import { Injectable } from '@nestjs/common'
import { RpcException } from '@nestjs/microservices'
import { createHash } from 'node:crypto'
import { generateCode } from 'patcode'

import { RedisService } from '@/infrastructure/redis/redis.service'

@Injectable()
export class OtpService {
	public constructor(private readonly redisService: RedisService) {}

	public async send(identifier: string, type: 'email' | 'phone') {
		const { code, hash } = this.generateCode()

		await this.redisService.set(
			`otp:${type}:${identifier}`,
			hash,
			'EX',
			60 * 5
		)

		return code
	}

	public async verify(
		identifier: string,
		code: string,
		type: 'email' | 'phone'
	) {
		const storedHash = await this.redisService.get(
			`otp:${type}:${identifier}`
		)

		if (!storedHash)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Invalid or expired OTP'
			})

		const incomingHash = createHash('sha256').update(code).digest('hex')

		if (incomingHash !== storedHash)
			throw new RpcException({
				code: RpcStatus.NOT_FOUND,
				details: 'Invalid or expired OTP'
			})

		await this.redisService.del(`otp:${type}:${identifier}`)
	}

	private generateCode() {
		const code = generateCode()
		const hash = createHash('sha256').update(code).digest('hex')

		return { code, hash }
	}
}
