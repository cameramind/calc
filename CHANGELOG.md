# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

### Changed
- Renamed `Calculation` class to `Calculation` for better clarity
- Updated all references to `Calculation` in the codebase

### Fixed
- Corrected module import in CameraCalculator test file

## [0.6.0] - 2024-10-24

### Added
- New `calculateAverageFrameSize` method for more accurate bitrate calculations
- Additional unit tests for `calculateBitrate` and `calculateAverageFrameSize` methods
- Improved accuracy in bandwidth and storage calculations

### Changed
- Updated `calculateBitrate` method to use the new frame size calculation
- Refactored `updateCalculations` method to use the new calculation approach
- Modified unit tests to reflect changes in calculation methods

### Fixed
- Corrected bitrate calculation to more accurately reflect real-world scenarios

## [0.5.0] - 2024-10-24

### Added
- Option to add M.2 disk storage to the selected board
- New storage options: 128GB, 256GB, 512GB, 1TB
- Updated calculations to include additional M.2 storage
- New UI element for selecting M.2 storage

### Changed
- Modified storage calculations to consider both board storage and additional M.2 storage
- Updated results display to show total available storage

## [0.4.0] - 2024-10-24

### Added
- Implemented more robust error handling throughout the application
- Added new handleError method for centralized error management

### Changed
- Updated initializeApp and updateCalculations methods to use new error handling

## [0.3.0] - 2024-10-24

### Added
- Expanded unit tests for core calculation methods
- Added input validation tests
- Updated project plan and TODO list

### Changed
- Refactored `CameraCalculator` class to focus on core calculation methods
- Moved UI-related functions to `Gui` class
- Relocated logging and error handling to `LoggingUtils` class
- Transferred calculation update logic to `Calculation` class
- Shifted initialization logic to `Initializer` class
- Updated `index.html` to include new JavaScript files
- Modified how modules are loaded to support both browser and Node.js environments

### Removed
- Removed redundant methods from `CameraCalculator` class

## [1.0.0] - 2024-10-24

### Added
- Initial release of the IP Camera Resource Calculator
- Basic functionality for calculating bandwidth, storage, and resource requirements
- Support for various camera resolutions, codecs, and quality settings
- Board selection feature with specifications display
- Results section showing calculated values and resource utilization

## [1.1.0] - 2023-10-10
### Added
- Added `LoggingUtils.log` method for improved logging.
- Implemented error handling in `CameraCalculator.js` to ensure devices are loaded correctly.
- Added event listeners in `events.js` to trigger calculations on form input changes.

### Fixed
- Resolved issue with `populateBoardSelect` method in `CameraCalculator.js` where `this.devices` was not an array.
- Improved error messages and logging for better debugging.

### Changed
- Updated `data/devices.json` to ensure correct format for device data.
