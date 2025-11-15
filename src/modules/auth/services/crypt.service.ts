import { cryptConstants } from '@modules/auth/constants/crypt';
import { Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class CryptService {
  async compare(password: string, encrypted: string): Promise<boolean> {
    return bcryptjs.compare(password, encrypted);
  }

  async hash(password: string): Promise<string> {
    const salt = await bcryptjs.genSalt(cryptConstants.SALT);
    return bcryptjs.hash(password, salt);
  }
}
