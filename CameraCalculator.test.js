/**
 * @jest-environment jsdom
 */

const CameraCalculator = require('./CameraCalculator');

// Mock the fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      boards: {
        "test-board": {
          name: "Test Board",
          ram: 4,
          storage: 32,
          lan: 1,
          wifi: "WiFi 6",
          npu: 5,
          max_cameras: {
            "1080p": 8,
            "4k": 4
          }
        }
      }
    })
  })
);

describe('CameraCalculator', () => {
    let calculator;

    beforeEach(() => {
        // Setup DOM elements needed by CameraCalculator
        document.body.innerHTML = `
            <div id="results"></div>
            <div id="warnings"></div>
            <select id="boardSelect"></select>
        `;
        
        // Reset fetch mock
        global.fetch.mockClear();
        
        calculator = new CameraCalculator();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    test('calculateAverageFrameSize() calculates correctly', () => {
        const width = 1920;
        const height = 1080;
        const codec = 'H264';
        const quality = 'medium';
        
        const result = calculator.calculateAverageFrameSize(width, height, codec, quality);
        expect(result).toBeGreaterThan(0);
    });

    test('calculateBitrate() calculates correctly', () => {
        const width = 1920;
        const height = 1080;
        const fps = 30;
        const codec = 'H264';
        const quality = 'medium';
        
        const result = calculator.calculateBitrate(width, height, fps, codec, quality);
        expect(result).toBeGreaterThan(0);
    });

    test('calculateStorage() calculates correctly', () => {
        const bitrate = 5; // 5 Mbps
        const hours = 24;
        const days = 30;
        const cameraCount = 4;
        
        const result = calculator.calculateStorage(bitrate, hours, days, cameraCount);
        expect(result).toBeGreaterThan(0);
    });

    test('calculateRamUsage() calculates correctly', () => {
        const width = 1920;
        const height = 1080;
        const cameraCount = 4;
        
        const result = calculator.calculateRamUsage(width, height, cameraCount);
        expect(result).toBeGreaterThan(2); // Should be at least system RAM (2GB)
    });

    test('validateInputs() detects missing board', () => {
        const input = {
            boardId: '',
            cameraCount: 4,
            fps: 30,
            storageDays: 30
        };
        
        const warnings = calculator.validateInputs(input);
        expect(warnings).toContain('Please select a board');
    });

    test('validateInputs() detects invalid camera count', () => {
        const input = {
            boardId: '1',
            cameraCount: 0,
            fps: 30,
            storageDays: 30
        };
        
        const warnings = calculator.validateInputs(input);
        expect(warnings).toContain('Camera count must be at least 1');
    });

    test('validateInputs() detects invalid fps', () => {
        const input = {
            boardId: '1',
            cameraCount: 4,
            fps: 0,
            storageDays: 30
        };
        
        const warnings = calculator.validateInputs(input);
        expect(warnings).toContain('FPS must be at least 1');
    });

    test('validateInputs() detects invalid storage days', () => {
        const input = {
            boardId: '1',
            cameraCount: 4,
            fps: 30,
            storageDays: 0
        };
        
        const warnings = calculator.validateInputs(input);
        expect(warnings).toContain('Storage days must be at least 1');
    });

    test('initializeApp loads board data correctly', async () => {
        await calculator.initializeApp();
        expect(global.fetch).toHaveBeenCalledWith('data/devices.json');
    });
});
