# Release v1.1.0

## New Features
- Save link to book for easy access to book.
- When user clicks on the book item, it should redirect user to the books home link last visited.
- Automatically update the chapter number without notification requirements when the user visits a book already stored and the chapter number is greater than the previously stored chapter by at most 3.
- Automatically update the main link if the user visits a book that is stored in the database but has a different main link.

## Bug Fixes
- N/A

## Known Issues
- None

## Technical Improvements
- Added comprehensive error handling to async operations in `storageHandler.js` to ensure stability and better debugging capabilities.
- Improved logging for sync operations to facilitate easier troubleshooting and monitoring.
