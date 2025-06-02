// List of available effects and properties
const effectsConfig = {
    emphasize: {
        label: "Emphasize",
        default: false,
        buttonId: "emphasizeBtn",
        apply: text => `<emphasis level="strong">${text}</emphasis>`
    },
    slowDown: {
        label: "Slow Down",
        default: false,
        buttonId: "slowDownBtn",
        apply: text => `<prosody rate="x-slow">${text}</prosody>`
    },
    speedUp: {
        label: "Speed Up",
        default: false,
        buttonId: "speedUpBtn",
        apply: text => `<prosody rate="x-fast">${text}</prosody>`
    },
    lowPitch: {
        label: "Low Pitch",
        default: false,
        buttonId: "lowPitchBtn",
        apply: text => `<prosody pitch="x-low">${text}</prosody>`
    },
    highPitch: {
        label: "High Pitch",
        default: false,
        buttonId: "highPitchBtn",
        apply: text => `<prosody pitch="x-high">${text}</prosody>`
    }
};


// QWERTY layout
const qwertyKeys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "!", "."],
    ["Z", "X", "C", "V", "B", "N", "M", ",", "?"]
];

// Select where the keyboard will be inserted
const keyboardContainer = document.getElementById("keyboard");
const currentTypedWordDiv = document.getElementById("currentTypedWord");

//Track currently typed word
let currentTypedWord = "";
let builtSentence = [];
let currentPopupWordIndex = null;

const effectConflicts = {
    highPitch: ["lowPitch", "emphasize"],
    lowPitch: ["highPitch", "emphasize"],
    speedUp: ["slowDown"],
    slowdDown: ["speedUp"]
};

//Create keyboard buttons
qwertyKeys.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row"); // add class 

    row.forEach(letter => {
        const btn = document.createElement("button");
        btn.classList.add("key-btn");
        btn.textContent = letter;

        btn.addEventListener("click", () => {

            const punctuationChars = [".", "?", "!"];

            if (punctuationChars.includes(letter)) {
                const word = currentTypedWord;
                if (word) {
                    addWordToSentence(word, false);
                }
                addWordToSentence(letter, false);
                currentTypedWord = "";
            } else {

                currentTypedWord += letter;
            }

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

function addWordToSentence(text, pauseAfter = false) {

    const newWord = { text, type: "word" };

    for (const effect in effectsConfig) {
        newWord[effect] = effectsConfig[effect].default;
    }

    newWord.pauseAfter = pauseAfter;
    builtSentence.push(newWord);
    updateCurrentSentenceDisplay();

    console.log(builtSentence);
}

function showWordPopup(event, wordIndex) {
    const popup = document.getElementById('wordPopup');

    popup.classList.remove('hidden'); // Make popup visible

    const rect = event.target.getBoundingClientRect();
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.style.top = `${rect.bottom + window.scrollY + 6}px`;

    currentPopupWordIndex = wordIndex; // Save which word in builtSentence we are editing

    for (const effect in effectsConfig) {
        const buttonId = effectsConfig[effect].buttonId;
        const popupBtn = document.getElementById(buttonId);
        if (!popupBtn) continue;

        popupBtn.classList.remove('popup-effect-active');
        popupBtn.disabled = false;


        if (builtSentence[wordIndex][effect]) {
            popupBtn.classList.add('popup-effect-active');
        }

        const conflicts = effectConflicts[effect] || [];
        const shouldDisable = conflicts.some(conflict => builtSentence[wordIndex][conflict]);
        if (shouldDisable && !builtSentence[wordIndex][effect]) {
            popupBtn.disabled = true;
        }
    }
}

window.addEventListener('resize', () => {
    const popup = document.getElementById('wordPopup');
    if (!popup.classList.contains('hidden') && currentPopupWordIndex !== null) {
        const word = document.querySelectorAll('.sentence-word')[currentPopupWordIndex];
        if (word) {
            const rect = word.getBoundingClientRect();
            popup.style.left = `${rect.left + window.scrollX}px`;
            popup.style.top = `${rect.bottom + window.scrollY + 6}px`;
        }
    }
});


function hideWordPopup() {
    const popup = document.getElementById('wordPopup');
    popup.classList.add('hidden');
    currentPopupWordIndex = null; // Reset
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
        const trimmed = currentTypedWord.trim();
        const lastLetter = trimmed[trimmed.length - 1];
        console.log(trimmed);
        console.log("lastletter: " + lastLetter);

        if (lastLetter === ",") {
            word = trimmed.slice(0, -1);
            addWordToSentence(word, pauseAfter = true);
            updateCurrentSentenceDisplay();
            console.log(word);
        }

        else {

            let pauseAfter = false;
            let cleanText = trimmed;

            addWordToSentence(cleanText, pauseAfter);
        }

        currentTypedWord = "";
        updateCurrentTypedWord();
    }

});

playBtn.addEventListener('click', () => {
    if (currentTypedWord.trim() !== "") {
        // User typed something but never submitted it → submit it now
        addWordToSentence(currentTypedWord.trim());
        currentTypedWord = "";
        updateCurrentTypedWord();
    }

    const ssml = buildSSMLFromSentence();

    if (ssml.length === 0) {
        console.error('Cannot play an empty sentence!');
        return; // Stop if nothing to speak
    }

    speakSentence(ssml);
    console.log("Generated SSML:", ssml);
});



for (const effect in effectsConfig) {
    const button = document.getElementById(`${effect}Btn`);
    if (button) {
        button.addEventListener("click", () => {
            if (currentPopupWordIndex !== null) {
                const word = builtSentence[currentPopupWordIndex];
                word[effect] = !word[effect];
                updateCurrentSentenceDisplay();
                hideWordPopup();
            }
        })
    }
}


document.addEventListener('click', (event) => {
    const popup = document.getElementById('wordPopup');
    if (!popup.contains(event.target)) {
        hideWordPopup();
    }
});

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
        console.log("SSML being sent to Polly:", sentence);
    }
}


