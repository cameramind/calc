class LoggingUtils {
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
        }
    }

    static handleError(error, userMessage) {
        console.error('Error:', error);
        LoggingUtils.showError(userMessage || 'An unexpected error occurred. Please try again.');
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoggingUtils;
}
