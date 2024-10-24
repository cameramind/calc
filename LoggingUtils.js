class LoggingUtils {
    static log(message, ...args) {
        console.log(`[LOG] ${message}`, ...args);
    }

    static handleError(error, userMessage) {
        console.error('[ERROR]', error);
        this.showError(userMessage || 'An unexpected error occurred.');
    }
    static showWarnings(warnings) {
        const warningsDiv = document.getElementById('warnings');
        if (!warningsDiv) return;

        if (warnings.length > 0) {
            warningsDiv.innerHTML = warnings.map(w => `<div class="warning-item">⚠️ ${w}</div>`).join('');
            warningsDiv.style.display = 'block';
        } else {
            warningsDiv.style.display = 'none';
        }
    }
    static showError(message) {
        console.error(message);
        const results = document.getElementById('results');
        if (results) {
            results.innerHTML = `<div class="alert alert-error">${message}</div>`;
        } else {
            alert(message);
        }
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoggingUtils;
}
