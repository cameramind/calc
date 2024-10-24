
// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.cameraCalculator = new CameraCalculator();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CameraCalculator;
}
