// script.js
class CameraCalculator {
    constructor() {
        this.boardsData = null;
        this.CODEC_EFFICIENCY = {
            'MJPEG': 10.0,
            'MPEG4': 2.0,
            'H264': 1.0,
            'H265': 0.7
        };
        this.QUALITY_FACTORS = {
            'highest': 1.5,
            'high': 1.2,
            'medium': 1.0,
            'low': 0.8
        };
        this.initializeApp();
    }

    async initializeApp() {
        try {
            const response = await fetch('data/devices.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.boardsData = await response.json();
            this.initializeBoardSelect();
            this.setupEventListeners();
            // Initialize with default values
            this.updateCalculations();
        } catch (error) {
            this.handleError(error, 'Failed to load board data. Please check your internet connection and try again.');
        }
    }

    initializeBoardSelect() {
        const select = document.getElementById('boardSelect');
        if (!select) {
            console.error('Board select element not found');
            return;
        }

        // Clear existing options
        select.innerHTML = '<option value="">Choose a board...</option>';

        // Add options for each board
        if (this.boardsData && this.boardsData.boards) {
            Object.entries(this.boardsData.boards).forEach(([key, board]) => {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = `${board.name} (${board.ram}GB RAM)`;
                select.appendChild(option);
            });
        }
    }

    setupEventListeners() {
        // Monitor all form inputs for changes
        const formInputs = document.querySelectorAll('input, select');
        formInputs.forEach(input => {
            if (input.type === 'radio') {
                input.addEventListener('change', () => this.handleInputChange(input));
            } else {
                input.addEventListener('input', () => this.handleInputChange(input));
                input.addEventListener('change', () => this.handleInputChange(input));
            }
        });

        // Special handling for board selection
        const boardSelect = document.getElementById('boardSelect');
        if (boardSelect) {
            boardSelect.addEventListener('change', () => {
                this.updateBoardSpecs();
                this.updateCalculations();
            });
        }
    }

    handleInputChange(input) {
        if (input.type === 'number') {
            const value = parseFloat(input.value);
            const min = parseFloat(input.min) || 0;
            const max = parseFloat(input.max) || Infinity;

            if (value < min) input.value = min;
            if (value > max) input.value = max;
        }
        this.debounceUpdate();
    }

    debounceUpdate(delay = 300) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => this.updateCalculations(), delay);
    }

    updateBoardSpecs() {
        const boardId = document.getElementById('boardSelect')?.value;
        const boardSpecs = document.getElementById('boardSpecs');

        if (!boardId || !boardSpecs) {
            if (boardSpecs) boardSpecs.style.display = 'none';
            return;
        }

        const board = this.boardsData.boards[boardId];
        if (!board) return;

        boardSpecs.style.display = 'block';

        this.updateElement('specCpu', board.cpu);
        this.updateElement('specRam', `${board.ram} GB`);
        this.updateElement('specNetwork', `${board.lan}Gbps + ${board.wifi}`);
        this.updateElement('specNpu', `${board.npu} TOPS`);
    }

    updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    getInputValues() {
        return {
            boardId: document.getElementById('boardSelect')?.value || '',
            resolution: document.getElementById('resolution')?.value || '1920x1080',
            fps: Number(document.getElementById('fps')?.value) || 30,
            codec: document.querySelector('input[name="codec"]:checked')?.value || 'H265',
            cameraCount: Number(document.getElementById('cameraCount')?.value) || 1,
            recordHours: Number(document.getElementById('recordHours')?.value) || 24,
            storageDays: Number(document.getElementById('storageDays')?.value) || 30,
            quality: document.getElementById('quality')?.value || 'medium',
            bitrateMode: document.getElementById('bitrateMode')?.value || 'VBR'
        };
    }

    validateInputs(input) {
        const warnings = [];

        if (!input.boardId) {
            warnings.push('Please select a board');
        }
        if (input.cameraCount < 1) {
            warnings.push('Camera count must be at least 1');
        }
        if (input.fps < 1) {
            warnings.push('FPS must be at least 1');
        }
        if (input.storageDays < 1) {
            warnings.push('Storage days must be at least 1');
        }

        return warnings;
    }

    calculateBitrate(width, height, fps, codec, quality) {
        let baseBitrate = (width * height * fps) / (8 * 1024 * 1024);
        baseBitrate *= this.CODEC_EFFICIENCY[codec];
        baseBitrate *= this.QUALITY_FACTORS[quality];
        return baseBitrate;
    }

    calculateStorage(bitrate, hours, days, cameraCount) {
        const dailyStorage = (bitrate * 3600 * hours * 0.125); // GB per day
        return dailyStorage * days * cameraCount;
    }

    calculateRamUsage(width, height, cameraCount) {
        const ramPerCamera = (width * height * 4) / (1024 * 1024 * 1024); // GB
        return (ramPerCamera * cameraCount) + 2; // +2GB for system
    }

    updateCalculations() {
        const input = this.getInputValues();
        const warnings = this.validateInputs(input);

        // Always show results, but with warnings if needed
        if (warnings.length > 0) {
            this.showWarnings(warnings);
            this.clearResults();
            return;
        }

        try {
            const board = this.boardsData.boards[input.boardId];
            if (!board) {
                throw new Error('Invalid board selected');
            }

            const [width, height] = input.resolution.split('x').map(Number);

            // Calculate all requirements
            const bandwidthPerCamera = this.calculateBitrate(width, height, input.fps, input.codec, input.quality);
            const totalBandwidth = bandwidthPerCamera * input.cameraCount;
            const storagePerDay = this.calculateStorage(totalBandwidth, input.recordHours, 1, input.cameraCount);
            const totalStorage = storagePerDay * input.storageDays;
            const ramUsage = this.calculateRamUsage(width, height, input.cameraCount);

            const results = {
                boardId: input.boardId,
                bandwidthPerCamera,
                totalBandwidth,
                storagePerDay,
                totalStorage,
                ramUsage,
                resolution: input.resolution,
                cameraCount: input.cameraCount
            };

            this.updateResults(results);

        } catch (error) {
            this.handleError(error, 'Error during calculations. Please check your inputs and try again.');
        }
    }

    updateResults(results) {
        this.updateElement('bandwidthPerCamera', `${results.bandwidthPerCamera.toFixed(2)} Mbps`);
        this.updateElement('totalBandwidth', `${results.totalBandwidth.toFixed(2)} Mbps`);
        this.updateElement('storagePerDay', `${results.storagePerDay.toFixed(1)} GB`);
        this.updateElement('totalStorage', `${results.totalStorage.toFixed(1)} GB`);

        this.updateResourceTable(results);
    }

    updateResourceTable(results) {
        const board = this.boardsData.boards[results.boardId];
        
        // Network utilization
        this.updateTableRow('networkRow', {
            required: `${results.totalBandwidth.toFixed(2)} Mbps`,
            available: `${board.lan * 1000} Mbps`,
            status: results.totalBandwidth > board.lan * 1000
        });

        // RAM utilization
        this.updateTableRow('ramRow', {
            required: `${results.ramUsage.toFixed(1)} GB`,
            available: `${board.ram} GB`,
            status: results.ramUsage > board.ram
        });

        // CPU/Decoder utilization
        const maxCameras = this.getMaxCameras(board, results.resolution);
        this.updateTableRow('cpuRow', {
            required: `${results.cameraCount} cameras`,
            available: `${maxCameras} cameras`,
            status: results.cameraCount > maxCameras
        });
    }

    updateTableRow(rowId, data) {
        const row = document.getElementById(rowId);
        if (!row) return;

        const status = data.status ? '❌ Exceeded' : '✅ OK';
        const statusClass = data.status ? 'status-error' : 'status-ok';

        const requiredCell = row.querySelector('.required');
        const availableCell = row.querySelector('.available');
        const statusCell = row.querySelector('.status');

        if (requiredCell) requiredCell.textContent = data.required;
        if (availableCell) availableCell.textContent = data.available;
        if (statusCell) {
            statusCell.textContent = status;
            statusCell.className = `status ${statusClass}`;
        }
    }

    clearResults() {
        const elements = document.querySelectorAll('.result-value, .required, .available, .status');
        elements.forEach(element => {
            element.textContent = '-';
            if (element.classList.contains('status')) {
                element.className = 'status';
            }
        });
    }

    showWarnings(warnings) {
        const warningsDiv = document.getElementById('warnings');
        if (!warningsDiv) return;

        if (warnings.length > 0) {
            warningsDiv.innerHTML = warnings.map(w => `<div class="warning-item">⚠️ ${w}</div>`).join('');
            warningsDiv.style.display = 'block';
        } else {
            warningsDiv.style.display = 'none';
        }
    }

    showError(message) {
        console.error(message);
        const results = document.getElementById('results');
        if (results) {
            results.innerHTML = `<div class="alert alert-error">${message}</div>`;
        }
    }

    getMaxCameras(board, resolution) {
        const isFullHD = resolution === '1920x1080';
        return board.max_cameras[isFullHD ? '1080p' : '4k'];
    }

    handleError(error, userMessage) {
        console.error('Error:', error);
        this.showError(userMessage || 'An unexpected error occurred. Please try again.');
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cameraCalculator = new CameraCalculator();
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CameraCalculator;
}
