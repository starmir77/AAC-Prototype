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
        prosody: `rate="x-slow"`,
        apply: text => `<prosody rate="x-slow">${text}</prosody>`
    },
    speedUp: {
        label: "Speed Up",
        default: false,
        buttonId: "speedUpBtn",
        prosody: `rate="x-fast"`,
        apply: text => `<prosody rate="x-fast">${text}</prosody>`
    },
    lowPitch: {
        label: "Low Pitch",
        default: false,
        buttonId: "lowPitchBtn",
        prosody: `pitch="low"`,
        apply: text => `<prosody pitch="low">${text}</prosody>`
    },
    highPitch: {
        label: "High Pitch",
        default: false,
        buttonId: "highPitchBtn",
        prosody: `pitch="x-high"`,
        apply: text => `<prosody pitch="x-high">${text}</prosody>`
    },

    lowVolume: {
        label: "Low Volume",
        default: false,
        buttonId: "",
        prosody: `volume="x-soft"`,
        apply: text => `<prosody volume="x-soft">${text}</prosody>`
    },

    highVolume: {
        label: "High Volume",
        default: false,
        buttonId: "",
        prosody: `volume="x-loud"`,
        apply: text => `<prosody volume="x-loud">${text}</prosody>`
    },

};

let sentenceEmotions = {
    Relaxed: false,
    Excited: false,
    Sad: false,
    Angry: false,
}

const createdEmotions = {

    Relaxed: {
        effects: {
            highPitch: false,
            lowPitch: false,
            speedUp: false,
            slowDown: true,
            highVolume: false,
            lowVolume: true,
        },
        buttonId: "relaxedBtn"
    },

    Excited: {
        effects: {
            highPitch: true,
            lowPitch: false,
            speedUp: true,
            slowDown: false,
            highVolume: false,
            lowVolume: false
        },
        buttonId: "excitedBtn"
    },

    Sad: {
        effects: {
            highPitch: false,
            lowPitch: true,
            speedUp: false,
            slowDown: true,
            highVolume: false,
            lowVolume: true,
        },
        buttonId: "sadBtn"
    },

    Angry: {
        effects: {
            highPitch: false,
            lowPitch: true,
            speedUp: true,
            slowDown: false,
            highVolume: false,
            lowVolume: false
        },
        buttonId: "angryBtn"
    }
}


// QWERTY layout
const qwertyKeys = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "Delete"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L", "!", "."],
    ["Z", "X", "C", "V", "B", "N", "M", ",", "?"]
];

// Select where the keyboard will be inserted
const keyboardContainer = document.getElementById("keyboard");
const currentTypedWordDiv = document.getElementById("currentTypedWord");

//Track currently typed word
let currentTypedWord = "";
let builtSentence = []; // Array of objects
let currentPopupWordIndex = null;

const effectConflicts = {
    highPitch: ["lowPitch"],
    lowPitch: ["highPitch"],
    speedUp: ["slowDown"],
    slowDown: ["speedUp"]
};

