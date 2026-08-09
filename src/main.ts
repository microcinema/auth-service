import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { createGrpcServer } from './infrastructure/grpc/grpc.server'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	const configService = app.get(ConfigService)

	createGrpcServer(app, configService)

	await app.startAllMicroservices()
	await app.init()
}
bootstrap()
