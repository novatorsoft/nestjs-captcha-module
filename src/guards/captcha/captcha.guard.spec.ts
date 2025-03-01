import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Faker, MockFactory } from 'mockingbird';
import { Test, TestingModule } from '@nestjs/testing';

import { CaptchaGuard } from './captcha.guard';
import { ReCaptchaConfigFixture } from '../../../test/fixtures';

describe('CaptchaGuard', () => {
  let guard: CaptchaGuard;
  const mockCaptchaService = { verifyAsync: jest.fn() };
  const config = MockFactory(ReCaptchaConfigFixture).one();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaptchaGuard,
        {
          provide: 'CaptchaService',
          useValue: mockCaptchaService,
        },
        {
          provide: 'CaptchaConfig',
          useValue: config,
        },
      ],
    }).compile();

    guard = module.get<CaptchaGuard>(CaptchaGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should allow access when captcha verification succeeds', async () => {
      const captchaToken = Faker.datatype.uuid();
      mockCaptchaService.verifyAsync.mockResolvedValueOnce(true);

      const result = await guard.canActivate({
        switchToHttp: () => ({
          getRequest: () => ({
            headers: {
              'x-captcha-token': captchaToken,
            },
          }),
        }),
      } as ExecutionContext);

      expect(result).toBe(true);
      expect(mockCaptchaService.verifyAsync).toHaveBeenCalledWith(captchaToken);
    });

    it('should throw UnauthorizedException when captcha token is missing', async () => {
      await expect(
        guard.canActivate({
          switchToHttp: () => ({
            getRequest: () => ({
              headers: {},
              body: {},
            }),
          }),
        } as ExecutionContext),
      ).rejects.toThrow(new UnauthorizedException('Captcha token is required'));
    });

    it('should throw UnauthorizedException when verification fails', async () => {
      const captchaToken = Faker.datatype.uuid();
      mockCaptchaService.verifyAsync.mockResolvedValueOnce(false);

      await expect(
        guard.canActivate({
          switchToHttp: () => ({
            getRequest: () => ({
              headers: {
                'x-captcha-token': captchaToken,
              },
            }),
          }),
        } as ExecutionContext),
      ).rejects.toThrow(
        new UnauthorizedException('Captcha verification failed'),
      );
    });

    it('should get token from body when configured', async () => {
      const captchaToken = Faker.datatype.uuid();
      const configWithBodyLocation = {
        ...config,
        guardOptions: {
          location: 'body',
          fieldName: Faker.lorem.word(),
        },
      };

      const moduleWithBodyConfig = await Test.createTestingModule({
        providers: [
          CaptchaGuard,
          {
            provide: 'CaptchaService',
            useValue: mockCaptchaService,
          },
          {
            provide: 'CaptchaConfig',
            useValue: configWithBodyLocation,
          },
        ],
      }).compile();

      const guardWithBodyConfig =
        moduleWithBodyConfig.get<CaptchaGuard>(CaptchaGuard);

      mockCaptchaService.verifyAsync.mockResolvedValueOnce(true);

      await guardWithBodyConfig.canActivate({
        switchToHttp: () => ({
          getRequest: () => ({
            body: {
              [configWithBodyLocation.guardOptions.fieldName]: captchaToken,
            },
          }),
        }),
      } as ExecutionContext);

      expect(mockCaptchaService.verifyAsync).toHaveBeenCalledWith(captchaToken);
    });
  });
});