//Create keyboard buttons
qwertyKeys.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.classList.add("keyboard-row"); // add class 

    row.forEach(letter => {
        const btn = document.createElement("button");

        btn.textContent = letter;

        if (letter === "Delete") {
            btn.classList.add("delete-key");
        } else {
            btn.classList.add("key-btn");
        }

        btn.addEventListener("click", () => {
            const punctuationChars = [".", "?", "!"];

            if (letter === "Delete") {
                if (currentTypedWord.length > 0) {
                    currentTypedWord = currentTypedWord.slice(0, -1);
                    updateCurrentTypedWord();
                } else if (builtSentence.length > 0) {
                    builtSentence.pop();
                    updateCurrentSentenceDisplay();
                }
                return;
            }

            if (punctuationChars.includes(letter)) {
                const word = currentTypedWord;
                if (word) { addWordToSentence(word, false); }
                addWordToSentence(letter, false);
                currentTypedWord = "";
            } else { currentTypedWord += letter; }

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

        popupBtn.disabled = false;
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

const clearAllBtn = document.getElementById("clearAllBtn");

clearAllBtn.addEventListener('click', () => {

    builtSentence = [];
    currentTypedWord = "";
    updateCurrentTypedWord();
    updateCurrentSentenceDisplay();

    for (const key in sentenceEmotions) {
        sentenceEmotions[key] = false;
    }

    document.querySelectorAll('.emotion-Btn').forEach(btn => {
        btn.classList.remove('is-active');

    })


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
    if (!button) continue;

    if (button) {
        button.addEventListener("click", () => {
            if (currentPopupWordIndex === null) return;

            {
                const word = builtSentence[currentPopupWordIndex];

                const isCurrentlyActive = word[effect];

                const conflicts = effectConflicts[effect] || [];
                conflicts.forEach(conflict => {
                    word[conflict] = false;
                });

                word[effect] = !isCurrentlyActive;

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

// Toggle Emotion Function - 

function toggleEmotion(selected) {

    const isCurrentlyActive = sentenceEmotions[selected];

    for (const emotion in sentenceEmotions) {
        sentenceEmotions[emotion] = false;
    }

    if (!isCurrentlyActive) {
        sentenceEmotions[selected] = true;
    }

    document.querySelectorAll('.emotion-Btn').forEach(btn => {
        btn.classList.remove('is-active')
    });

    if (!isCurrentlyActive) {
        const activeBtnId = createdEmotions[selected]?.buttonId;
        if (activeBtnId) {
            const activeBtn = document.getElementById(activeBtnId);
            if (activeBtn) {
                activeBtn.classList.add('is-active');
            }
        }
    }

    const allWordButtons = document.querySelectorAll('.sentence-word');

    allWordButtons.forEach(wordButton => {
        wordButton.classList.forEach(clss => {
            if (clss.startsWith("emotion-")) {
                wordButton.classList.remove(clss);
            }
        });

        if (!isCurrentlyActive) {
            const cssClass = `emotion-${selected.toLowerCase()}`;
            wordButton.classList.add(cssClass);
        }
    });



    console.log("Active Emotion: ", selected)
}


// Event listener for emotion buttons

const relaxedBtn = document.getElementById('relaxedBtn');
relaxedBtn.addEventListener('click', () => {
    toggleEmotion("Relaxed");
});

const angryBtn = document.getElementById('angryBtn');
angryBtn.addEventListener('click', () => {
    toggleEmotion("Angry");
});

const excitedBtn = document.getElementById('excitedBtn');
excitedBtn.addEventListener('click', () => {
    toggleEmotion("Excited");
});

const sadBtn = document.getElementById('sadBtn');
sadBtn.addEventListener('click', () => {
    toggleEmotion("Sad");
});

////////////* FUNCTIONS/////////////

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

        const marks = await getSpeechMarks(sentence);
        console.log("Speech Marks:", marks);

        const arrayBuffer = await response.arrayBuffer(); // Get raw audio bytes
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' }); // Wrap into a playable blob
        const url = URL.createObjectURL(blob); // Create temporary URL

        const audio = new Audio(url); // Create Audio element

        // Word Counters to avoid double animations of repeated words
        const wordCounters = {};

        // Animate each word
        marks.forEach((mark) => {
            setTimeout(() => {
                const normalizedMark = mark.value.trim().toUpperCase();

                const index = wordCounters[normalizedMark] || 0;

                const matchingWords = Array.from(document.querySelectorAll('.sentence-word')).filter(btn => btn.innerText.trim().toUpperCase() === normalizedMark);

                const btn = matchingWords[index];

                if (btn) {

                    const { emphasize, pitch, slowDown, speedUp } = btn.dataset;

                    const animation = {
                        targets: btn,
                        duration: 400,
                        easing: 'easeInOutBack',
                        direction: 'alternate',
                    };

                    switch (true) {
                        case emphasize === "true":
                            //animation.scale = [1, 1.5];
                            animation.translateY = -20;
                            break;

                        case pitch === "high":
                            animation.translateY = -15;
                            animation.rotate = -10;
                            break;

                        case pitch === "low":
                            animation.translateY = 15;
                            animation.rotate = 10;
                            break;

                        case slowDown === "true":
                            animation.scale = [1, 1.2];
                            animation.duration = 800;
                            break;

                        case speedUp === "true":
                            animation.scale = [1, 1.1];
                            animation.duration = 200;
                            break;

                        default:
                            animation.translateY = -5;
                            break;
                    }

                    anime(animation);
                }

                wordCounters[normalizedMark] = index + 1;
            }, mark.time);
        });

        audio.play(); // Play it!

    } catch (error) {
        console.error('Error speaking sentence:', error);
        console.log("SSML being sent to Polly:", sentence);
    }
}

async function getSpeechMarks(text) {
    const res = await fetch('/api/speechMark', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
    });
    console.log("📡 Raw response from /api/speechMark:", res);

    if (!res.ok) {
        console.error("Failed to fetch speech marks");
        return [];
    }

    const json = await res.json();
    console.log("Parsed JSON: ", json);

    const { marks } = json;

    if (!marks) {
        console.error("Speech marks missing in response");
        return [];
    }

    return marks;
}


function buildSSMLFromSentence() {
    let ssml = "";

    const lastIndex = builtSentence.length - 1;
    const isQuestion = builtSentence[lastIndex]?.type === "questionMark";

    builtSentence.forEach((wordObj, index) => {
        if (wordObj.type === "questionMark") return;

        if (wordObj.type === "comma") {
            ssml += `<break time="500ms"/>`;
            return;
        }

        let wordText = wordObj.text;

        // apply function for each effect 
        for (const key in effectsConfig) {
            if (wordObj[key] && typeof effectsConfig[key].apply === "function") {
                wordText = effectsConfig[key].apply(wordText);
            }
        }

        // Apply Question effect 
        if (isQuestion && index === lastIndex - 1) {
            wordText = `<prosody pitch="high">${wordText}</prosody>`;
        }

        ssml += wordText + ' ';

        if (wordObj.pauseAfter) {
            ssml += `<break time="500ms"/>`;
        }

    });

    let prosodyAttributes = [];

    // Apply Sentence emotions 
    for (const emotion in sentenceEmotions) {
        if (sentenceEmotions[emotion]) {

            const effects = createdEmotions[emotion].effects;

            for (const effect in effects) {

                if (effects[effect] && effectsConfig[effect]?.prosody) {
                    prosodyAttributes.push(effectsConfig[effect].prosody);
                    console.log(prosodyAttributes);
                }
            }
        }
    }

    if (prosodyAttributes.length > 0) {
        ssml = `<prosody ${prosodyAttributes.join(" ")}>${ssml}</prosody>`;
    }

    ssml = '<speak>' + ssml + '</speak>';
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

        // Pass information on effects 
        wordButton.dataset.emphasize = wordObj.emphasize;
        wordButton.dataset.slowDown = wordObj.slowDown;
        wordButton.dataset.speedUp = wordObj.speedUp;
        wordButton.dataset.pitchHigh = wordObj.pitchHigh;
        wordButton.dataset.pitchLow = wordObj.pitchLow;

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



