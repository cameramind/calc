
// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {

    try {
        const response = await fetch('data/devices.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let cameraCalculator = new CameraCalculator();
        // window.cameraCalculator.setInitializer(initializer);
        // window.cameraCalculator.setDevices(response.json());
        let initializer = new Initializer();
        initializer.setCameraCalculator(cameraCalculator);
        initializer.setDevices(response.json());

        window.cameraCalculator = cameraCalculator;

    } catch (error) {
        LoggingUtils.handleError(error, 'Failed to load board data. Please check your internet connection and try again.');
    }

});


