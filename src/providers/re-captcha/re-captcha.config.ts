import { CaptchaConfig } from '../../config';

export class ReCaptchaConfig extends CaptchaConfig {
  secretKey: string;
  endpoint?: string;
}
