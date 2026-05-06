import { useState, useEffect, useCallback } from "react";

/* =========================
   NUMBER → JAPANESE LOGIC
========================= */

const units = ["", "いち", "に", "さん", "よん", "ご", "ろく", "なな", "はち", "きゅう"];

const kanjiUnits = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

function getBelow10000(n, mode = "hiragana") {
  let result = "";

  const u = mode === "hiragana" ? units : kanjiUnits;

  const thousands = Math.floor(n / 1000);
  const hundreds = Math.floor((n % 1000) / 100);
  const tens = Math.floor((n % 100) / 10);
  const ones = n % 10;

  // thousands
  if (thousands > 0) {
    if (mode === "hiragana") {
      if (thousands === 1) result += "せん|";
      else if (thousands === 3) result += "さんぜん|";
      else if (thousands === 8) result += "はっせん|";
      else result += units[thousands] + "せん|";
    } else {
      result += (thousands === 1 ? "" : kanjiUnits[thousands]) + "千";
    }
  }

  // hundreds
  if (hundreds > 0) {
    if (mode === "hiragana") {
      if (hundreds === 1) result += "ひゃく|";
      else if (hundreds === 3) result += "さんびゃく|";
      else if (hundreds === 6) result += "ろっぴゃく|";
      else if (hundreds === 8) result += "はっぴゃく|";
      else result += units[hundreds] + "ひゃく|";
    } else {
      result += (hundreds === 1 ? "" : kanjiUnits[hundreds]) + "百";
    }
  }

  // tens
  if (tens > 0) {
    if (mode === "hiragana") {
      if (tens === 1) result += "じゅう";
      else result += units[tens] + "じゅう";
    } else {
      result += (tens === 1 ? "" : kanjiUnits[tens]) + "十";
    }
  }

  // ones
  if (ones > 0) {
    result += u[ones];
  }

  return result;
}

function numberToJapanese(n, mode = "hiragana") {
  if (n === 0) return mode === "hiragana" ? "ゼロ" : "零";

  let result = "";

  const oku = Math.floor(n / 100000000);
  const man = Math.floor((n % 100000000) / 10000);
  const rest = n % 10000;

  if (oku > 0) result += getBelow10000(oku, mode) + (mode === "hiragana" ? "おく|" : "億");
  if (man > 0) result += getBelow10000(man, mode) + (mode === "hiragana" ? "まん|" : "万");
  if (rest > 0) result += getBelow10000(rest, mode);

  return result;
}

/* =========================
   RANDOM + DISTRACTORS
========================= */

function getRandomNumber(difficulty) {
  switch (difficulty) {
    case "easy":
      return Math.floor(Math.random() * 1000) + 1;
    case "medium":
      return Math.floor(Math.random() * 100000) + 1;
    case "hard":
      return Math.floor(Math.random() * 100000000) + 1;
    default:
      return 1;
  }
}

function generateTrickNumbers(n) {
  const tricks = new Set();

  while (tricks.size < 3) {
    let variation;

    const rand = Math.random();

    if (rand < 0.33) {
      // small variation
      variation = n + Math.floor(Math.random() * 20 - 10);
    } else if (rand < 0.66) {
      // digit swap
      const str = n.toString();
      const arr = str.split("");
      const i = Math.floor(Math.random() * arr.length);
      const j = Math.floor(Math.random() * arr.length);
      [arr[i], arr[j]] = [arr[j], arr[i]];
      variation = parseInt(arr.join(""));
    } else {
      // magnitude confusion
      variation = n * (Math.random() > 0.5 ? 10 : 0.1);
    }

    variation = Math.floor(variation);

    if (variation > 0 && variation !== n) {
      tricks.add(variation);
    }
  }

  return Array.from(tricks);
}

/* =========================
   MAIN COMPONENT
========================= */

