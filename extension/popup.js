document.getElementById('detectBtn').addEventListener('click', () => {
  console.log('Detect Now button clicked');

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]; 
    if (tab) {
      // Check if the URL starts with "chrome://"
      if (tab.url.startsWith("chrome://")) {
        alert("This extension cannot be used on Chrome internal pages.");
        return; // Prevent execution on chrome:// URLs
      }

      console.log('Active tab found:', tab);

      // Inject both detectHateSpeech and highlight into the page
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: detectAndHighlight
      });
    } else {
      console.error('No active tab found.');
    }
  });
});

function detectAndHighlight() {
  function highlight(hatefulSections) {
    const elements = document.querySelectorAll('p, h1, h2, h3, div'); // Adjust selectors as needed
    console.log(hatefulSections); // Log the hateful sections array
    // Loop through each hateful section
    hatefulSections.forEach(hatefulText => {
      elements.forEach(element => {
        // Check if the element contains the hateful text
        if (element.innerText.includes(hatefulText)) {
          //element.style.backgroundColor = 'red'; // Highlight the hateful section
          element.style.color = 'red'; // Optional: change text color for better contrast
        }
      });
    });

    alert(`${hatefulSections.length} hateful sections detected!`);
  }

  function detectHateSpeech() {
    const elements = document.querySelectorAll('p, h1, h2, h3, div');
    const texts = Array.from(elements).map(element => element.innerText);
    
    console.log('Detected text content:', texts);

    fetch('http://localhost:3000/predict', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tweets: texts })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      console.log('Response from server:', data);
      highlight(data.hatefulSections); 
    })
    .catch(() => console.log("An error occurred"));
  }

  detectHateSpeech(); 
}