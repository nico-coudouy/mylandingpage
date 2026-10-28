import { describe, expect, it } from 'vitest';
import { formatTimecode } from '../src/hooks/useTimecode';

describe('formatTimecode', () => {
  it('starts at zero', () => {
    expect(formatTimecode(0)).toBe('00:00:00:00');
  });
  it('counts frames at 25 fps', () => {
    expect(formatTimecode(1000 + 40 * 7)).toBe('00:00:01:07');
  });
  it('rolls minutes and hours', () => {
    expect(formatTimecode((3600 + 62) * 1000)).toBe('01:01:02:00');
  });
});
