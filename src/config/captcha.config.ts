import { CaptchaProvider } from '../dto';

export class GuardOptions {
  location?: 'body' | 'header';
  fieldName?: string;
}

export class CaptchaConfig {
  provider: CaptchaProvider;
  isGlobal?: boolean;
  guardOptions?: GuardOptions;
}
