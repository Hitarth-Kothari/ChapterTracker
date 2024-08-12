# Release v1.5.0

## New Features
- **Flame Comics Support**: Added parsing support for URLs from `flamecomics.me`, allowing extraction of book names and chapter numbers.

## Bug Fixes
- **Robust Parsing**: Improved handling of URL parsing errors by implementing try-catch blocks to prevent crashes and guide users to report unexpected URL structures.
- **Reaper Scans Structure Handling**: Corrected a bug where the `reaperscans.com` URLs caused errors due to unexpected structure. Now, errors are caught and a message prompts the user to report issues on GitHub.

## Known Issues
- None

## Technical Improvements
- **Enhanced Parsing Logic**: Refactored parsing functions into separate handlers for each supported site, improving code clarity and maintainability.
- **General Error Handling**: Unified error handling for unexpected URL formats across all supported sites, ensuring graceful exits and user notifications.

## Miscellaneous
- **Documentation Update**: Added comprehensive docstrings to all functions, detailing their purpose, parameters, and return values for better code comprehension and maintenance.

## Tests
- **Test Suite Addition**: Implemented a new test file `parserTest.js` to validate URL parsing functionality for various sites, ensuring correctness and robustness of the parsing logic.