function buildSSMLFromSentence() {
    let ssml = '<speak>';

    const lastIndex = builtSentence.length - 1;
    const isQuestion = builtSentence[lastIndex]?.type === "questionMark";

    builtSentence.forEach((wordObj, index) => {
        if (wordObj.type === "questionMark") return;

        if (wordObj.type === "comma") {
            ssml += `<break time="500ms"/>`;
            return;
        }

        let wordText = wordObj.text;

        for (const key in effectsConfig) {
            if (wordObj[key] && typeof effectsConfig[key].apply === "function") {
                wordText = effectsConfig[key].apply(wordText);
            }
        }

        if (isQuestion && index === lastIndex - 1) {
            wordText = `<prosody pitch="high">${wordText}</prosody>`;
        }

        ssml += wordText + ' ';

        if (wordObj.pauseAfter) {
            ssml += `<break time="500ms"/>`;
        }
    });

    ssml += '</speak>';

    return ssml.trim();
}

function updateCurrentSentenceDisplay() {
    const sentenceWordsDiv = document.getElementById('sentenceWords');

    // Clear previous display
    sentenceWordsDiv.innerHTML = '';

    // Rebuild sentence from builtSentence array
    builtSentence.forEach((wordObj, index) => {
        // Create word buttons
        const wordButton = document.createElement('button');
        wordButton.classList.add('sentence-word');
        wordButton.innerText = wordObj.text;

        // Add effects visual cues
        for (const key in effectsConfig) {
            wordButton.classList.remove(`${key}-effect`);
            console.log('Checking key:', key, 'value:', wordObj[key]);

            if (wordObj[key]) {
                wordButton.classList.add(`${key}-effect`);
            }
        }

        // Add click event
        wordButton.addEventListener('click', (event) => {
            event.stopPropagation();
            showWordPopup(event, index);
            console.log(`Word clicked: ${wordObj.text}`)
        });


        // Create a small container for each word button
        const wordContainer = document.createElement('div');
        wordContainer.classList.add('word-container');
        wordContainer.appendChild(wordButton);

        if (wordObj.pauseAfter) {
            const commabutton = document.createElement("button");
            commabutton.classList.add('sentence-word');
            commabutton.innerText = ",";
            commabutton.disabled = true;
            wordContainer.appendChild(commabutton);

        }

        sentenceWordsDiv.appendChild(wordContainer);

    });

}



