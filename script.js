// Small word "database" for the word bank
const wordBank = [
    // Pronouns
    { word: "I", type: "pronoun" },
    { word: "You", type: "pronoun" },
    { word: "We", type: "pronoun" },
    { word: "They", type: "pronoun" },
    { word: "He", type: "pronoun" },
    { word: "She", type: "pronoun" },
    { word: "It", type: "pronoun" },

    // Verbs
    { word: "am", type: "verb" },
    { word: "are", type: "verb" },
    { word: "is", type: "verb" },
    { word: "was", type: "verb" },
    { word: "have", type: "verb" },
    { word: "do", type: "verb" },
    { word: "like", type: "verb" },
    { word: "need", type: "verb" },
    { word: "want", type: "verb" },
    { word: "know", type: "verb" },

    // Sarcasm/Emotion Words
    { word: "really", type: "emotion" },
    { word: "sure", type: "emotion" },
    { word: "amazing", type: "emotion" },
    { word: "nice", type: "emotion" },
    { word: "wow", type: "emotion" },
    { word: "definitely", type: "emotion" },
    { word: "maybe", type: "emotion" },
    { word: "obviously", type: "emotion" },
    { word: "brilliant", type: "emotion" },
    { word: "fantastic", type: "emotion" },
    { word: "perfect", type: "emotion" },
    { word: "thanks", type: "emotion" },
    { word: "great", type: "emotion" },

    // Connectors
    { word: "and", type: "connector" },
    { word: "but", type: "connector" },
    { word: "if", type: "connector" },
    { word: "so", type: "connector" },
    { word: "because", type: "connector" },

    // Useful Nouns
    { word: "job", type: "noun" },
    { word: "plan", type: "noun" },
    { word: "time", type: "noun" },
    { word: "day", type: "noun" },
    { word: "idea", type: "noun" },
    { word: "luck", type: "noun" },
    { word: "try", type: "noun" },
    { word: "genius", type: "noun" },
    { word: "effort", type: "noun" }
];

// QWERTY layout
const qwertyKeys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["Z", "X", "C", "V", "B", "N", "M"]
];

// Select where the keyboard will be inserted
const keyboardContainer = document.getElementById("keyboard");
const currentTypedWordDiv = document.getElementById("currentTypedWord");

//Track currently typed word
let currentTypedWord = "";
let builtSentence = [];

//Create keyboard buttons
qwertyKeys.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row"); // add class 

    row.forEach(letter => {
        const btn = document.createElement("button");
        btn.classList.add("key-btn");
        btn.textContent = letter;

        btn.addEventListener("click", () => {
            currentTypedWord += letter;
            updateCurrentTypedWord();
        });

        rowDiv.appendChild(btn);
    });
    keyboardContainer.appendChild(rowDiv);

});

// Update the display of current typed word
function updateCurrentTypedWord() {
    currentTypedWordDiv.textContent = currentTypedWord;
}

const backspaceBtn = document.getElementById("backspaceBtn");

backspaceBtn.addEventListener('click', () => {
    if (currentTypedWord.length > 0) {
      // Still typing a word → delete last letter
      currentTypedWord = currentTypedWord.slice(0, -1);
      updateCurrentTypedWord();
    } else if (builtSentence.length > 0) {
      // Finished typing → delete last added word
      builtSentence.pop();  // Remove last word
      updateCurrentSentenceDisplay();  // Refresh screen
    }
  });
  

const spaceBtn = document.getElementById("spaceBtn");

// add event listener 
spaceBtn.addEventListener("click", () => {
    if (currentTypedWord.trim() !== "") {
        addWordToSentence(currentTypedWord.trim());
        currentTypedWord = "";
        updateCurrentTypedWord();
    }

});

function addWordToSentence(word) {
    builtSentence.push(word);
    updateCurrentSentenceDisplay();
}


async function speakSentence(sentence) {
    try {
        const response = await fetch('/api/polly', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ text: sentence })
        });

        if (!response.ok) {
            throw new Error('Failed to generate audio');
        }

        const arrayBuffer = await response.arrayBuffer(); // Get raw audio bytes
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' }); // Wrap into a playable blob
        const url = URL.createObjectURL(blob); // Create temporary URL

        const audio = new Audio(url); // Create Audio element
        audio.play(); // Play it!
    } catch (error) {
        console.error('Error speaking sentence:', error);
    }
}

playBtn.addEventListener('click', () => {
    if (currentTypedWord.trim() !== "") {
        // User typed something but never submitted it → submit it now
        addWordToSentence(currentTypedWord.trim());
        currentTypedWord = "";
        updateCurrentTypedWord();
    }

    const sentence = builtSentence.join(' ').trim();

    if (sentence.length === 0) {
        console.error('Cannot play an empty sentence!');
        return; // Stop if nothing to speak
    }

    speakSentence(sentence);
});


function updateCurrentSentenceDisplay() {
    const sentenceWordsDiv = document.getElementById('sentenceWords');
  
    // Clear previous display
    sentenceWordsDiv.innerHTML = '';
  
    // Rebuild sentence from builtSentence array
    builtSentence.forEach(word => {
      const span = document.createElement('span');
      span.classList.add('sentence-word'); // Optional, if you want to style each word later
      span.innerText = word + ' ';
      sentenceWordsDiv.appendChild(span);
    });
  }
  
