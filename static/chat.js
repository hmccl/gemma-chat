document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault();
  const messageInput = document.querySelector(
    'textarea[name="message"]'
  );
  const message = messageInput.value.trim();
  const chatContainer = document.querySelector(".messages");

  // Append the user's message to the chat container
  if (message) {
    const roleDiv = document.createElement("p");
    roleDiv.textContent = "Usuário";
    chatContainer.appendChild(roleDiv);

    const userMessageDiv = document.createElement("p");
    userMessageDiv.classList.add("box");
    userMessageDiv.textContent = message;
    chatContainer.appendChild(userMessageDiv);
  }

  // Clear the message input
  messageInput.value = "";

  // Send the user's message to the server using AJAX
  fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message: message }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const roleDiv = document.createElement("p");
        roleDiv.textContent = "Gemma";
        chatContainer.appendChild(roleDiv);

        // Prepare the model message container
        const assistantMessageDiv = document.createElement("p");
        assistantMessageDiv.classList.add("box", "info");
        chatContainer.appendChild(assistantMessageDiv);

        // Open a connection to receive streamed responses
        const eventSource = new EventSource("/stream");
        eventSource.onmessage = function (event) {
          const currentText = assistantMessageDiv.textContent;
          const newText = event.data.replace(/\\n/g, '\n').replace(/\\r/g, '\r');
    
          assistantMessageDiv.textContent += newText;
          chatContainer.scrollTop = chatContainer.scrollHeight;
        };
        eventSource.onerror = function () {
          eventSource.close();
        };
      }
    });
});
