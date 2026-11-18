import { Matches } from 'class-validator'

export class RmqValidator {
	@Matches(/^amqp:\/\/[^:]+:[^@]+@[^:]+:\d+$/)
	public RMQ_URL!: string
}
