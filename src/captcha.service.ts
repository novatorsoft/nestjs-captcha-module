export interface CaptchaService {
  verifyAsync(captchaToken: string): Promise<boolean>;
}
