if (typeof module !== 'undefined' && module.exports) {
    const LoggingUtils = require('./LoggingUtils');
    const UIUtils = require('./UIUtils');
    const Initializer = require('./Initializer');
    const CalculationUtils = require('./CalculationUtils');
}

class CameraCalculator {



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
