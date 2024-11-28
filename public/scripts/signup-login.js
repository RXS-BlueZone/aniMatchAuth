// signup-login.js
document.addEventListener("DOMContentLoaded", () => {
  let result; // Declare result in the global scope

  // Reusable form submission function
  async function handleFormSubmit(event, form) {
    event.preventDefault(); // Prevent the default form submission

    // Get form data
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    console.log("Form data:", payload); // Debugging: Log form data

    // Send the data via AJAX (fetch API)
    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      result = await response.json(); // Assign result to the global variable
      console.log("Server response:", result); // Debugging: Log server response

      if (response.ok) {
        if (result.redirect) {
          window.location.href = result.redirect; // Redirect on success
        }
      } else {
        // Display specific error messages under the corresponding fields
        displayErrors(result.errors);
      }
    } catch (err) {
      console.error("Error during form submission:", err);
      alert("An unexpected error occurred. Please try again later.");
    }
  }

  // Attach event listener to the signup form
  const signupForm = document.getElementById("signupForm");
  signupForm.addEventListener("submit", (event) => handleFormSubmit(event, signupForm));

  // Function to display errors
  function displayErrors(errors) {
    // Clear previous error messages
    document.querySelectorAll(".error-message").forEach((el) => {
      el.textContent = "";
      el.style.display = "none";
    });

    errors.forEach((error) => {
      const errorElement = document.getElementById(`${error.field}Error`);
      if (errorElement) {
        errorElement.textContent = error.error;
        errorElement.style.display = "inline";
      }
    });
  }

  const animeImage = document.getElementById("anime-img");
  const imageSources = ["styles/assets/k1.png", "styles/assets/k2.png"];
  let currentImageIndex = 0;

  animeImage.addEventListener("click", () => {
    currentImageIndex = (currentImageIndex + 1) % imageSources.length;
    animeImage.src = imageSources[currentImageIndex];
  });
});
