if (typeof module !== 'undefined' && module.exports) {
    const Gui = require('./Gui');
    const LoggingUtils = require('./LoggingUtils');
}
class Calculation {
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

    setCameraCalculator(calculator) {
        this.calculator = calculator;
    }

    setGui(gui) {
        this.gui = gui;
    }

    initializeApp(boardsData) {
        try {
            this.boardsData = boardsData;
            this.gui.initializeBoardSelect();
            this.gui.setupEventListeners();
            // Initialize with default values
            this.updateCalculations();
        } catch (error) {
            LoggingUtils.handleError(error, 'Failed to load board data. Please check your internet connection and try again.');
        }
    }


    static updateCalculations(calculator) {
        const input = calculator.getInputValues();
        const warnings = Gui.validateInputs(input);

        if (warnings.length > 0) {
            LoggingUtils.showWarnings(warnings);
            Gui.clearResults();
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



    static getMaxCameras(board, resolution) {
        const isFullHD = resolution === '1920x1080';
        return board.max_cameras[isFullHD ? '1080p' : '4k'];
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Calculation;
}
