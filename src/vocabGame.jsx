import { useEffect, useState, useRef, useCallback } from "react";

export default function VocabGame({ setView, BASE_PATH }) {
  const [vocabData, setVocabData] = useState([]);
  const [remainingVocab, setRemainingVocab] = useState([]);
  const [currentVocab, setCurrentVocab] = useState(null);
  const [choices, setChoices] = useState([]);

  const [questionCounter, setQuestionCounter] = useState(0);
  const [correctCount, setCorrectCount] = useState(0); // renamed for clarity
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const jlptLevel = localStorage.getItem("JLPT");
  const step = Number(localStorage.getItem("step"));
  const correctAudio = useRef(null);

  // LOAD DATA
   useEffect(() => {
    const loadVocab = async () => {
      try {
        const base = BASE_PATH.endsWith('/') ? BASE_PATH : BASE_PATH + '/';
        const url = `${base}Data/Vocab_data_N${jlptLevel}.json`;
        
        console.log("Fetching vocab from:", url);

        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        // FIXED: Match your actual JSON key format "unit 1", "unit 2", etc.
        const unitKey = `unit ${step}`;
        const levelData = data.units?.[unitKey] || [];

        console.log(`Looking for unit: "${unitKey}" | Found ${levelData.length} items`);

        if (levelData.length === 0) {
          console.error(`No data found for ${unitKey}`);
          return;
        }

        setVocabData(levelData);
        setRemainingVocab([...levelData]);
        setTotalQuestions(levelData.length);

        // Start first question
        setTimeout(() => {
          nextQuestionInternal(levelData, [...levelData]);
        }, 100);

      } catch (error) {
        console.error("Failed to load vocab data:", error);
      }
    };

    loadVocab();
  }, [jlptLevel, step, BASE_PATH]);


  // AUDIO
  useEffect(() => {
    const audioPath = `${BASE_PATH}Audio/correct.wav`;
    console.log("Loading audio from:", audioPath);
    
    correctAudio.current = new Audio(audioPath);
    
    return () => {
      if (correctAudio.current) correctAudio.current.pause();
    };
  }, [BASE_PATH]);

  function speak(text) {
    const clean = text.replace(/\|/g, "");
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "ja-JP";
    speechSynthesis.speak(utter);
  }

  // KEYBOARD HANDLER (stabilized with useCallback)
  const handleKeyDown = useCallback(
    (e) => {
      if (!currentVocab) return;

      const key = Number(e.key);

      if (!showAnswer && key >= 1 && key <= choices.length) {
        handleAnswer(choices[key - 1]);
      }

      if (showAnswer && (e.key === "Enter" || e.key === " ")) {
        nextQuestion();
      }
    },
    [currentVocab, choices, showAnswer]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // SHUFFLE HELPER
  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  // Internal next question logic (to avoid stale closures)
  const nextQuestionInternal = (fullData, currentRemaining) => {
    if (currentRemaining.length === 0) {
      endGame(questionCounter, correctCount);
      return;
    }

    const randomIndex = Math.floor(Math.random() * currentRemaining.length);
    const vocab = currentRemaining[randomIndex];
    const correct = vocab.english;

    const answers = new Set([correct]);

    while (answers.size < 4) {
      const rand = fullData[Math.floor(Math.random() * fullData.length)];
      if (rand.english && rand.english !== correct) {
        answers.add(rand.english);
      }
    }

    setChoices(shuffle([...answers]));
    setCurrentVocab(vocab);
    setRemainingVocab((prev) => prev.filter((_, i) => i !== randomIndex));

    setShowAnswer(false);
    setSelected(null);
  };

  // NEXT QUESTION
  const nextQuestion = () => {
    nextQuestionInternal(vocabData, remainingVocab);
  };

  // HANDLE ANSWER
  const getReading = (str) => {
    return str
      // Replace ruby with its reading
      .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, "$2")
      // Remove any leftover HTML
      .replace(/<[^>]+>/g, "")
      // Remove romaji
      .replace(/\(.*?\)/g, "")
      .trim();
  };

  const handleAnswer = (choice) => {
    if (showAnswer || !currentVocab) return;

    const correct = currentVocab.english;
    const isCorrect = choice === correct;

    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    const newQuestionCounter = questionCounter + 1;

    if (isCorrect && correctAudio.current) {
      setTimeout(() => {
        speak(getReading(currentVocab.japanese));  
      }, 300);
      correctAudio.current.pause();
      correctAudio.current.currentTime = 0;
      correctAudio.current.play().catch(() => {}); // ignore autoplay issues
    }

    setCorrectCount(newCorrectCount);
    setQuestionCounter(newQuestionCounter);
    setSelected(choice);
    setShowAnswer(true);
  };

  // END GAME
  const endGame = (finalQuestions, finalCorrect) => {
    const score =
      finalQuestions > 0
        ? ((finalCorrect / finalQuestions) * 100).toFixed(2)
        : "0.00";

    localStorage.setItem(
      "mostRecentScore",
      JSON.stringify({
        score,
        jlpt: jlptLevel,
        step,
      })
    );

    setView("end");
  };

  const correctAnswer = currentVocab?.english;

  return (
    <div className="flex-center flex-column">
      <div className="grid">
        {/* HUD */}
        <div className="hud">
          <div className="hud-item">
            <h3>N{jlptLevel} - Step: {step}</h3>
          </div>
          <div className="hud-item">
            <p className="hud-text">
              Question: {questionCounter} / {totalQuestions}
            </p>
            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width:
                    totalQuestions > 0
                      ? `${(questionCounter / totalQuestions) * 100}%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div className="hud-item">
            <p className="hud-text">
              Accuracy:{" "}
              {questionCounter > 0
                ? ((correctCount / questionCounter) * 100).toFixed(2)
                : "0.00"}
              %
            </p>
          </div>
        </div>

        {/* QUESTION */}
        <div className="top-bar">
          <h2 dangerouslySetInnerHTML={{ __html: currentVocab?.japanese || "" }} />

          <button
            className="next-btn"
            onClick={nextQuestion}
            disabled={!showAnswer}
          >
            →
          </button>
        </div>

        {/* ANSWERS */}
        <div className="answers">
          {choices.map((choice, i) => {
            let className = "choice-container";

            if (showAnswer) {
              if (choice === correctAnswer) className += " correct";
              else if (choice === selected) className += " incorrect";
            }

            return (
              <div
                key={i}
                className={className}
                onClick={() => handleAnswer(choice)}
                style={{ cursor: showAnswer ? "default" : "pointer" }}
              >
                <p className="choice-prefix">{i + 1}</p>
                <p className="choice-text">{choice}</p>
              </div>
            );
          })}
        </div>
      </div>

      <button className="back-btn" onClick={() => setView({ screen: "home" })}>
        Back
      </button>
    </div>
  );
  return (
    <div className="flex-center flex-column">
      <h1>All Vocabulary Learned 🎉</h1>

      <button
        className="back-btn"
        onClick={() => {
          resetSession();
          setView({ screen: "home" });
        }}
      >
        Back
      </button>
    </div>
  )
}