# IP Camera Resource Calculator

## Overview
The IP Camera Resource Calculator is a web-based tool designed to help system integrators and IT professionals calculate resource requirements for IP camera installations on Single Board Computers (SBCs). It provides accurate estimations for bandwidth, storage, and hardware resource utilization based on different camera configurations and SBC specifications.

## Features
- Comprehensive SBC board comparison
- Bandwidth calculation for different video codecs (MJPEG, MPEG-4, H.264, H.265)
- Storage requirement estimation
- Hardware resource utilization analysis
- Multiple resolution support (from QCIF to 4K)
- Support for various frame rates and quality settings
- Real-time validation against SBC capabilities

## Project Structure
```
ip-camera-calculator/
├── index.html          # Main HTML file
├── styles.css          # CSS styles
├── script.js           # JavaScript functionality
├── data/
│   └── devices.json    # SBC specifications database
├── docs/              # Documentation
│   └── images/        # Screenshots and diagrams
└── README.md          # Project documentation
```

## Technical Requirements
- Modern web browser with JavaScript enabled
- Web server (for local development)
- No backend required - all calculations performed client-side

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/ip-camera-calculator.git
```

2. Navigate to the project directory:
```bash
cd ip-camera-calculator
```

3. Serve the files using a local web server. For example, using Python:
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

4. Access the calculator at `http://localhost:8000`

## Usage

1. **Board Selection**
   - Choose an SBC board from the dropdown menu
   - View detailed board specifications

2. **Camera Configuration**
   - Select video codec (MJPEG, MPEG-4, H.264, H.265)
   - Choose resolution
   - Set frame rate and quality
   - Specify number of cameras

3. **Storage Settings**
   - Set recording hours per day
   - Define storage retention period

4. **Results**
   - View bandwidth requirements
   - Check storage calculations
   - Analyze resource utilization
   - Review compatibility warnings

## Supported SBC Boards
- ROCK 5A
- ROCK 5B
- Raspberry Pi 4
- Orange Pi 5
- Khadas VIM4

## Calculator Features

### Bandwidth Calculation
The calculator considers:
- Resolution
- Frame rate
- Codec efficiency
- Quality settings
- Number of cameras

### Storage Estimation
Calculates storage requirements based on:
- Bandwidth requirements
- Recording duration
- Retention period
- Compression factors

### Resource Validation
Checks against:
- Network interface capacity
- RAM limitations
- CPU capabilities
- Hardware decoder limits

## Development

### Adding New SBC Boards
To add a new SBC board, update the `sbc-devices.json` file:

```json
{
  "boards": {
    "new-board-id": {
      "name": "Board Name",
      "cpu": "CPU Specifications",
      "ram": 8,
      "npu": 5,
      "lan": 1,
      "wifi": "Wi-Fi 6",
      "decoder": {
        "1080p": 4,
        "4k": 1
      },
      "price": 199,
      "power": 20,
      "max_cameras": {
        "1080p": 8,
        "4k": 1
      },
      "features": {
        "pcie": true,
        "usb3": true,
        "emmc": true,
        "nvme": true
      }
    }
  }
}
```


This expanded JSON includes:

1. Additional Boards:
- Raspberry Pi 5
- NVIDIA Jetson Orin Nano
- ODROID-N2+
- ASUS Tinker Edge R
- NanoPi R6S
- LicheePi 4A

2. Detailed Specifications:
- CPU configurations
- RAM capacity
- NPU capabilities
- Network interfaces
- Video decoder capabilities
- Power requirements
- Maximum camera support
- Available features

3. Additional Data:
- Codec efficiency ratios
- Quality factors
- Resolution scaling factors

Each board's specifications include:
- Detailed CPU information
- Memory capacity
- AI/NPU capabilities
- Networking options
- Video processing capabilities
- Power consumption
- Price information
- Maximum supported cameras
- Available features (PCIe, USB3, eMMC, NVMe)


### Customizing Calculations
Calculation parameters can be adjusted in `script.js`:
```javascript
const CODEC_EFFICIENCY = {
    'MJPEG': 10.0,
    'H264': 1.0,
    'H265': 0.7
};
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Camera bandwidth calculations based on industry standards
- SBC specifications sourced from official documentation
- Codec efficiency ratios based on real-world testing

## Support
For support, please:
1. Check existing issues in the repository
2. Create a new issue with detailed information
3. Provide example calculations if relevant

## Future Improvements
- [ ] Add more SBC boards
- [ ] Include power consumption calculations
- [ ] Add export functionality for calculations
- [ ] Implement save/load configurations
- [ ] Add comparison charts
- [ ] Include thermal analysis
- [ ] Add AI processing estimation

## Screenshots

[JSON DATA](https://cameramind.github.io/calc/devices.json)
![image](https://github.com/user-attachments/assets/b1ffef90-faa8-4185-a8ea-fb76dcc787b8)


[SBC Comparison Chart](https://cameramind.github.io/calc/chart.html)
![image](https://github.com/user-attachments/assets/7cd2b08a-076c-4b30-9303-08206bfd24c1)


[IP Camera Resource Calculator](https://cameramind.github.io/calc/)
![image](https://github.com/user-attachments/assets/d460bd16-88e2-43cc-8860-ffa9259374c6)


## Version History
- 1.0.0: Initial release
  - Basic calculator functionality
  - Support for 5 SBC boards
  - Bandwidth and storage calculations

## Authors
Tom Sapletta - Initial work - [YourGitHub](https://github.com/tom-sapletta-com)

---

For more information or support, please open an issue in the repository.
