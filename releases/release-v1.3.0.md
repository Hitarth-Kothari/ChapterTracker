# Release v1.3.0

## New Features
- **Notification Optimization**: Implemented logic to prevent duplicate notifications by checking the last notification's details before creating a new one.
- **Manhwa Clan Support**: Added support for parsing and storing links from the `manhwaclan.com` domain, enabling users to track book links and chapters from this site seamlessly.

## Bug Fixes
- **Duplicate Notifications**: Fixed an issue where notifications were being created repeatedly for the same book and chapter.
- **Notification Data Clearing**: Resolved issues where stale notification data wasn't cleared when notifications were toggled on.

## Known Issues
- None

## Technical Improvements
- **Error Handling**: Enhanced error handling for async operations in `storageHandler.js` to ensure stability and provide better debugging capabilities.
- **Logging Enhancements**: Improved logging for sync operations to facilitate easier troubleshooting and monitoring.
- **Migration Support**: Ensured migration support for updating the extension is robust and user-friendly.
- **Code Optimization**: Refined the logic for checking and creating notifications to improve performance and reliability.
