# Book Chapter Tracker

A Chrome extension to track the books you are reading along with their chapters.

## Features

- Toggle input visibility using a checkbox.
- Add books with chapter numbers by pasting the link.
- View a list of all saved books and their chapters.
- Increment or decrement the chapter number using a number input field.
- Delete a book from the list using a delete button.
- Search for books by name.

## Installation

1. Clone the repository or download the zip file.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable Developer Mode by toggling the switch in the top right corner.
4. Click on "Load unpacked" and select the directory containing the extension files.

## Usage

1. Click on the extension icon in the Chrome toolbar to open the popup.
2. Use the toggle switch to show or hide the input fields.
3. Paste the book link into the input field and click "Save".
4. The book name and chapter number will be extracted and saved.
5. Use the search bar to filter books by name.
6. Adjust the chapter number using the increment/decrement arrows in the number input field.
7. Click the red strip on the right side of a book item to delete it from the list.

## File Structure

- `manifest.json`: Contains the metadata for the Chrome extension.
- `popup.html`: The HTML structure for the popup interface.
- `popup.js`: The JavaScript logic for handling the popup functionality.
- `styles.css`: Custom styles for the popup interface.