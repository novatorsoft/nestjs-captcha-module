import { Faker, MockFactory } from 'mockingbird';
import { Test, TestingModule } from '@nestjs/testing';

import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ReCaptchaConfigFixture } from '../../../test/fixtures';
import { ReCaptchaService } from './re-captcha.service';
import { of } from 'rxjs';

describe('ReCaptchaService', () => {
  let service: ReCaptchaService;
  let httpService: HttpService;
  const config = MockFactory(ReCaptchaConfigFixture).one();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReCaptchaService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: 'CaptchaConfig',
          useValue: config,
        },
      ],
    }).compile();

    service = module.get<ReCaptchaService>(ReCaptchaService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyAsync', () => {
    it('should return true when verification is successful', async () => {
      const captchaToken = Faker.datatype.uuid();
      const mockResponse: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      const result = await service.verifyAsync(captchaToken);
      expect(result).toBe(true);
      expect(httpService.get).toHaveBeenCalledWith(
        config.endpoint ?? 'https://www.google.com/recaptcha/api/siteverify',
        {
          params: {
            secret: config.secretKey,
            response: captchaToken,
          },
        },
      );
    });

    it('should return false when verification fails', async () => {
      const captchaToken = Faker.datatype.uuid();
      const mockResponse: AxiosResponse = {
        data: { success: false },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      const result = await service.verifyAsync(captchaToken);
      expect(result).toBe(false);
    });

    it('should use default endpoint when config endpoint is not provided', async () => {
      const captchaToken = Faker.datatype.uuid();
      const configWithoutEndpoint = MockFactory(ReCaptchaConfigFixture).one();
      delete configWithoutEndpoint.endpoint;

      const mockResponse: AxiosResponse = {
        data: { success: true },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {
          headers: {},
        } as any,
      };

      const moduleRef = await Test.createTestingModule({
        providers: [
          ReCaptchaService,
          {
            provide: HttpService,
            useValue: {
              get: jest.fn().mockReturnValue(of(mockResponse)),
            },
          },
          {
            provide: 'CaptchaConfig',
            useValue: configWithoutEndpoint,
          },
        ],
      }).compile();

      const serviceInstance = moduleRef.get<ReCaptchaService>(ReCaptchaService);
      const httpServiceInstance = moduleRef.get<HttpService>(HttpService);

      await serviceInstance.verifyAsync(captchaToken);
      expect(httpServiceInstance.get).toHaveBeenCalledWith(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          params: {
            secret: configWithoutEndpoint.secretKey,
            response: captchaToken,
          },
        },
      );
    });
  });
});
