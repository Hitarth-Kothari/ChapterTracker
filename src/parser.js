const allowedHostnames = ['asuracomic.net']; // Add more allowed hostnames as needed

function parseLink(link) {
  try {
    const url = new URL(link);
    if (allowedHostnames.includes(url.hostname)) {
      if (url.hostname === 'asuracomic.net') {
        const parts = url.pathname.split('/');
        const chapterNumber = parseInt(parts.pop(), 10);
        const mainLink = `${url.origin}/series/${parts[2]}`;
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
      } 
      // Add more conditions for other hostnames here
    } else {
      console.log('URL does not match allowed hostnames, skipping parse.');
      return [null, null, null];
    }
  } catch (error) {
    console.error('Error parsing link:', error);
    return [null, null, null];
  }
}
