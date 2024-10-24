const CameraCalculator = require('../calc');

describe('CameraCalculator', () => {
  let calculator;

  beforeEach(() => {
    calculator = new CameraCalculator();
  });

  describe('calculateBitrate', () => {
    test('returns correct value for H264 medium quality', () => {
      const result = calculator.calculateBitrate(1920, 1080, 30, 'H264', 'medium');
      expect(result).toBeCloseTo(5.93, 2);
    });

    test('returns correct value for H265 high quality', () => {
      const result = calculator.calculateBitrate(3840, 2160, 60, 'H265', 'high');
      expect(result).toBeCloseTo(23.59, 2);
    });
  });

  describe('calculateStorage', () => {
    test('returns correct value for 1 day', () => {
      const result = calculator.calculateStorage(6, 24, 1, 1);
      expect(result).toBeCloseTo(21.6, 2);
    });

    test('returns correct value for 30 days and multiple cameras', () => {
      const result = calculator.calculateStorage(6, 24, 30, 5);
      expect(result).toBeCloseTo(3240, 2);
    });
  });

  describe('calculateRamUsage', () => {
    test('returns correct value for single camera', () => {
      const result = calculator.calculateRamUsage(1920, 1080, 1);
      expect(result).toBeCloseTo(2.01, 2);
    });

    test('returns correct value for multiple cameras', () => {
      const result = calculator.calculateRamUsage(3840, 2160, 5);
      expect(result).toBeCloseTo(2.16, 2);
    });
  });

  describe('validateInputs', () => {
    test('returns warnings for invalid inputs', () => {
      const invalidInput = {
        boardId: '',
        cameraCount: 0,
        fps: 0,
        storageDays: 0
      };
      const warnings = calculator.validateInputs(invalidInput);
      expect(warnings).toHaveLength(4);
      expect(warnings).toContain('Please select a board');
      expect(warnings).toContain('Camera count must be at least 1');
      expect(warnings).toContain('FPS must be at least 1');
      expect(warnings).toContain('Storage days must be at least 1');
    });

    test('returns no warnings for valid inputs', () => {
      const validInput = {
        boardId: 'board1',
        cameraCount: 1,
        fps: 30,
        storageDays: 30
      };
      const warnings = calculator.validateInputs(validInput);
      expect(warnings).toHaveLength(0);
    });
  });
});
