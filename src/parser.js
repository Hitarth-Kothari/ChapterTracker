const allowedHostnames = ['asuracomic.net', 'reaperscans.com', 'manhwaclan.com', 'flamecomics.me', 'manhuaus.org'];

/**
 * Parses a given URL and extracts the book name, chapter number, and main link.
 * 
 * @param {string} link - The URL to be parsed.
 * @returns {Array} An array containing the book name, chapter number, and main link.
 */
function parseLink(link) {
    try {
        const url = new URL(link);
        if (!allowedHostnames.includes(url.hostname)) {
            console.log('URL does not match allowed hostnames, skipping parse.');
            return [null, null, null];
        }

        const parts = url.pathname.split('/');

        switch(url.hostname) {
            case 'asuracomic.net':
                return parseAsuraComic(parts, url);
            case 'reaperscans.com':
                return parseReaperScans(parts, url);
            case 'manhwaclan.com':
                return parseManhwaClan(parts, url);
            case 'manhuaus.org':
                return parseManhwaClan(parts, url);
            case 'flamecomics.me':
                return parseFlameComics(parts, url);
            default:
                console.log('Hostname handling not defined for:', url.hostname);
                return [null, null, null];
        }
    } catch (error) {
        console.error('Error parsing link:', error);
        return [null, null, null];
    }
}

/**
 * Parses URLs from asuracomic.net to extract the book name, chapter number, and main link.
 * 
 * @param {Array} parts - The path segments of the URL.
 * @param {URL} url - The URL object.
 * @returns {Array} An array containing the book name, chapter number, and main link.
 */
function parseAsuraComic(parts, url) {
    try {
        const chapterPart = parts.pop(); // Remove and capture the chapter part
        const chapterNumber = parseInt(chapterPart, 10); // Convert it to a number
        const mainLink = `${url.origin}/series/${parts[2]}`; // Construct the main link
        
        if (!isNaN(chapterNumber)) {
            let bookNameParts = parts.slice(2, -1).join(' ').split('-');
            bookNameParts = bookNameParts.filter(part => !(/[a-zA-Z]/.test(part) && /\d/.test(part)));
            const bookName = bookNameParts.join(' ');
            const capitalizedBookName = bookName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
            return [capitalizedBookName, chapterNumber, mainLink];
        } else {
            console.log('No valid chapter number found in URL.');
            return [null, null, null];
        }
    } catch (error) {
        console.log('Unexpected URL structure. Please report this issue on GitHub for review.');
        return [null, null, null];
    }
}

/**
 * Parses URLs from reaperscans.com to extract the book name, chapter number, and main link.
 * 
 * @param {Array} parts - The path segments of the URL.
 * @param {URL} url - The URL object.
 * @returns {Array} An array containing the book name, chapter number, and main link.
 */
function parseReaperScans(parts, url) {
    try {
        const chapterPart = parts.pop();
        const chapterNumber = parseInt(chapterPart.replace('chapter-', ''), 10);
        if (isNaN(chapterNumber)) {
            console.log('No valid chapter number found in URL.');
            return [null, null, null];
        }
        const bookName = parts[2].replace(/-/g, ' ');
        const capitalizedBookName = capitalizeWords(bookName);
        const mainLink = `${url.origin}/series/${parts[2]}`;
        return [capitalizedBookName, chapterNumber, mainLink];
    } catch (error) {
        console.log('Unexpected URL structure. Please report this issue on GitHub for review.');
        return [null, null, null];
    }
}

/**
 * Parses URLs from manhwaclan.com to extract the book name, chapter number, and main link.
 * 
 * @param {Array} parts - The path segments of the URL.
 * @param {URL} url - The URL object.
 * @returns {Array} An array containing the book name, chapter number, and main link.
 */
function parseManhwaClan(parts, url) {
    try {
        parts.pop()
        const chapterPart = parts.pop();
        const chapterNumber = parseInt(chapterPart.replace('chapter-', ''), 10);
        if (isNaN(chapterNumber)) {
            console.log('No valid chapter number found in URL.');
            return [null, null, null];
        }
        const bookName = parts[2].replace(/-/g, ' ');
        const capitalizedBookName = capitalizeWords(bookName);
        const mainLink = `${url.origin}/manga/${parts[2]}/`;
        return [capitalizedBookName, chapterNumber, mainLink];
    } catch (error) {
        console.log('Unexpected URL structure. Please report this issue on GitHub for review.');
        return [null, null, null];
    }
}

/**
 * Parses URLs from flamecomics.me to extract the book name, chapter number, and main link.
 * 
 * @param {Array} parts - The path segments of the URL.
 * @param {URL} url - The URL object.
 * @returns {Array} An array containing the book name, chapter number, and main link.
 */
function parseFlameComics(parts, url) {
    try {
        parts = parts.filter(part => part); // Remove any empty segments from parts

        const lastPart = parts[parts.length - 1];
        const match = lastPart.match(/^(.*)-chapter-(\d+)$/);
        if (!match) {
            console.log('No valid chapter number found in URL.');
            return [null, null, null];
        }
        const bookName = match[1].replace(/-/g, ' ');
        const chapterNumber = parseInt(match[2], 10);
        if (isNaN(chapterNumber)) {
            console.log('No valid chapter number found in URL.');
            return [null, null, null];
        }
        const formattedBookName = capitalizeWords(bookName);
        const mainLink = `${url.origin}/${match[1]}/`;

        return [formattedBookName, chapterNumber, mainLink];
    } catch (error) {
        console.log('Unexpected URL structure. Please report this issue on GitHub for review.');
        return [null, null, null];
    }
}

/**
 * Capitalizes the first letter of each word in a string.
 * 
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalizeWords(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Enable when testing
// module.exports = { parseLink };
