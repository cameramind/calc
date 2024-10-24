# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Created new utility classes: `LoggingUtils`, `UIUtils`, `CalculationUtils`, and `Initializer`
- Implemented modular structure for better code organization and maintainability

### Changed
- Refactored `CameraCalculator` class to focus on core calculation methods
- Moved UI-related functions to `UIUtils` class
- Relocated logging and error handling to `LoggingUtils` class
- Transferred calculation update logic to `CalculationUtils` class
- Shifted initialization logic to `Initializer` class
- Updated `index.html` to include new JavaScript files
- Modified how modules are loaded to support both browser and Node.js environments

### Removed
- Removed redundant methods from `CameraCalculator` class

## [1.0.0] - 2023-XX-XX

### Added
- Initial release of the IP Camera Resource Calculator
- Basic functionality for calculating bandwidth, storage, and resource requirements
- Support for various camera resolutions, codecs, and quality settings
- Board selection feature with specifications display
- Results section showing calculated values and resource utilization
