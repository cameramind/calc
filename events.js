if (typeof module !== 'undefined' && module.exports) {
    const Gui = require('./Gui');
    const LoggingUtils = require('./LoggingUtils');
    const CameraCalculator = require('./CameraCalculator');
}
// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    try {
        LoggingUtils.log('DOM fully loaded and parsed');
        const calculator = new CameraCalculator();
        await calculator.loadDevices();

        // Set up event listeners for form inputs
        setupEventListeners(calculator);

        // Perform initial calculation
        calculator.calculate();
    } catch (error) {
        LoggingUtils.handleError(error, 'An error occurred while initializing the application. Please check the console for more details.');
    }
});

function setupEventListeners(calculator) {
    // Board selection
    document.getElementById('boardSelect').addEventListener('change', () => calculator.calculate());

    // Camera settings
    document.querySelectorAll('input[name="codec"]').forEach(radio => {
        radio.addEventListener('change', () => calculator.calculate());
    });
    document.getElementById('resolution').addEventListener('change', () => calculator.calculate());
    document.getElementById('bitrateMode').addEventListener('change', () => calculator.calculate());
    document.getElementById('quality').addEventListener('change', () => calculator.calculate());
    document.getElementById('fps').addEventListener('change', () => calculator.calculate());
    document.getElementById('cameraCount').addEventListener('input', () => calculator.calculate());

    // Storage settings
    document.getElementById('recordHours').addEventListener('change', () => calculator.calculate());
    document.getElementById('storageDays').addEventListener('input', () => calculator.calculate());
    document.getElementById('m2Storage').addEventListener('change', () => calculator.calculate());
}
