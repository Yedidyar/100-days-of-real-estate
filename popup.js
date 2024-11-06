document.getElementById("fetchData").addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { message: "get_next_data" },
      (response) => {
        const data = response
          ? JSON.stringify(response.data, null, 2)
          : "No data found";
        document.getElementById("data").textContent = data;
      }
    );
  });
});
