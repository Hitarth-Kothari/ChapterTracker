# Book Chapter Tracker

A Chrome extension to track the books you are reading along with their chapters.

## Table of Contents

1. [Features](#features)
2. [Installation](#installation)
3. [Usage](#usage)
4. [Supported Sites](#supported-sites)
5. [File Structure](#file-structure)
6. [Contributing](#contributing)
7. [Disclaimer](#disclaimer)
8. [Data Storage](#data-storage)

## Features

- Toggle input visibility using a checkbox.
- Toggle notifications on or off using a checkbox.
- Add books with chapter numbers by pasting the link.
- View a list of all saved books and their chapters.
- Increment or decrement the chapter number using a number input field.
- Delete a book from the list using a delete button.
- Search for books by name.
- Notifications to update or add books based on the current chapter.

## Installation

1. Clone the repository or download the zip file.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable Developer Mode by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Use the toggle switch to show or hide the input fields.
3. Use the toggle switch to enable or disable notifications.
4. Paste the book link into the input field and click "Save".
5. The book name and chapter number will be extracted and saved.
6. Use the search bar to filter books by name.
7. Adjust the chapter number using the increment/decrement arrows in the number input field.
8. Click the red strip on the right side of a book item to delete it from the list.
9. The extension will check if the user visits a link from a supported site and notify them if they want to add or update the book's chapter.

## Supported Sites

- Currently only supports `asuracomic.net`.

## File Structure

- `manifest.json`: Contains the metadata for the Chrome extension.
- `background.js`: Handles the background tasks such as monitoring tabs and sending notifications.
- `popup.html`: The HTML structure for the popup interface.
- `popup.js`: The JavaScript logic for handling the popup functionality.
- `utils.js`: Contains shared functions and constants used by other scripts.
- `styles.css`: Custom styles for the popup interface.

## Contributing

We welcome contributions to improve this project! To contribute, please follow these steps:

1. **Fork the Repository**: Click the "Fork" button on the top right of the repository page to create a copy of the repository on your own GitHub account.

2. **Clone Your Fork**: Clone your forked repository to your local machine.
    ```bash
    git clone https://github.com/Hitarth-Kothari/ChapterTracker
    ```

3. **Create a Branch**: Create a new branch for your feature or bug fix.
    ```bash
    git checkout -b feature-or-bugfix-name
    ```

4. **Write Code**: Make your changes or add your new features.

5. **Commit Changes**: Commit your changes with a descriptive commit message.
    ```bash
    git add .
    git commit -m "Description of the feature or fix"
    ```

6. **Push to Your Fork**: Push your changes to your forked repository.
    ```bash
    git push origin feature-or-bugfix-name
    ```

7. **Create a Pull Request**: Go to the original repository and create a pull request from your forked repository's branch. Provide a clear description of what you have done.

8. **Wait for Approval**: Wait for the project maintainers to review your pull request. They may ask for changes before it can be merged.

Thank you for your contributions! 

## Disclaimer

This extension is open-sourced, and the code in this repository is the same as the code published in the Chrome Web Store. You can verify this by comparing the source code here with the unpacked extension files.

To verify that the code in this repository matches the one in the Chrome Web Store:

1. Clone this repository:
    ```bash
    git clone https://github.com/Hitarth-Kothari/ChapterTracker
    ```

2. Download the extension from the Chrome Web Store and unpack it:
    - Go to `chrome://extensions/`
    - Enable "Developer mode"
    - Click "Pack extension..." and select the downloaded extension

3. Compare the files from the repository and the unpacked extension.

If you find any discrepancies, please report them as an issue in this repository.

We are committed to transparency. The code you see in this repository is exactly what is published in the Chrome Web Store. Our build process ensures that no changes are made between the code checked into this repository and the code uploaded to the store. If you have any questions or concerns, feel free to open an issue or contact us directly.

## Data Storage

The data tracked by this extension is stored locally on your device. This includes the book names and chapter numbers you have saved. While this ensures quick access and offline functionality, it also means that the data is at risk of being deleted if you clear your browser data or uninstall the extension.