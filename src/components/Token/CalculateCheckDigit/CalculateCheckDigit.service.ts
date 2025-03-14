import { Injectable } from '@nestjs/common';

@Injectable()
export class CalculateCheckDigitService {
    execute(token: string): number {
        const digits = token.split('').map(Number).reverse();
        const weights = [2, 3, 4, 5, 6, 7];

        let sum = 0;
        digits.forEach((digit, index) => {
            sum += digit * weights[index % weights.length];
        });

        const remainder = sum % 11;
        return remainder < 2 ? 0 : 11 - remainder;
    }
}
