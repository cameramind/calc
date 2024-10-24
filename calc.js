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
            const response = await fetch('data/sbc-devices.json');
            this.boardsData = await response.json();
            this.initializeBoardSelect();
            this.setupEventListeners();
            // Initialize with default values
            this.updateCalculations();
        } catch (error) {
            console.error('Failed to load board data:', error);
            this.showError('Failed to load board data. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Monitor all form inputs for changes
        const formInputs = document.querySelectorAll('input, select');
        formInputs.forEach(input => {
            const updateHandler = () => this.handleInputChange(input);
            
            if (input.type === 'radio') {
                input.addEventListener('change', updateHandler);
            } else {
                input.addEventListener('input', updateHandler);
                input.addEventListener('change', updateHandler);
            }
        });

        // Special handling for board selection
        document.getElementById('boardSelect').addEventListener('change', () => {
            this.updateBoardSpecs();
            this.updateCalculations();
        });
    }

    handleInputChange(input) {
        // Validate input if needed
        if (input.type === 'number') {
            const value = parseFloat(input.value);
            const min = parseFloat(input.min);
            const max = parseFloat(input.max);

            if (value < min) input.value = min;
            if (value > max) input.value = max;
        }

        // Debounce the update
        this.debounceUpdate();
    }

    debounceUpdate(delay = 300) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.updateCalculations(), delay);
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
                this.clearResults();
                return;
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
            this.checkResourceLimits(results, board);

        } catch (error) {
            console.error('Calculation error:', error);
            this.showError('Error during calculations. Please check your inputs.');
        }
    }

    clearResults() {
        const placeholders = document.querySelectorAll('.result-value, .required, .available, .status');
        placeholders.forEach(element => {
            element.textContent = '-';
            if (element.classList.contains('status')) {
                element.className = 'status';
            }
        });
    }

    updateResults(results) {
        // Update bandwidth results with animations
        this.animateValue('bandwidthPerCamera', results.bandwidthPerCamera, 'Mbps');
        this.animateValue('totalBandwidth', results.totalBandwidth, 'Mbps');
        this.animateValue('storagePerDay', results.storagePerDay, 'GB');
        this.animateValue('totalStorage', results.totalStorage, 'GB');

        // Update resource table
        this.updateResourceTable(results);
    }

    animateValue(elementId, newValue, unit) {
        const element = document.getElementById(elementId);
        const currentValue = parseFloat(element.textContent) || 0;
        const duration = 500; // Animation duration in ms
        const steps = 20; // Number of steps in animation
        const increment = (newValue - currentValue) / steps;
        let step = 0;

        const animate = () => {
            step++;
            const value = currentValue + (increment * step);
            element.textContent = `${value.toFixed(2)} ${unit}`;

            if (step < steps) {
                requestAnimationFrame(animate);
            }
        };

        animate();
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
