let textContent = document.body.innerText;

fetch('http://localhost:3000/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tweet: textContent })
})
.then(response => response.json())
.then(data => {
    if (data.sentiment === 'Offensive Language') {
        highlightHatefulContent(data.hate_speech);
    }
})

.catch(error => console.error('Error:', error));
function highlightHatefulContent(hatefulText) {
    let bodyHTML = document.body.innerHTML;
    let highlightedHTML = bodyHTML.replace(new RegExp(hatefulText, 'gi'), match => {
        return `<span style="background-color: red;">${match}</span>`;
    });
    document.body.innerHTML = highlightedHTML;
}

