import { extractDomainName } from 'src/shared/utils/extract-domain-name';

describe('extractDomainName', () => {
  it('strips protocol and the www prefix', () => {
    expect(extractDomainName('https://www.example.com/path')).toBe(
      'example.com',
    );
    expect(extractDomainName('http://sub.example.com')).toBe('sub.example.com');
  });

  it('falls back to a truncated string for invalid urls', () => {
    expect(extractDomainName('not a url')).toBe('not a url');

    const long = 'x'.repeat(80);
    expect(extractDomainName(long)).toBe(long.slice(0, 50));
  });
});
