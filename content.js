// content.js
function extractNextData() {
  const scriptTag = document.getElementById("__NEXT_DATA__");
  if (scriptTag) {
    const nextData = JSON.parse(scriptTag.innerText);
    return nextData;
  }
  return null;
}

// Send the data to the popup or background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "get_next_data") {
    const nextData = extractNextData();

    sendResponse({ data: nextData.props.pageProps.feed.private });
  }
});
