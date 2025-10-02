// I disable the Update button until any form field changes.
const form = document.querySelector("#updateForm")
if (form) {
  form.addEventListener("change", function () {
    const updateBtn = form.querySelector("button, input[type='submit']")
    if (updateBtn) {
      updateBtn.removeAttribute("disabled")
    }
  })
}
