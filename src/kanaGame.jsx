import { useState, useRef, useEffect } from "react";

export default function KanaGame({ mode, kanaPool, onExit, BASE_PATH }) {
    const [currentKana, setCurrentKana] = useState(null);
    const [choices, setChoices] = useState([]);
    const [input, setInput] = useState("");
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(4);
    const [feedback, setFeedback] = useState("");
    const [selectedChoice, setSelectedChoice] = useState(null);
    const [isLocked, setIsLocked] = useState(false);
    const [waitingNext, setWaitingNext] = useState(false);
    const nextButtonRef = useRef(null);    
    const inputRef = useRef(null);
    const correctSound = useRef(new Audio(`${BASE_PATH}Audio/correct.wav`));
    const [mistakes, setMistakes] = useState([]);
    
  // 🔁 Get random kana (no repeats)
  const getRandomKana = () => {
    if (kanaPool.length === 0) return null;

    let next;
    do {
      next = kanaPool[Math.floor(Math.random() * kanaPool.length)];
    } while (kanaPool.length > 1 && next.kana === currentKana?.kana);

    return next;
  };

  // 🎯 Generate multiple choice options
  const generateChoices = (correct) => {
    const wrong = kanaPool
      .filter(k => k.romaji !== correct.romaji)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const all = [...wrong, correct].sort(() => 0.5 - Math.random());
    setChoices(all);
  };

  // ➡️ Next question
  const nextQuestion = () => {
    const next = getRandomKana();
    if (!next) return;

    setCurrentKana(next);
    setInput("");
    setFeedback("");
    setSelectedChoice(null);
    setIsLocked(false);

    if (mode === "multiple") {
      generateChoices(next);
    }
  };

  //EFFECTS
  // 🚀 Initial load
  useEffect(() => {
    nextQuestion();
  }, [kanaPool]);

  // 🧠 Handle answer result
  const handleResult = (isCorrect, wrongAnswer = "") => {
    if (isCorrect) {
      setScore(prev => prev + 1);
      setFeedback("✅ Correct!");
      correctSound.current.currentTime = 0;
      correctSound.current.play();
    } else {
      setLives(prev => prev - 1);
      setFeedback(`❌ Correct: ${currentKana.romaji}`);

      // Store mistake
      setMistakes(prev => [
        ...prev,
        {
          kana: currentKana.kana,
          wrong: wrongAnswer,
          correct: currentKana.romaji,
        },
      ]);
    }

    setIsLocked(true);
    setWaitingNext(true);
  };

  const handleNext = () => {
      if (lives <= 0) return;

      setWaitingNext(false);
      nextQuestion();
  };

  useEffect(() => {
    if (
      mode === "multiple" &&
      waitingNext &&
      nextButtonRef.current
    ) {
      nextButtonRef.current.focus();
    }
  }, [waitingNext, mode]);

  useEffect(() => {
    if (mode === "typing" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentKana, mode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // ENTER → next question
      if (
        mode === "multiple" &&
        e.key === "Enter" &&
        waitingNext
      ) {
        handleNext();
        return;
      }

      if (
        mode !== "multiple" ||
        isLocked
      ) {
        return;
      }

      const index = Number(e.key) - 1;

      if (
        index >= 0 &&
        index < choices.length
      ) {
        handleChoice(choices[index]);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    choices,
    mode,
    isLocked,
    waitingNext,
  ]);

  // 🟦 Multiple choice click
  const handleChoice = (choice) => {
    if (isLocked) return;

    setSelectedChoice(choice.romaji);

    handleResult(
      choice.romaji === currentKana.romaji,
      choice.romaji
    );
  };

  // ⌨️ Typing submit
  const handleSubmit = (e) => {
    e.preventDefault();

    if (waitingNext) {
      handleNext();
      return;
    }

    if (isLocked) return;

    const answer = input.trim().toLowerCase();

    const isCorrect =
      answer === currentKana.romaji;

    handleResult(isCorrect, answer);
  };

  // 💀 Game Over
if (lives <= 0) {
  return (
    <div className="game-container">
      <h1>Game Over</h1>

      <h2>Score: {score}</h2>

      <h3>Mistakes</h3>

      {mistakes.length === 0 ? (
        <p>No mistakes 🎉</p>
      ) : (
        <div className="answers">
          {mistakes.map((m, index) => (
            <div
              key={index}
              className="mistake-item"
            >
              <p>
                <strong>{m.kana}</strong>
              </p>

              <p>
                Your answer: {m.wrong}
              </p>

              <p>
                Correct answer: {m.correct}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        className="btn"
        onClick={onExit}
      >
        Back
      </button>
    </div>
  );
}

  if (!currentKana) return <div>Loading...</div>;

    return (
    <div className="game-container">
        {/* HUD */}
        <div className="kana-hud">
        <span>Score: {score}</span>
        <span>Lives: {"❤️".repeat(lives)}</span>
        </div>

        {/* Kana */}
        <h1 className="kana-display">{currentKana.kana}</h1>

        {/* MULTIPLE CHOICE */}
        {mode === "multiple" && (
          <>
            <div className="choices">
              {choices.map((choice, index) => {
                let className = "choice-container";

                if (isLocked) {
                  if (
                    choice.romaji ===
                    currentKana.romaji
                  ) {
                    className += " correct";
                  } else if (
                    choice.romaji ===
                    selectedChoice
                  ) {
                    className += " wrong";
                  }
                }

                return (
                  <div
                    key={index}
                    className={className}
                    onClick={() =>
                      handleChoice(choice)
                    }
                  >
                    <p className="choice-prefix">
                      {index + 1}
                    </p>

                    <p className="choice-text">
                      {choice.romaji}
                    </p>
                  </div>
                );
              })}
            </div>

            {waitingNext && lives > 0 && (
              <button
                ref={nextButtonRef}
                type="button"
                className="btn"
                onClick={handleNext}
              >
                Next
              </button>
            )}
          </>
        )}
        

        {/* TYPING */}
        {mode === "typing" && (
            <form onSubmit={handleSubmit}>
            <input
                type="text"
                value={input}
                ref={inputRef}
                onChange={(e) => {
                  if (!waitingNext) {
                    setInput(e.target.value);
                  }
                }}
                placeholder="Type romaji..."
                autoFocus
            />
            <button className="btn" type="submit">
              {waitingNext ? "Next" : "Submit"}
            </button>
            </form>
        )}
        
        <p className="feedback">{feedback}</p>
        <button className="btn" onClick={onExit}>
            Back
        </button>
    </div>
  );
}