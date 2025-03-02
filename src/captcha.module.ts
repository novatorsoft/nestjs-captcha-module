import * as lodash from 'lodash';

import { CaptchaAsyncConfig, ConfigType } from './config';
import { DynamicModule, Module } from '@nestjs/common';

import { CaptchaGuard } from './guards';
import { CaptchaProvider } from './dto';
import { HttpModule } from '@nestjs/axios';
import { ReCaptchaService } from './providers/re-captcha';

@Module({})
export class CaptchaModule {
  static register(config: ConfigType): DynamicModule {
    return CaptchaModule.mergeObject(
      {
        module: CaptchaModule,
        global: config?.isGlobal ?? false,
        providers: [
          {
            provide: 'CaptchaConfig',
            useValue: config,
          },
          CaptchaGuard,
        ],
        exports: ['CaptchaService'],
      },
      CaptchaModule.getCaptchaProviderModuleConfig(config?.provider),
    );
  }

  static registerAsync(config: CaptchaAsyncConfig): DynamicModule {
    return CaptchaModule.mergeObject(
      {
        module: CaptchaModule,
        global: config?.isGlobal ?? false,
        imports: config.imports,
        exports: ['CaptchaService'],
        providers: [
          {
            provide: 'CaptchaConfig',
            useFactory: config.useFactory,
            inject: config.inject,
          },
          CaptchaGuard,
        ],
      },
      CaptchaModule.getCaptchaProviderModuleConfig(config?.provider),
    );
  }

  private static getCaptchaProviderModuleConfig(provider?: CaptchaProvider) {
    const authModuleConfigs = {
      [CaptchaProvider.RECAPTCHA]: {
        imports: [HttpModule],
        providers: [
          {
            provide: 'CaptchaService',
            useClass: ReCaptchaService,
          },
        ],
      },
    };

    const authModuleConfig = authModuleConfigs[provider];
    if (!authModuleConfig) throw new Error('Invalid captcha provider');
    return authModuleConfig;
  }

  private static mergeObject(object1: object, object2: object) {
    return lodash.mergeWith(object1, object2, (objValue, srcValue) => {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    });
  }
}
