// script.js
class CameraCalculator {
    constructor() {
        this.boardsData = null;
        this.CODEC_EFFICIENCY = {
            'MJPEG': 10.0,
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
            const response = await fetch('devices.json');
            this.boardsData = await response.json();
            this.initializeBoardSelect();
            this.setupEventListeners();
        } catch (error) {
            console.error('Failed to load board data:', error);
        }
    }

    initializeBoardSelect() {
        const select = document.getElementById('boardSelect');
        Object.entries(this.boardsData.boards).forEach(([key, board]) => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = board.name;
            select.appendChild(option);
        });
    }

    setupEventListeners() {
        document.getElementById('boardSelect').addEventListener('change', () => this.updateBoardSpecs());
        document.getElementById('calculateBtn').addEventListener('click', () => this.calculate());
    }

    updateBoardSpecs() {
        const boardId = document.getElementById('boardSelect').value;
        if (!boardId) {
            document.getElementById('boardSpecs').style.display = 'none';
            return;
        }

        const board = this.boardsData.boards[boardId];
        document.getElementById('boardSpecs').style.display = 'block';
        document.getElementById('specCpu').textContent = board.cpu;
        document.getElementById('specRam').textContent = `${board.ram} GB`;
        document.getElementById('specNetwork').textContent = `${board.lan}Gbps + ${board.wifi}`;
        document.getElementById('specNpu').textContent = `${board.npu} TOPS`;
    }

    getInputValues() {
        return {
            boardId: document.getElementById('boardSelect').value,
            resolution: document.getElementById('resolution').value,
            fps: Number(document.getElementById('fps').value),
            codec: document.querySelector('input[name="codec"]:checked').value,
            cameraCount: Number(document.getElementById('cameraCount').value),
            recordHours: Number(document.getElementById('recordHours').value),
            storageDays: Number(document.getElementById('storageDays').value),
            quality: document.getElementById('quality').value
        };
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
        document.getElementById('results').style.display = 'block';
        
        // Update bandwidth results
        document.getElementById('bandwidthPerCamera').textContent = `${results.bandwidthPerCamera.toFixed(2)} Mbps`;
        document.getElementById('totalBandwidth').textContent = `${results.totalBandwidth.toFixed(2)} Mbps`;
        
        // Update storage results
        document.getElementById('storagePerDay').textContent = `${results.storagePerDay.toFixed(1)} GB`;
        document.getElementById('totalStorage').textContent = `${results.totalStorage.toFixed(1)} GB`;
        
        // Update resource utilization table
        this.updateResourceTable(results);
    }

    updateResourceTable(results) {
        const board = this.boardsData.boards[results.boardId];
        
        // Network utilization
        const networkRow = document.getElementById('networkRow');
        networkRow.querySelector('.required').textContent = `${results.totalBandwidth.toFixed(2)} Mbps`;
        networkRow.querySelector('.available').textContent = `${board.lan * 1000} Mbps`;
        networkRow.querySelector('.status').className = 
            `status ${results.totalBandwidth > board.lan * 1000 ? 'status-error' : 'status-ok'}`;
        
        // RAM utilization
        const ramRow = document.getElementById('ramRow');
        ramRow.querySelector('.required').textContent = `${results.ramUsage.toFixed(1)} GB`;
        ramRow.querySelector('.available').textContent = `${board.ram} GB`;
        ramRow.querySelector('.status').className = 
            `status ${results.ramUsage > board.ram ? 'status-error' : 'status-ok'}`;
    }

    calculate() {
        const input = this.getInputValues();
        if (!input.boardId) {
            alert('Please select a board first');
            return;
        }

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
            ramUsage
        };

        this.updateResults(results);
        this.checkWarnings(results, board);
    }

    checkWarnings(results, board) {
        const warnings = [];
        
        if (results.totalBandwidth > board.lan * 1000) {
            warnings.push(`Network bandwidth requirement exceeds board capacity`);
        }
        if (results.ramUsage > board.ram) {
            warnings.push(`RAM requirement exceeds board capacity`);
        }

        const warningsDiv = document.getElementById('warnings');
        if (warnings.length > 0) {
            warningsDiv.innerHTML = warnings.map(w => `<div class="warning-item">⚠️ ${w}</div>`).join('');
            warningsDiv.style.display = 'block';
        } else {
            warningsDiv.style.display = 'none';
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cameraCalculator = new CameraCalculator();
});
