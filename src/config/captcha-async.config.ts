import { FactoryProvider, ModuleMetadata } from '@nestjs/common';

import { CaptchaConfig } from './captcha.config';
import { ReCaptchaConfig } from '../providers';

export type ConfigType = ReCaptchaConfig;

export type CaptchaAsyncConfig = Pick<ModuleMetadata, 'imports'> &
  Pick<
    FactoryProvider<Pick<ConfigType, 'provider' | 'isGlobal'>>,
    'useFactory' | 'inject'
  > &
  CaptchaConfig;
