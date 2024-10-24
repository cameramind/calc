if (typeof module !== 'undefined' && module.exports) {
    const LoggingUtils = require('./LoggingUtils');
    const Gui = require('./Gui');
    const Initializer = require('./Initializer');
    const Calculation = require('./Calculation');
}

class CameraCalculator {
    constructor() {
        this.devices = [];
        LoggingUtils.log('CameraCalculator instance created');
    }

    async loadDevices() {
        try {
            LoggingUtils.log('Starting to load devices');
            const response = await fetch('/data/devices.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            LoggingUtils.log('Fetched data:', data);
            if (Array.isArray(data)) {
                this.devices = data;
            } else if (typeof data === 'object' && data !== null) {
                const arrayProperty = Object.values(data).find(Array.isArray);
                if (arrayProperty) {
                    this.devices = arrayProperty;
                } else {
                    throw new Error('Devices data is not in the expected format');
                }
            } else {
                throw new Error('Devices data is not in the expected format');
            }
            LoggingUtils.log('Devices loaded successfully', this.devices);
            this.populateBoardSelect();
        } catch (error) {
            LoggingUtils.handleError(error, 'Error loading devices');
        }
    }

    populateBoardSelect() {
        const boardSelect = document.getElementById('boardSelect');
        if (!boardSelect) {
            LoggingUtils.handleError(new Error('Board select element not found'), 'Error populating board select');
            return;
        }
        boardSelect.innerHTML = '<option value="">Choose a board...</option>';
        if (Array.isArray(this.devices)) {
            this.devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.id;
                option.textContent = device.name;
                boardSelect.appendChild(option);
            });
        } else {
            LoggingUtils.handleError(new Error('Devices data is not an array'), 'Error populating board select');
        }
    }

    calculate() {
        // Implement your calculation logic here
        console.log('Calculation triggered');
        // Update UI with calculation results
    }

    calculateAverageFrameSize(width, height, codec, quality) {
        // Calculate base size in KB (24-bit color depth)
        const baseSize = (width * height * 3) / 1024; // Convert to KB directly
        // Apply codec efficiency and quality factors
        return (baseSize / this.CODEC_EFFICIENCY[codec]) * this.QUALITY_FACTORS[quality];
    }

    calculateBitrate(frameSize, fps) {
        // Convert KB to Mbps: (frameSize KB * fps * 8 bits/byte) / 1000
        return (frameSize * fps * 8) / 1000;
    }

    calculateStorage(bitrate, hours, days, cameraCount) {
        // Convert Mbps to GB per day:
        // (bitrate Mbps * 3600 seconds/hour * hours * 0.125 MB/Mb) / 1024 MB/GB
        const dailyStorage = (bitrate * 3600 * hours * 0.125) / 1024;
        return dailyStorage * days * cameraCount;
    }

    calculateRamUsage(width, height, cameraCount) {
        // Calculate RAM per camera (4 bytes per pixel) in MB
        const ramPerCamera = (width * height * 4) / (1024 * 1024);
        return (ramPerCamera * cameraCount) + 2048; // Add 2GB (2048 MB) for system
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraCalculator;
}
