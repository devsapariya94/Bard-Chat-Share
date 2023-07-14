var humanarr = [];
var human = document.querySelectorAll("h2.query-text");
human.forEach(function (h2Element) {
  humanarr.push(h2Element.textContent.trim());
});

var aiarr = [];
var ai = document.querySelectorAll("div.response-content message-content div.markdown");
ai.forEach(function (responseContent) {
  aiarr.push(responseContent.innerHTML);
});

var combinedarr = [humanarr, aiarr];

chrome.runtime.sendMessage({ action: "some-action", text: combinedarr });
