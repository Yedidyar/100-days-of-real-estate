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

document.getElementById("city-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const state = {
    properties: null,
    links: null,
  };

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { message: "get_next_data" },
      (response) => {
        const { feed } = response.data;

        state.properties = feed;

        chrome.tabs.sendMessage(
          tabs[0].id,
          { message: "get_links" },
          (response) => {
            if (response && response.data) {
              state.links = response.data;

              const cityName = document.getElementById("city-input").value;

              renderProperties(
                state.properties.filter(
                  (property) => property.address.city.text === cityName
                )
              );

              const propertyCards = document.querySelectorAll(".property-card");
              propertyCards.forEach((card, i) => {
                const link = state.links[feed[i].token];
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
});
