function formatPrice(price) {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(price);
}

function createPropertyCard(property) {
  return `
                <div class="property-card">
                    <div class="property-image" style="background-image: url('${
                      property.metaData?.coverImage ||
                      "/api/placeholder/400/200"
                    }')">
                        ${
                          !property.metaData?.coverImage
                            ? "<span>אין תמונה</span>"
                            : ""
                        }
                    </div>
                    <div class="property-content">
                        <div class="price">${formatPrice(property.price)}</div>
                        <div class="address">
                            ${property.address.street.text} ${
    property.address.house.number
  }, 
                            ${property.address.neighborhood?.text}, 
                            ${property.address.city.text}
                        </div>
                        <div class="details">
                            <div class="detail-item">
                                <div class="detail-label">חדרים</div>
                                <div class="detail-value">${
                                  property.additionalDetails.roomsCount
                                }</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">מ"ר</div>
                                <div class="detail-value">${
                                  property.additionalDetails.squareMeter
                                }</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">קומה</div>
                                <div class="detail-value">${
                                  property.address.house.floor
                                }</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
}

function renderProperties(properties) {
  const container = document.getElementById("properties-container");
  if (!properties.length) {
    container.innerHTML = '<div class="no-properties">לא נמצאו נכסים</div>';
    return;
  }

  container.innerHTML = properties
    .map((property) => createPropertyCard(property))
    .join("");
}

document.querySelector(".search-bar").addEventListener("input", (e) => {
  const searchTerm = e.target.value.toLowerCase();
  const filteredProperties = properties.filter((property) => {
    const searchString =
      `${property.address.city.text} ${property.address.neighborhood?.text} ${property.address.street.text}`.toLowerCase();
    return searchString.includes(searchTerm);
  });
  renderProperties(filteredProperties);
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  chrome.tabs.sendMessage(
    tabs[0].id,
    { message: "get_next_data" },
    (response) => {
      const { feed, cityName } = response.data;

      renderProperties(
        feed.filter((property) => property.address.city.text === cityName)
      );

      // Now call get_links after get_next_data has completed
      chrome.tabs.sendMessage(
        tabs[0].id,
        { message: "get_links" },
        (response) => {
          if (response && response.data) {
            const links = response.data;

            const propertyCards = document.querySelectorAll(".property-card");
            propertyCards.forEach((card, i) => {
              const link = links[feed[i].token];
              card.addEventListener("click", () => {
                chrome.tabs.create({ url: link });
              });
            });
          } else {
            console.log("No data received");
          }
        }
      );
    }
  );
});
