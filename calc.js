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
            this.boardsData = await response.json();
            this.initializeBoardSelect();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to load board data:', error);
            this.showError('Failed to load board data. Please refresh the page.');
        }
    }

    initializeBoardSelect() {
        const select = document.getElementById('boardSelect');
        Object.entries(this.boardsData.boards).forEach(([key, board]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = `${board.name} (${board.ram}GB RAM)`;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        // Add input event listeners to all form elements
        const formElements = document.querySelectorAll('input, select');
        formElements.forEach(element => {
            if (element.type === 'radio') {
                element.addEventListener('change', () => this.debounceCalculate());
            } else {
                element.addEventListener('input', () => this.debounceCalculate());
                element.addEventListener('change', () => this.debounceCalculate());
            }
        });

        // Special handling for board selection
        document.getElementById('boardSelect').addEventListener('change', () => {
            this.updateBoardSpecs();
            this.calculate();
        });

        // Initialize debounce timer
        this.debounceTimer = null;
    }

    debounceCalculate(delay = 300) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.calculate(), delay);
    }

    updateBoardSpecs() {
        const boardId = document.getElementById('boardSelect').value;
        if (!boardId) {
            document.getElementById('boardSpecs').style.display = 'none';
            return;
        }

        const board = this.boardsData.boards[boardId];
        document.getElementById('boardSpecs').style.display = 'block';

        // Update board specifications display
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
            boardId: document.getElementById('boardSelect').value,
            resolution: document.getElementById('resolution').value,
            fps: Number(document.getElementById('fps').value),
            codec: document.querySelector('input[name="codec"]:checked')?.value || 'H265',
            cameraCount: Number(document.getElementById('cameraCount').value),
            recordHours: Number(document.getElementById('recordHours').value),
            storageDays: Number(document.getElementById('storageDays').value),
            quality: document.getElementById('quality').value,
            bitrateMode: document.getElementById('bitrateMode').value
        };
    }

    validateInputs(input) {
        const warnings = [];
        
        if (!input.boardId) {
            warnings.push('Please select a board');
            return warnings;
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

    updateResults(results) {
        // Show results container
        document.getElementById('results').style.display = 'block';

        // Update bandwidth results
        this.updateElement('bandwidthPerCamera', `${results.bandwidthPerCamera.toFixed(2)} Mbps`);
        this.updateElement('totalBandwidth', `${results.totalBandwidth.toFixed(2)} Mbps`);
        this.updateElement('storagePerDay', `${results.storagePerDay.toFixed(1)} GB`);
        this.updateElement('totalStorage', `${results.totalStorage.toFixed(1)} GB`);

        // Update resource utilization table
        this.updateResourceTable(results);
    }

    updateResourceTable(results) {
        const board = this.boardsData.boards[results.boardId];
        
        // Network utilization
        const networkRow = document.getElementById('networkRow');
        this.updateTableRow(networkRow, {
            required: `${results.totalBandwidth.toFixed(2)} Mbps`,
            available: `${board.lan * 1000} Mbps`,
            status: results.totalBandwidth > board.lan * 1000
        });

        // RAM utilization
        const ramRow = document.getElementById('ramRow');
        this.updateTableRow(ramRow, {
            required: `${results.ramUsage.toFixed(1)} GB`,
            available: `${board.ram} GB`,
            status: results.ramUsage > board.ram
        });

        // CPU/Decoder utilization
        const cpuRow = document.getElementById('cpuRow');
        const maxCameras = this.getMaxCameras(board, results.resolution);
        this.updateTableRow(cpuRow, {
            required: `${results.cameraCount} cameras`,
            available: `${maxCameras} cameras`,
            status: results.cameraCount > maxCameras
        });
    }

    updateTableRow(row, data) {
        const status = data.status ? '❌ Exceeded' : '✅ OK';
        const statusClass = data.status ? 'status-error' : 'status-ok';

        row.querySelector('.required').textContent = data.required;
        row.querySelector('.available').textContent = data.available;
        row.querySelector('.status').textContent = status;
        row.querySelector('.status').className = `status ${statusClass}`;
    }

    getMaxCameras(board, resolution) {
        const isFullHD = resolution === '1920x1080';
        return board.max_cameras[isFullHD ? '1080p' : '4k'];
    }

    showWarnings(warnings) {
        const warningsDiv = document.getElementById('warnings');
        if (warnings.length > 0) {
            warningsDiv.innerHTML = warnings.map(w => `<div class="warning-item">⚠️ ${w}</div>`).join('');
            warningsDiv.style.display = 'block';
        } else {
            warningsDiv.style.display = 'none';
        }
    }

    showError(message) {
        const results = document.getElementById('results');
        results.style.display = 'block';
        results.innerHTML = `<div class="alert alert-error">${message}</div>`;
    }

    calculate() {
        const input = this.getInputValues();
        const warnings = this.validateInputs(input);
        
        if (warnings.length > 0) {
            this.showWarnings(warnings);
            return;
        }

        try {
            const board = this.boardsData.boards[input.boardId];
            const [width, height] = input.resolution.split('x').map(Number);

            // Calculate requirements
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
            this.checkResourceLimits(results, board);

        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('Error during calculations. Please check your inputs.');
        }
    }

    checkResourceLimits(results, board) {
        const warnings = [];

        if (results.totalBandwidth > board.lan * 1000) {
            warnings.push(`Network bandwidth requirement (${results.totalBandwidth.toFixed(0)} Mbps) exceeds interface capacity (${board.lan * 1000} Mbps)`);
        }

        if (results.ramUsage > board.ram) {
            warnings.push(`RAM requirement (${results.ramUsage.toFixed(1)} GB) exceeds board capacity (${board.ram} GB)`);
        }

        const maxCameras = this.getMaxCameras(board, results.resolution);
        if (results.cameraCount > maxCameras) {
            warnings.push(`Number of cameras (${results.cameraCount}) exceeds board capacity (${maxCameras})`);
        }

        this.showWarnings(warnings);
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cameraCalculator = new CameraCalculator();
});