export default function NumberGame({ setView, onExit }) {
  const [difficulty, setDifficulty] = useState(null);
  const [screen, setScreen] = useState("select");
  const [number, setNumber] = useState(0);
  const [choices, setChoices] = useState([]);
  const [correct, setCorrect] = useState(null);

  const [mode, setMode] = useState("jpToNumber"); // or numberToJP
  const [displayMode, setDisplayMode] = useState("hiragana"); // or kanji

  /* =========================
     GENERATE QUESTION
  ========================= */
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);

  const generateQuestion = useCallback(() => {
    const num = getRandomNumber(difficulty);
    const correctAnswer =
      mode === "numberToJP"
        ? numberToJapanese(num, displayMode)
        : num;

    const wrongNumbers = generateTrickNumbers(num);

    let allChoices;

    if (mode === "numberToJP") {
      allChoices = [
        correctAnswer,
        ...wrongNumbers.map(n => numberToJapanese(n, displayMode)),
      ];
    } else {
      allChoices = [correctAnswer, ...wrongNumbers];
    }

    allChoices = allChoices
      .filter((v, i, arr) => arr.indexOf(v) === i)
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    setNumber(num);
    setChoices(allChoices);
    setCorrect(correctAnswer);

    setSelectedChoice(null);
    setIsAnswered(false);
  }, [difficulty, mode, displayMode]);

    useEffect(() => {
        if (screen === "game") {
            generateQuestion();
        }
    }, [generateQuestion, screen]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  /* =========================
     KEYBOARD INPUT
  ========================= */

  useEffect(() => {
    function handleKey(e) {
        if (!isAnswered) {
        const key = parseInt(e.key);
        if (key >= 1 && key <= 4) {
            handleAnswer(choices[key - 1]);
        }
        } else {
        if (e.key === "Enter") {
            nextQuestion();
        }
        }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    }, [choices, isAnswered]);

  /* =========================
     TTS
  ========================= */

  function speak(text) {
    const cleanText = text.replace(/\|/g, ""); // remove separators

    const utter = new SpeechSynthesisUtterance(cleanText);
    utter.lang = "ja-JP";
    speechSynthesis.speak(utter);
  }
  /* =========================
     ANSWER HANDLING
  ========================= */

  function handleAnswer(choice) {
    if (isAnswered) return;

        setSelectedChoice(choice);
        setIsAnswered(true);

        if (choice === correct) {
            speak(numberToJapanese(number, "hiragana"));
        } else {
            speak("ちがいます");
        }
    }

    function nextQuestion() {
        generateQuestion();
    }

  /* =========================
     RENDER
  ========================= */

  if (screen === "select") {
    return (
        <div className="flex-column">
        <h2>Select Difficulty</h2>
            <div
            className="btn"
            onClick={() => {
                setDifficulty("easy");
                setScreen("game");
            }}
            >
            Easy (1–1,000)
            </div>

            <div
            className="btn"
            onClick={() => {
                setDifficulty("medium");
                setScreen("game");
            }}
            >
            Medium (1–100,000)
            </div>

            <div
            className="btn"
            onClick={() => {
                setDifficulty("hard");
                setScreen("game");
            }}
            >
            Hard (1–100,000,000)
            </div>

        <button
            className="back-btn"
            onClick={() => setView({ screen: "home" })}
        >
            Back
        </button>
        </div>
    );
    }
  return (
        <div className="flex-column">
            <div className="grid">
            {/* TOP BAR */}
            <div className="hud">
                {/* CONTROLS */}
                <div className="controls">
                    <button className="btn" onClick={() => setMode(m => m === "numberToJP" ? "jpToNumber" : "numberToJP")}>
                    Mode: {mode}
                    </button>

                <button className="btn" onClick={() => setDisplayMode(m => m === "hiragana" ? "kanji" : "hiragana")}>
                Script: {displayMode}
                </button>

                <button className="btn" onClick={() => speak(numberToJapanese(number, "hiragana"))}>
                🔊
                </button>
                </div>
                <button className="next-btn" onClick={nextQuestion}>
                    →
                </button>
                
            </div>
                <div className="top-bar">
                    <h2>
                        {mode === "numberToJP"
                        ? number
                        : numberToJapanese(number, displayMode)}
                    </h2>
                </div>

            {/* ANSWERS */}
            <div className="answers">
                {choices.map((choice, i) => {
                    let className = "choice-container";

                    if (isAnswered) {
                    if (choice === correct) {
                        className += " correct";
                    } else if (choice === selectedChoice) {
                        className += " incorrect";
                    }
                    }

                    return (
                    <div
                        key={i}
                        className={className}
                        onClick={() => handleAnswer(choice)}
                    >
                        <p className="choice-prefix">{i + 1}</p>
                        <p className="choice-text">{choice}</p>
                    </div>
                    );
                })}
            </div>
        </div>
        <button className="back-btn" onClick={() => { setView({ screen: "home" });}}>Back</button>
    </div>
  );
}