chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (tabs[0].url.startsWith("https://bard.google.com/")) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"],
    });
  } else {
    document.getElementById("error").style.display = "block";
    disableShareButton();
  }
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "some-action") {
    var conversationContainer = document.getElementById("conversation-container");
    var [humanArr, aiArr] = message.text;

    for (var i = 0; i < humanArr.length; i++) {
      var humanMessage = createMessageElement("human", humanArr[i]);
      var aiMessage = createMessageElement("ai", aiArr[i]);
      conversationContainer.appendChild(humanMessage);
      conversationContainer.appendChild(aiMessage);
    }

    // Check if the sizes of human and AI lists are equal and non-empty
    if (humanArr.length === aiArr.length && humanArr.length > 0) {
      enableShareButton();
    } else {
      disableShareButton();
    }
  }
});

function createMessageElement(className, htmlCode) {
  var messageContainer = document.createElement("div");
  messageContainer.className = "message-container";

  var tag = document.createElement("span");
  tag.textContent = className === "human" ? "Human: " : "AI: ";
  tag.style.fontWeight = "bold";

  var message = document.createElement("div");
  message.className = className;
  message.innerHTML = htmlCode;

  messageContainer.appendChild(tag);
  messageContainer.appendChild(message);

  return messageContainer;
}

function enableShareButton() {
  var shareButton = document.getElementById('share-button');
  shareButton.disabled = false;
}

function disableShareButton() {
  var shareButton = document.getElementById('share-button');
  shareButton.disabled = true;
}

document.addEventListener('DOMContentLoaded', function() {
  var shareButton = document.getElementById('share-button');
  shareButton.addEventListener('click', shareConversation);
});





function shareConversation() {
  
  // Disable the share button and show loading state
  var shareButton = document.getElementById('share-button');
  shareButton.disabled = true;
  shareButton.textContent = 'Loading...';

  var conversationContainer = document.getElementById("conversation-container");
  var humanMessages = conversationContainer.getElementsByClassName("human");
  var aiMessages = conversationContainer.getElementsByClassName("ai");

  var humanArr = Array.from(humanMessages).map(function(element) {
    return element.innerHTML;
  });

  var aiArr = Array.from(aiMessages).map(function(element) {
    return element.innerHTML;
  });

  var data = {
    human: humanArr,
    ai: aiArr
  };

  fetch('http://127.0.0.1:5000/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'API-Key': '12345'
    },
    body: JSON.stringify(data)
  })
    .then(response => response.json())
    .then(responseData => {
      // Handle the response from the server
      console.log(responseData);

      // Create the shared conversation link
      var link = document.createElement('a');
      link.href = "http://127.0.0.1:5000/api/" + responseData.id;
      link.target = '_blank';
      link.textContent = 'Shared conversation link';
      link.style.display = 'block';
      link.style.marginTop = '10px';

      // Replace the share button with the link
      shareButton.parentNode.replaceChild(link, shareButton);

      // Copy the link to the clipboard
      navigator.clipboard.writeText(link.href)
        .then(() => {
          // Show a notification that the link has been copied
          alert('The shared conversation link has been copied to the clipboard.');
        })
        .catch(error => {
          console.error('Error:', error);
        });
    })
    .catch(error => {
      // Handle any errors that occurred during the request
      console.error('Error:', error);

      // Re-enable the share button and display an error message
      shareButton.disabled = false;
      shareButton.textContent = 'Share Conversation';
      alert('An error occurred while sharing the conversation. Please try again.');
    });
}


