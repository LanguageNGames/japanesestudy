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

  if (tens > 0) {
    if (mode === "hiragana") {
      if (tens === 1) result += "じゅう";
      else result += units[tens] + "じゅう";
    } else {
      result += (tens === 1 ? "" : kanjiUnits[tens]) + "十";
    }
  }

  if (ones > 0) result += u[ones];

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
   ROMAJI
========================= */

function kanaToRomaji(text) {
  return text
    .replace(/\|/g, " ")

    // ✅ small tsu (double consonant)
    .replace(/っ(きゃ|きゅ|きょ|しゃ|しゅ|しょ|ちゃ|ちゅ|ちょ|にゃ|にゅ|にょ|ひゃ|ひゅ|ひょ|みゃ|みゅ|みょ|りゃ|りゅ|りょ|びゃ|びゅ|びょ|ぴゃ|ぴゅ|ぴょ)/g,
    (m, p1) => p1[0].replace(/き|し|ち|に|ひ|み|り|び|ぴ/, c => ({
        き:"k",し:"sh",ち:"ch",に:"n",ひ:"h",み:"m",り:"r",び:"b",ぴ:"p"
    }[c])) + p1
    )

    // fallback for single kana
    .replace(/っ(.)/g, (m, p1) => {
    const map = {
        か:"k",き:"k",く:"k",け:"k",こ:"k",
        さ:"s",し:"s",す:"s",せ:"s",そ:"s",
        た:"t",ち:"t",つ:"t",て:"t",と:"t",
        ぱ:"p",ぴ:"p",ぷ:"p",ぺ:"p",ぽ:"p",
        ば:"b",び:"b",ぶ:"b",べ:"b",ぼ:"b",
    };
    return (map[p1] || "") + p1;
    })

    // digraphs
    .replace(/きゃ/g, "kya").replace(/きゅ/g, "kyu").replace(/きょ/g, "kyo")
    .replace(/しゃ/g, "sha").replace(/しゅ/g, "shu").replace(/しょ/g, "sho")
    .replace(/ちゃ/g, "cha").replace(/ちゅ/g, "chu").replace(/ちょ/g, "cho")
    .replace(/にゃ/g, "nya").replace(/にゅ/g, "nyu").replace(/にょ/g, "nyo")
    .replace(/ひゃ/g, "hya").replace(/ひゅ/g, "hyu").replace(/ひょ/g, "hyo")
    .replace(/みゃ/g, "mya").replace(/みゅ/g, "myu").replace(/みょ/g, "myo")
    .replace(/りゃ/g, "rya").replace(/りゅ/g, "ryu").replace(/りょ/g, "ryo")
    .replace(/びゃ/g, "bya").replace(/びゅ/g, "byu").replace(/びょ/g, "byo")
    .replace(/ぴゃ/g, "pya").replace(/ぴゅ/g, "pyu").replace(/ぴょ/g, "pyo")
    .replace(/じゃ/g, "ja").replace(/じゅ/g, "ju").replace(/じょ/g, "jo")

    // base kana (same as before)
    .replace(/あ/g, "a").replace(/い/g, "i").replace(/う/g, "u").replace(/え/g, "e").replace(/お/g, "o")
    .replace(/か/g, "ka").replace(/き/g, "ki").replace(/く/g, "ku").replace(/け/g, "ke").replace(/こ/g, "ko")
    .replace(/さ/g, "sa").replace(/し/g, "shi").replace(/す/g, "su").replace(/せ/g, "se").replace(/そ/g, "so")
    .replace(/た/g, "ta").replace(/ち/g, "chi").replace(/つ/g, "tsu").replace(/て/g, "te").replace(/と/g, "to")
    .replace(/な/g, "na").replace(/に/g, "ni").replace(/ぬ/g, "nu").replace(/ね/g, "ne").replace(/の/g, "no")
    .replace(/は/g, "ha").replace(/ひ/g, "hi").replace(/ふ/g, "fu").replace(/へ/g, "he").replace(/ほ/g, "ho")
    .replace(/ま/g, "ma").replace(/み/g, "mi").replace(/む/g, "mu").replace(/め/g, "me").replace(/も/g, "mo")
    .replace(/や/g, "ya").replace(/ゆ/g, "yu").replace(/よ/g, "yo")
    .replace(/ら/g, "ra").replace(/り/g, "ri").replace(/る/g, "ru").replace(/れ/g, "re").replace(/ろ/g, "ro")
    .replace(/わ/g, "wa").replace(/を/g, "o").replace(/ん/g, "n")

    .replace(/が/g, "ga").replace(/ぎ/g, "gi").replace(/ぐ/g, "gu").replace(/げ/g, "ge").replace(/ご/g, "go")
    .replace(/ざ/g, "za").replace(/じ/g, "ji").replace(/ず/g, "zu").replace(/ぜ/g, "ze").replace(/ぞ/g, "zo")
    .replace(/だ/g, "da").replace(/ぢ/g, "ji").replace(/づ/g, "zu").replace(/で/g, "de").replace(/ど/g, "do")
    .replace(/ば/g, "ba").replace(/び/g, "bi").replace(/ぶ/g, "bu").replace(/べ/g, "be").replace(/ぼ/g, "bo")
    .replace(/ぱ/g, "pa").replace(/ぴ/g, "pi").replace(/ぷ/g, "pu").replace(/ぺ/g, "pe").replace(/ぽ/g, "po");
}

