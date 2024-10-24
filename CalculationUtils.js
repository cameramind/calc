if (typeof module !== 'undefined' && module.exports) {
    const UIUtils = require('./UIUtils');
    const LoggingUtils = require('./LoggingUtils');
}
class CalculationUtils {
    constructor() {
        this.boardsData = null;
        this.CODEC_EFFICIENCY = {
            'MJPEG': 10.0,
            'MPEG4': 2.0,
            'H264': 30.0,
            'H265': 0.7
        };
        this.QUALITY_FACTORS = {
            'highest': 1.5,
            'high': 1.2,
            'medium': 1.0,
            'low': 0.8
        };
        this.M2_STORAGE_OPTIONS = [131072, 262144, 524288, 1048576]; // in MB, 1048576 MB = 1 TB

    }

    static updateCalculations(calculator) {
        const input = calculator.getInputValues();
        const warnings = UIUtils.validateInputs(input);

        if (warnings.length > 0) {
            LoggingUtils.showWarnings(warnings);
            UIUtils.clearResults();
            return;
        }

        try {
            const board = calculator.boardsData.boards[input.boardId];
            if (!board) {
                throw new Error('Invalid board selected');
            }

            const [width, height] = input.resolution.split('x').map(Number);

            // Calculate all requirements
            const averageFrameSize = calculator.calculateAverageFrameSize(width, height, input.codec, input.quality);
            const bandwidthPerCamera = calculator.calculateBitrate(averageFrameSize, input.fps);
            const totalBandwidth = bandwidthPerCamera * input.cameraCount;
            const storagePerDay = calculator.calculateStorage(totalBandwidth, input.recordHours, 1, input.cameraCount);
            const totalStorageRequired = storagePerDay * input.storageDays;
            const ramUsage = calculator.calculateRamUsage(width, height, input.cameraCount);

            const totalAvailableStorage = (board.storage || 0) + input.m2Storage / 1024; // Convert MB to GB
            const storageSufficient = totalAvailableStorage >= totalStorageRequired;

            const results = {
                boardId: input.boardId,
                bandwidthPerCamera,
                totalBandwidth,
                storagePerDay,
                totalStorageRequired,
                ramUsage,
                resolution: input.resolution,
                cameraCount: input.cameraCount,
                m2Storage: input.m2Storage,
                totalAvailableStorage,
                storageSufficient,
                fps: input.fps,
                codec: input.codec,
                quality: input.quality,
                averageFrameSize
            };

            this.updateResults(results, calculator);

        } catch (error) {
            LoggingUtils.handleError(error, 'Error during calculations. Please check your inputs and try again.');
        }
    }

    static updateResults(results, calculator) {
        UIUtils.updateElement('bandwidthPerCamera', `${results.bandwidthPerCamera.toFixed(3)} Mbps`);
        UIUtils.updateElement('totalBandwidth', `${results.totalBandwidth.toFixed(3)} Mbps`);
        UIUtils.updateElement('storagePerDay', `${results.storagePerDay.toFixed(2)} GB`);
        UIUtils.updateElement('totalAvailableStorage', `${results.totalAvailableStorage.toFixed(2)} GB`);

        // Update stream parameters
        UIUtils.updateElement('streamResolution', results.resolution);
        UIUtils.updateElement('streamFps', results.fps);
        UIUtils.updateElement('streamCodec', results.codec);
        UIUtils.updateElement('streamQuality', results.quality);
        UIUtils.updateElement('averageFrameSize', `${results.averageFrameSize.toFixed(2)} KB`);

        const storageStatusElement = document.getElementById('storageStatus');
        if (storageStatusElement) {
            storageStatusElement.textContent = results.storageSufficient ? '✅ Sufficient' : '❌ Insufficient';
            storageStatusElement.className = results.storageSufficient ? 'status-ok' : 'status-error';
        }

        this.updateResourceTable(results, calculator);
    }

    static updateResourceTable(results, calculator) {
        const board = calculator.boardsData.boards[results.boardId];

        // Network utilization
        UIUtils.updateTableRow('networkRow', {
            required: `${results.totalBandwidth.toFixed(2)} Mbps`,
            available: `${board.lan * 1000} Mbps`,
            status: results.totalBandwidth > board.lan * 1000
        });

        // RAM utilization
        UIUtils.updateTableRow('ramRow', {
            required: `${(results.ramUsage / 1024).toFixed(2)} GB`,
            available: `${board.ram} GB`,
            status: results.ramUsage > board.ram * 1024
        });

        // CPU/Decoder utilization
        const maxCameras = this.getMaxCameras(board, results.resolution);
        UIUtils.updateTableRow('cpuRow', {
            required: `${results.cameraCount} cameras`,
            available: `${maxCameras} cameras`,
            status: results.cameraCount > maxCameras
        });

        // Storage utilization
        UIUtils.updateTableRow('storageRow', {
            required: `${results.totalStorageRequired.toFixed(2)} GB`,
            available: `${(results.totalAvailableStorage).toFixed(2)} GB`,
            status: results.totalStorageRequired > results.totalAvailableStorage
        });
    }

    static getMaxCameras(board, resolution) {
        const isFullHD = resolution === '1920x1080';
        return board.max_cameras[isFullHD ? '1080p' : '4k'];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalculationUtils;
}
