import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculateCheckDigitService {
    execute(token: string): number {
        const digits = token.split('').map(Number);
        const primes = [2, 3, 5, 7, 11, 13];
        
        let sum = 0;
        digits.forEach((digit, index) => {
          sum += digit * primes[index % primes.length];
        });
        
        return sum % 19;
    }
}
