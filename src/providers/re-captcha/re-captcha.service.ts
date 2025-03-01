import { Inject, Injectable } from '@nestjs/common';

import { CaptchaService } from '../../captcha.service';
import { ReCaptchaConfig } from './re-captcha.config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class ReCaptchaService implements CaptchaService {
  private readonly endpoint = 'https://www.google.com/recaptcha/api/siteverify';

  constructor(
    @Inject('CaptchaConfig') private readonly config: ReCaptchaConfig,
    private readonly httpService: HttpService,
  ) {}

  async verifyAsync(captchaToken: string): Promise<boolean> {
    const response = await firstValueFrom(
      this.httpService.get(this.config?.endpoint ?? this.endpoint, {
        params: {
          secret: this.config.secretKey,
          response: captchaToken,
        },
      }),
    );
    return response.data.success;
  }
}
