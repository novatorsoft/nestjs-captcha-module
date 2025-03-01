import { Faker, MockFactory } from 'mockingbird';

import { CaptchaModule } from './captcha.module';
import { CaptchaProvider } from './dto';
import { ReCaptchaConfigFixture } from '../test/fixtures';
import { ReCaptchaService } from './providers/re-captcha';
import { Test } from '@nestjs/testing';

describe('CaptchaModule', () => {
  describe('ReCaptcha Provider', () => {
    describe('register', () => {
      it('ReCaptcha should be defined', async () => {
        const reCaptchaConfig = MockFactory(ReCaptchaConfigFixture)
          .mutate({
            isGlobal: false,
            provider: CaptchaProvider.RECAPTCHA,
          })
          .one();
        const module = await Test.createTestingModule({
          imports: [CaptchaModule.register(reCaptchaConfig)],
        }).compile();

        const service = module.get<ReCaptchaService>('CaptchaService');
        expect(service).toBeDefined();
      });

      it('ReCaptcha should be defined (global defined)', async () => {
        const reCaptchaConfig = MockFactory(ReCaptchaConfigFixture)
          .mutate({
            isGlobal: true,
            provider: CaptchaProvider.RECAPTCHA,
          })
          .one();
        const module = await Test.createTestingModule({
          imports: [CaptchaModule.register(reCaptchaConfig)],
        }).compile();

        const service = module.get<ReCaptchaService>('CaptchaService');
        expect(service).toBeDefined();
      });
    });

    describe('registerAsync', () => {
      it('ReCaptcha should be defined', async () => {
        const reCaptchaConfig = MockFactory(ReCaptchaConfigFixture)
          .mutate({
            provider: CaptchaProvider.RECAPTCHA,
          })
          .one();
        const module = await Test.createTestingModule({
          imports: [
            CaptchaModule.registerAsync({
              provider: CaptchaProvider.RECAPTCHA,
              isGlobal: false,
              useFactory: () => reCaptchaConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<ReCaptchaService>('CaptchaService');
        expect(service).toBeDefined();
      });

      it('ReCaptcha should be defined(with default global config)', async () => {
        const reCaptchaConfig = MockFactory(ReCaptchaConfigFixture)
          .mutate({
            provider: CaptchaProvider.RECAPTCHA,
          })
          .one();
        const module = await Test.createTestingModule({
          imports: [
            CaptchaModule.registerAsync({
              provider: CaptchaProvider.RECAPTCHA,
              useFactory: () => reCaptchaConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<ReCaptchaService>('CaptchaService');
        expect(service).toBeDefined();
      });

      it('ReCaptcha should be defined (global defined)', async () => {
        const reCaptchaConfig = MockFactory(ReCaptchaConfigFixture)
          .mutate({
            provider: CaptchaProvider.RECAPTCHA,
          })
          .one();
        const module = await Test.createTestingModule({
          imports: [
            CaptchaModule.registerAsync({
              provider: CaptchaProvider.RECAPTCHA,
              isGlobal: true,
              useFactory: () => reCaptchaConfig,
              inject: [],
            }),
          ],
        }).compile();

        const service = module.get<ReCaptchaService>('CaptchaService');
        expect(service).toBeDefined();
      });
    });
  });

  it('should throw an error when given an invalid provider', async () => {
    expect(async () => {
      await Test.createTestingModule({
        imports: [
          CaptchaModule.register({
            provider: Faker.lorem.word(),
          } as any),
        ],
      }).compile();
    }).rejects.toThrow('Invalid captcha provider');
  });
});
