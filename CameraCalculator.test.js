const CameraCalculator = require('./CameraCalculator');

describe('CameraCalculator', () => {
    let calculator;

    beforeEach(() => {
        calculator = new CameraCalculator();
    });

    // Helper function to check if value is within 2% of expected
    function isWithinTwoPercent(actual, expected) {
        const difference = Math.abs(actual - expected);
        const percentage = (difference / expected) * 100;
        return percentage <= 2;
    }

    test('calculateAverageFrameSize() calculates correctly for H264', () => {
        const width = 1920;
        const height = 1080;
        const codec = 'H264';
        const quality = 'medium';
        
        const result = calculator.calculateAverageFrameSize(width, height, codec, quality);
        const expected = 200.660625;
        expect(isWithinTwoPercent(result, expected)).toBe(true);
    });

    test('calculateBitrate() calculates correctly', () => {
        const frameSize = 200.660625; // KB
        const fps = 1;
        const expectedBitrate = 1.605; // Mbps
        
        const result = calculator.calculateBitrate(frameSize, fps);
        expect(isWithinTwoPercent(result, expectedBitrate)).toBe(true);
    });

    test('calculateStorage() calculates correctly', () => {
        const bitrate = 1.61; // Mbps
        const hours = 24;
        const days = 1;
        const cameraCount = 1;
        const expectedStorage = 19.07; // GB
        
        const result = calculator.calculateStorage(bitrate, hours, days, cameraCount);
        expect(isWithinTwoPercent(result, expectedStorage)).toBe(true);
    });

    test('complete calculation flow matches example', () => {
        // Step 1: Calculate frame size
        const width = 1920;
        const height = 1080;
        const codec = 'H264';
        const quality = 'medium';
        const frameSize = calculator.calculateAverageFrameSize(width, height, codec, quality);
        expect(isWithinTwoPercent(frameSize, 200.660625)).toBe(true);

        // Step 2: Calculate bitrate
        const fps = 1;
        const bitrate = calculator.calculateBitrate(frameSize, fps);
        expect(isWithinTwoPercent(bitrate, 1.605)).toBe(true);

        // Step 3: Calculate storage
        const hours = 24;
        const days = 1;
        const cameraCount = 1;
        const storage = calculator.calculateStorage(bitrate, hours, days, cameraCount);
        expect(isWithinTwoPercent(storage, 19.07)).toBe(true);
    });

    test('validateInputs() detects missing board', () => {
        const input = {
            boardId: '',
            cameraCount: 1,
            fps: 1,
            storageDays: 1
        };
        const warnings = calculator.validateInputs(input);
        expect(warnings).toContain('Please select a board');
    });

    test('validateInputs() detects invalid camera count', () => {
        const input = {
            boardId: '1',
            cameraCount: 0,
            fps: 1,
            storageDays: 1
        };
        const warnings = calculator.validateInputs(input);
        expect(warnings).toContain('Camera count must be at least 1');
    });

    test('validateInputs() detects invalid fps', () => {
        const input = {
            boardId: '1',
            cameraCount: 1,
            fps: 0,
            storageDays: 1
        };
        const warnings = calculator.validateInputs(input);
        expect(warnings).toContain('FPS must be at least 1');
    });

    test('validateInputs() detects invalid storage days', () => {
        const input = {
            boardId: '1',
            cameraCount: 1,
            fps: 1,
            storageDays: 0
        };
        const warnings = calculator.validateInputs(input);
        expect(warnings).toContain('Storage days must be at least 1');
    });
});
