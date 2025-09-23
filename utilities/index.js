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
  // fallback values in case DB fields are null
  const make = item.inv_make || "Unknown Make"
  const model = item.inv_model || "Unknown Model"
  const desc = item.inv_description || "No description available."
  const img = item.inv_image || "/images/placeholder.png"

  return `
    <section class="vehicle-detail">
      <div class="vehicle-detail__image">
        <img src="${img}" alt="Image of ${make} ${model}">
      </div>
      <div class="vehicle-detail__info">
        <h1 class="vehicle-detail__title">${make} ${model}</h1>
        <ul class="vehicle-detail__meta">
          <li><strong>Make:</strong> ${make}</li>
          <li><strong>Model:</strong> ${model}</li>
        </ul>
        <p>${desc}</p>
      </div>
    </section>
  `
}

module.exports = Util