function getDisplay(n, mode) {
  if (mode === "kanji") return numberToJapanese(n, "kanji");

  const hira = numberToJapanese(n, "hiragana");

  if (mode === "romaji") return kanaToRomaji(hira);

  return hira;
}

/* =========================
   RANDOM + DISTRACTORS
========================= */

function getRandomNumber(difficulty) {
  switch (difficulty) {
    case "easy": return Math.floor(Math.random() * 1000) + 1;
    case "medium": return Math.floor(Math.random() * 100000) + 1;
    case "hard": return Math.floor(Math.random() * 100000000) + 1;
    default: return 1;
  }
}

function generateTrickNumbers(n) {
  const tricks = new Set();

  while (tricks.size < 3) {
    let variation;
    const rand = Math.random();

    if (rand < 0.33) variation = n + Math.floor(Math.random() * 20 - 10);
    else if (rand < 0.66) {
      const arr = n.toString().split("");
      const i = Math.floor(Math.random() * arr.length);
      const j = Math.floor(Math.random() * arr.length);
      [arr[i], arr[j]] = [arr[j], arr[i]];
      variation = parseInt(arr.join(""));
    } else variation = n * (Math.random() > 0.5 ? 10 : 0.1);

    variation = Math.floor(variation);
    if (variation > 0 && variation !== n) tricks.add(variation);
  }

  return Array.from(tricks);
}

/* =========================
   COMPONENT
========================= */

export default function NumberGame({ setView }) {
  const [difficulty, setDifficulty] = useState(null);
  const [screen, setScreen] = useState("select");

  const [number, setNumber] = useState(0);
  const [choices, setChoices] = useState([]);
  const [correct, setCorrect] = useState(null);

  const [mode, setMode] = useState("jpToNumber");
  const [displayMode, setDisplayMode] = useState("hiragana");

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const generateQuestion = useCallback(() => {
    const num = getRandomNumber(difficulty);

    const correctAnswer =
      mode === "numberToJP"
        ? getDisplay(num, displayMode)
        : num;

    const wrongNumbers = generateTrickNumbers(num);

    let allChoices =
      mode === "numberToJP"
        ? [correctAnswer, ...wrongNumbers.map(n => getDisplay(n, displayMode))]
        : [correctAnswer, ...wrongNumbers];

    allChoices = [...new Set(allChoices)]
      .sort(() => Math.random() - 0.5)
      .slice(0, 4);

    setNumber(num);
    setChoices(allChoices);
    setCorrect(correctAnswer);
    setSelectedChoice(null);
    setIsAnswered(false);
  }, [difficulty, mode, displayMode]);

  useEffect(() => {
    if (screen === "numbers") generateQuestion();
  }, [generateQuestion, screen]);

  useEffect(() => {
    function handleKey(e) {
      if (!isAnswered) {
        const key = parseInt(e.key);
        if (key >= 1 && key <= 4) handleAnswer(choices[key - 1]);
      } else if (e.key === "Enter") {
        nextQuestion();
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [choices, isAnswered]);

  function speak(text) {
    const clean = text.replace(/\|/g, "");
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "ja-JP";
    speechSynthesis.speak(utter);
  }

  function handleAnswer(choice) {
    if (isAnswered) return;

    setSelectedChoice(choice);
    setIsAnswered(true);

    if (choice === correct) {
      speak(numberToJapanese(number, "hiragana"));
    }
  }

  function nextQuestion() {
    generateQuestion();
  }

  if (screen === "select") {
    return (
      <div className="flex-column">
        <h2>Select Difficulty</h2>

        <div className="btn" onClick={() => { setDifficulty("easy"); setScreen("numbers"); }}>
          Easy (1–1,000)
        </div>

        <div className="btn" onClick={() => { setDifficulty("medium"); setScreen("numbers"); }}>
          Medium (1–100,000)
        </div>

        <div className="btn" onClick={() => { setDifficulty("hard"); setScreen("numbers"); }}>
          Hard (1–100,000,000)
        </div>

        <button className="back-btn" onClick={() => setView({ screen: "home" })}>
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex-column">
      <div className="grid">

        <div className="hud">
          <div className="controls">
            <button className="btn" onClick={(e) => {e.currentTarget.blur(); setMode(m => m === "numberToJP" ? "jpToNumber" : "numberToJP")}}>
              Mode: {mode}
            </button>

            <button
              className="btn"
              onClick={(e) =>{
                e.currentTarget.blur();
                setDisplayMode(m =>
                  m === "hiragana" ? "kanji" :
                  m === "kanji" ? "romaji" :
                  "hiragana"
                )}
              }
            >
              Script: {displayMode}
            </button>

            <button className="btn" onClick={() => speak(numberToJapanese(number, "hiragana"))}>
              🔊
            </button>
          </div>

          {isAnswered && (
            <button className="next-btn" onClick={nextQuestion}>
              →
            </button>
          )}
        </div>

        <div className="top-bar">
          <h2>
            {mode === "numberToJP"
              ? number
              : getDisplay(number, displayMode)}
          </h2>
        </div>

        <div className="answers">
          {choices.map((choice, i) => {
            let className = "choice-container";

            if (isAnswered) {
              if (choice === correct) className += " correct";
              else if (choice === selectedChoice) className += " incorrect";
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

      <button className="back-btn" onClick={() => setScreen("select")}>
        Back
      </button>
    </div>
  );
}