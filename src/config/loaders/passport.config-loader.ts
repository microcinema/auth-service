import { PassportOptions } from '@microcinema/passport'
import { ConfigService } from '@nestjs/config'

import type { AllConfigs } from '../interfaces/all-configs.interface'

export function getPassportConfig(
	configService: ConfigService<AllConfigs>
): PassportOptions {
	return {
		secretKey: configService.get('passport.secretKey', {
			infer: true
		})
	}
}
