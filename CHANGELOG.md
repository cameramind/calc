# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Fixed
- Corrected module import in CameraCalculator test file

## [0.6.0] - 2023-06-18

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

## [0.5.0] - 2023-06-17

### Added
- Option to add M.2 disk storage to the selected board
- New storage options: 128GB, 256GB, 512GB, 1TB
- Updated calculations to include additional M.2 storage
- New UI element for selecting M.2 storage

### Changed
- Modified storage calculations to consider both board storage and additional M.2 storage
- Updated results display to show total available storage

## [0.4.0] - 2023-06-16

### Added
- Implemented more robust error handling throughout the application
- Added new handleError method for centralized error management

### Changed
- Updated initializeApp and updateCalculations methods to use new error handling

## [0.3.0] - 2023-06-15

### Added
- Expanded unit tests for core calculation methods
- Added input validation tests
- Updated project plan and TODO list

### Changed
- Refactored test structure for better organization

## [0.2.0] - 2023-06-15

### Added
- Set up Jest for unit testing
- Implemented initial unit tests for core calculation methods
- Updated TODO list based on comprehensive project plan

### Changed
- Refactored CameraCalculator class to be testable

## [0.1.0] - YYYY-MM-DD
- Initial release
