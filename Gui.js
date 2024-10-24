class Gui {
    static setCalculation(calculationValues) {
        this.calculationValues = calculationValues;
    }

    static validateInputs(input) {
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

    static updateResults(results, calculator) {
        this.updateElement('bandwidthPerCamera', `${results.bandwidthPerCamera.toFixed(3)} Mbps`);
        this.updateElement('totalBandwidth', `${results.totalBandwidth.toFixed(3)} Mbps`);
        this.updateElement('storagePerDay', `${results.storagePerDay.toFixed(2)} GB`);
        this.updateElement('totalAvailableStorage', `${results.totalAvailableStorage.toFixed(2)} GB`);

        // Update stream parameters
        this.updateElement('streamResolution', results.resolution);
        this.updateElement('streamFps', results.fps);
        this.updateElement('streamCodec', results.codec);
        this.updateElement('streamQuality', results.quality);
        this.updateElement('averageFrameSize', `${results.averageFrameSize.toFixed(2)} KB`);

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
        this.updateTableRow('networkRow', {
            required: `${results.totalBandwidth.toFixed(2)} Mbps`,
            available: `${board.lan * 1000} Mbps`,
            status: results.totalBandwidth > board.lan * 1000
        });

        // RAM utilization
        this.updateTableRow('ramRow', {
            required: `${(results.ramUsage / 1024).toFixed(2)} GB`,
            available: `${board.ram} GB`,
            status: results.ramUsage > board.ram * 1024
        });

        // CPU/Decoder utilization
        const maxCameras = this.getMaxCameras(board, results.resolution);
        this.updateTableRow('cpuRow', {
            required: `${results.cameraCount} cameras`,
            available: `${maxCameras} cameras`,
            status: results.cameraCount > maxCameras
        });

        // Storage utilization
        this.updateTableRow('storageRow', {
            required: `${results.totalStorageRequired.toFixed(2)} GB`,
            available: `${(results.totalAvailableStorage).toFixed(2)} GB`,
            status: results.totalStorageRequired > results.totalAvailableStorage
        });
    }

    static updateElement(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    static updateTableRow(rowId, data) {
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

    static clearResults() {
        const elements = document.querySelectorAll('.result-value, .required, .available, .status');
        elements.forEach(element => {
            element.textContent = '-';
            if (element.classList.contains('status')) {
                element.className = 'status';
            }
        });
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

        // Add M.2 storage select
        const m2Select = document.getElementById('m2Storage');
        if (m2Select) {
            m2Select.innerHTML = '<option value="">No additional storage</option>';
            this.M2_STORAGE_OPTIONS.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size >= 1048576 ? `${size / 1048576} TB` : `${size / 1024} GB`;
                m2Select.appendChild(option);
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
        this.debounceTimer = setTimeout(() => Calculation.updateCalculations(this), delay);
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
            bitrateMode: document.getElementById('bitrateMode')?.value || 'VBR',
            m2Storage: Number(document.getElementById('m2Storage')?.value) || 0
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = Gui;
}
