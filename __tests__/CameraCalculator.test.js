const CameraCalculator = require('../calc');

describe('CameraCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new CameraCalculator();
  });

  test('calculateBitrate returns correct value', () => {
    const result = calculator.calculateBitrate(1920, 1080, 30, 'H264', 'medium');
    expect(result).toBeCloseTo(5.93, 2);
  });

  test('calculateStorage returns correct value', () => {
    const result = calculator.calculateStorage(6, 24, 30, 1);
    expect(result).toBeCloseTo(648, 2);
  });

  test('calculateRamUsage returns correct value', () => {
    const result = calculator.calculateRamUsage(1920, 1080, 5);
    expect(result).toBeCloseTo(2.04, 2);
  });
});
