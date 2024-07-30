const allowedHostnames = ['asuracomic.net']; // Add more allowed hostnames as needed

function parseLink(link) {
  try {
    const url = new URL(link);
    if (allowedHostnames.includes(url.hostname)) {
      const parts = url.pathname.split('/');
      const chapterNumber = parseInt(parts.pop(), 10);
      if (!isNaN(chapterNumber)) {
        let bookNameParts = parts.slice(2, -1).join(' ').split('-');
        bookNameParts.pop();
        const bookName = bookNameParts.join(' ');
        const capitalizedBookName = bookName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

        return [capitalizedBookName, chapterNumber];
      } else {
        console.log('No valid chapter number found in URL.');
        return [null, null];
      }
    } else {
      console.log('URL does not match allowed hostnames, skipping parse.');
      return [null, null];
    }
  } catch (error) {
    console.error('Error parsing link:', error);
    return [null, null];
  }
}
