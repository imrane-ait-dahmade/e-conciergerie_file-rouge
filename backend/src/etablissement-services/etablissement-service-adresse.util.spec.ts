import { resolveAdresseLineForDto } from './etablissement-service-adresse.util';

describe('resolveAdresseLineForDto', () => {
  it('prefers adresse over address', () => {
    expect(
      resolveAdresseLineForDto({
        adresse: '  A  ',
        address: 'B',
      }),
    ).toBe('A');
  });

  it('uses address when adresse absent', () => {
    expect(resolveAdresseLineForDto({ address: '  X  ' })).toBe('X');
  });
});
