const invModel = require("../models/inventory-model")
const Util = {}

/* Build the navigation menu */
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

/* build the detail view for single vehicle */
Util.buildVehicleDetail = function (v) {
  // format price as USD and mileage with commas
  const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
  const num = new Intl.NumberFormat("en-US")
  const price = usd.format(Number(v.inv_price || 0))
  const miles = num.format(Number(v.inv_miles || 0))

  // return full HTML for the vehicle detail page
  return `
    <section class="vehicle-detail">
      <figure class="vehicle-detail__image">
        <img src="${v.inv_image}" alt="${v.inv_year} ${v.inv_make} ${v.inv_model}">
      </figure>

      <article class="vehicle-detail__content">
        <h1>${v.inv_year} ${v.inv_make} ${v.inv_model}</h1>
        <ul>
          <li><strong>Price:</strong> ${price}</li>
          <li><strong>Mileage:</strong> ${miles} miles</li>
          <li><strong>Color:</strong> ${v.inv_color}</li>
        </ul>
        <p>${v.inv_description}</p>
      </article>
    </section>
  `
}

module.exports = Util
