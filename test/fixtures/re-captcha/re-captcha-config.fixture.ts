import { Faker, Mock } from 'mockingbird';

import { CaptchaProvider } from '../../../src/dto';
import { ReCaptchaConfig } from '../../../src/providers/re-captcha';

export class ReCaptchaConfigFixture extends ReCaptchaConfig {
  @Mock(CaptchaProvider.RECAPTCHA)
  provider: CaptchaProvider;

  @Mock((faker) => faker.datatype.uuid())
  secretKey: string;

  @Mock((faker) => faker.datatype.boolean())
  isGlobal: boolean;

  endpoint: string;

  withEndpoint(): this {
    this.endpoint = Faker.internet.url();
    return this;
  }
}
