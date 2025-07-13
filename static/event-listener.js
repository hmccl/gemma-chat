document.getElementById("file-upload").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const formData = new FormData();
  formData.append("file", file);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        // Update and show the banner
        const banner = document.getElementById("upload-banner");
        banner.textContent = data.message;
        banner.classList.add("box", "ok");

        // Hide the banner after 3 seconds
        setTimeout(() => {
          banner.style.display = "none";
        }, 3000);
      } else {
        console.error("Upload failed:", data.message);
        // Update and show the banner
        const banner = document.getElementById("upload-banner");
        banner.textContent = data.message;
        banner.classList.add("box", "warn");

        // Hide the banner after 3 seconds
        setTimeout(() => {
          banner.style.display = "none";
        }, 3500);
      }
    })
    .catch((error) => {
      console.error("Error uploading file:", error);
    });
});
