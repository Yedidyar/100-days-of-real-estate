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
    const fullTitleText =
      nextData.props.pageProps.dehydratedState.queries[0].state.data[0]
        .full_title_text;

    sendResponse({
      data: {
        feed: nextData.props.pageProps.feed.private,
        cityName: fullTitleText,
      },
    });
  }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === "get_links") {
    const links = document.querySelectorAll('[data-testid="item-basic"] a');

    const linkMap = {};
    links.forEach((link, i) => {
      const key = links[i].href
        .split("https://")[1]
        .split("/")[3]
        .split("?")[0];
      linkMap[key] = link.href;
      console.log(`Link map key: ${key}, value: ${link.href}`);
    });
    sendResponse({ data: linkMap });
  }
});
