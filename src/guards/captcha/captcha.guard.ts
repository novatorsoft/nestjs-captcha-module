import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CaptchaService } from '../../captcha.service';
import { CaptchaConfig } from '../../config';

@Injectable()
export class CaptchaGuard implements CanActivate {
  private readonly defaultCaptchaFieldName = 'x-captcha-token';
  constructor(
    @Inject('CaptchaService') private readonly captchaService: CaptchaService,
    @Inject('CaptchaConfig') private readonly captchaConfig: CaptchaConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const captchaToken = this.getCaptchaToken(context);
    if (!captchaToken)
      throw new UnauthorizedException('Captcha token is required');

    const captchaResponse = await this.captchaService.verifyAsync(captchaToken);

    if (!captchaResponse)
      throw new UnauthorizedException('Captcha verification failed');

    return true;
  }

  private getCaptchaToken(context: ExecutionContext): string {
    const captchaTokenFieldName =
      this.captchaConfig?.guardOptions?.fieldName ??
      this.defaultCaptchaFieldName;
    const request = context.switchToHttp().getRequest();
    return this.captchaConfig?.guardOptions?.location === 'body'
      ? request?.body[captchaTokenFieldName]
      : request?.headers[captchaTokenFieldName];
  }
}
