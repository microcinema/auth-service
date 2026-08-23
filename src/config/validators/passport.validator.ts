import { IsNumber, IsString } from 'class-validator'

export class PassportValidator {
	@IsString()
	public PASSPORT_SECRET_KEY!: string

	@IsNumber()
	public PASSPORT_ACCESS_TTL!: number

	@IsNumber()
	public PASSPORT_REFRESH_TTL!: number
}
