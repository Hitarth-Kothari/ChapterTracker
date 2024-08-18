// Import the parseLink function from the parser.js module
const { parseLink } = require('./parser.js');

// Define a list of test cases
const testCases = [
    {
        description: 'Test for AsuraComic.net valid URL',
        url: 'https://asuracomic.net/series/title-name-8a9wdfyg7a38/chapter/5',
        expected: ['Title Name', 5, 'https://asuracomic.net/series/title-name-8a9wdfyg7a38']
    },
    {
        description: 'Test for ReaperScans.com valid URL',
        url: 'https://reaperscans.com/series/title-name/chapter-5',
        expected: ['Title Name', 5, 'https://reaperscans.com/series/title-name']
    },
    {
        description: 'Test for ManhwaClan.com valid URL',
        url: 'https://manhwaclan.com/manga/title-name/chapter-5/',
        expected: ['Title Name', 5, 'https://manhwaclan.com/manga/title-name/']
    },
    {
        description: 'Test for FlameComics.me valid URL',
        url: 'https://flamecomics.me/title-name-chapter-5/',
        expected: ['Title Name', 5, 'https://flamecomics.me/title-name/']
    },
    {
        description: 'Test for invalid hostname',
        url: 'https://unknownsite.com/manga/title-name/chapter-20',
        expected: [null, null, null]
    },
    {
        description: 'Test for invalid URL format',
        url: 'https://reaperscans.com/title-name/chapter-10',
        expected: [null, null, null]
    }
];

// Function to run all test cases
function runTests() {
    testCases.forEach(test => {
        const { description, url, expected } = test;
        const result = parseLink(url);
        console.log(description);
        console.log('URL:', url);
        console.log('Expected:', expected);
        console.log('Received:', result);
        console.log('Test Passed:', JSON.stringify(result) === JSON.stringify(expected));
        console.log('-----------------------------------');
    });
}

// Run the test cases
runTests();
