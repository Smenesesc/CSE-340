const invModel = require("../models/inventory-model")
const Util = {}

/* Build the navigation bar */
Util.getNav = async function () {
  const data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* Build the vehicle detail HTML */
Util.buildVehicleDetail = function (item) {
  // fields your table has
  const make  = item.inv_make  || "Unknown Make"
  const model = item.inv_model || "Unknown Model"
  const desc  = item.inv_description || "No description available."
  const img   = item.inv_image || "/images/vehicles/no-image.png"

  // optional fields (shown only if they exist in DB later)
  const year  = item.inv_year  ?? null
  const color = item.inv_color ?? null

  const priceStr = (typeof item.inv_price === "number")
    ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(item.inv_price)
    : null

  const milesStr = (typeof item.inv_miles === "number")
    ? new Intl.NumberFormat("en-US").format(item.inv_miles)
    : null

  const title = `${year ? year + " " : ""}${make} ${model}`

  return `
    <article class="vehicle-detail" aria-labelledby="vehicle-title">
      <div class="vehicle-detail__image">
        <img src="${img}" alt="Image of ${title}">
      </div>

      <div class="vehicle-detail__info">
        <h1 id="vehicle-title" class="vehicle-detail__title">${title}</h1>

        <ul class="vehicle-detail__meta">
          <li><strong>Make:</strong> ${make}</li>
          <li><strong>Model:</strong> ${model}</li>
          ${year   ? `<li><strong>Year:</strong> ${year}</li>`     : ""}
          ${color  ? `<li><strong>Color:</strong> ${color}</li>`   : ""}
          ${priceStr ? `<li><strong>Price:</strong> ${priceStr}</li>` : ""}
          ${milesStr ? `<li><strong>Miles:</strong> ${milesStr}</li>` : ""}
        </ul>

        <p>${desc}</p>
      </div>
    </article>
  `
}

module.exports = Util