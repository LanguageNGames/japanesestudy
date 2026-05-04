import { useEffect, useState } from "react";

export default function GrammarFillBlanks({
  BASE_PATH,
  level,
  selectedGrammar,
  onExit,
}) {
  const [questionPool, setQuestionPool] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [choices, setChoices] = useState([]);

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  const [answeredQuestions, setAnsweredQuestions] = useState(0);
  const [correctQuestions, setCorrectQuestions] = useState(0);

  const [gameOver, setGameOver] = useState(false);
  const [showHint, setShowHint] = useState(false);
  

  /* EFFECTS */
  useEffect(() => {
    loadQuestionPool();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showExplanation) {
        if (e.key === "Enter") {
          nextQuestion();
        }

        return;
      }

      const keyMap = {
        1: 0,
        2: 1,
        3: 2,
        4: 3,
      };

      if (keyMap[e.key] !== undefined) {
        const index = keyMap[e.key];

        if (choices[index]) {
          handleAnswer(choices[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [choices, currentQuestion, showExplanation]);

  const loadQuestionPool = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.BASE_URL}Data/fillGap.json`
      );

      const json = await res.json();

      const levelData = json[level];
      
      if (!levelData) {
        console.error("Level not found:", level);
        return;
      }

      const combined = [
        ...(levelData.beginner || []),
        ...(levelData.intermediate || []),
        ...(levelData.advanced || []),
      ];

      const filtered = combined.filter((item) =>
        selectedGrammar.includes(item.key)
      );

      console.log("FILTERED:", filtered);

      setQuestionPool(filtered);

      if (filtered.length > 0) {
        generateQuestion(filtered);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const shuffleArray = (array) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  const generateQuestion = (pool = questionPool) => {
    if (pool.length === 0) return;

    const randomQuestion =
      pool[Math.floor(Math.random() * pool.length)];

    setCurrentQuestion(randomQuestion);
    setChoices(shuffleArray(randomQuestion.choices));

    setSelectedChoice(null);
    setShowExplanation(false);
    setShowHint(false);
  };

  const handleAnswer = (choice) => {
    if (showExplanation) return;

    setSelectedChoice(choice);
    setShowExplanation(true);

    setAnsweredQuestions((prev) => prev + 1);

    if (
      JSON.stringify(choice) ===
      JSON.stringify(currentQuestion.answer)
    ) {
      new Audio(`${import.meta.env.BASE_URL}Audio/correct.wav`).play();

      setScore((prev) => prev + 10);
      setCorrectQuestions((prev) => prev + 1);
    } else {
      const remainingLives = lives - 1;

      setLives(remainingLives);

      if (remainingLives <= 0) {
        setTimeout(() => {
          setGameOver(true);
        }, 300);
      }
    }
  };

  const nextQuestion = () => {
    if (gameOver) return;

    generateQuestion();
  };

  const accuracy =
    answeredQuestions > 0
      ? Math.round((correctQuestions / answeredQuestions) * 100)
      : 0;

  if (!currentQuestion) {
  return (
    <div className="flex-center flex-column">
      <h2>Loading...</h2>

      <p>Level: {String(level)}</p>

      <p>
        Selected grammar:
        {JSON.stringify(selectedGrammar)}
      </p>

      <p>
        Pool size: {questionPool.length}
      </p>
    </div>
  );
}

  return (
    <div className="grammar-game flex-center flex-column">
      <h1>Grammar Game</h1>

      <div className="hud">
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <div>
          Progress: {answeredQuestions}
        </div>
        <div>Accuracy: {accuracy}%</div>
      </div>

      {!gameOver ? (
        <>
          <div className="grammar-question-card">
            <div
              className="grammar-question"
              dangerouslySetInnerHTML={{
                __html: currentQuestion.question,
              }}
            />
          </div>
          <div className="hint-section">
            <button
              className="btn"
              onClick={() => setShowHint((prev) => !prev)}
            >
              {showHint ? "Hide Translation" : "Show Translation"}
            </button>
            {showHint && currentQuestion.translation && (currentQuestion.translation)}
          </div>

          <div className="answers">
            {choices.map((choice, index) => {
              const isCorrect =
                JSON.stringify(choice) ===
                JSON.stringify(currentQuestion.answer);

              const isWrong =
                JSON.stringify(selectedChoice) ===
                  JSON.stringify(choice) &&
                !isCorrect;

              return (
                <button
                  key={choice + index}
                  className={`choice-container
                    ${showExplanation && isCorrect ? "correct" : ""}
                    ${showExplanation && isWrong ? "incorrect" : ""}
                  `}
                  onClick={() => handleAnswer(choice)}
                >
                  <span className="choice-prefix">
                    {index + 1}.
                  </span>
                  {Array.isArray(choice)
                    ? choice.join(" / ")
                    : choice}
                </button>
              );
            })}
          </div>

          {showExplanation && (
            <div className="grammar-explanation-box">
              <h3>
                {selectedChoice === currentQuestion.answer
                  ? "Correct!"
                  : `Incorrect! Correct answer ${currentQuestion.answer}`}
              </h3>
              <h3>{currentQuestion.explanation}</h3>

              <button className="btn" onClick={nextQuestion}>
                Next Question (Enter)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="game-over-screen">
          <h2>Game Over</h2>

          <p>Final Score: {score}</p>
          <p>Accuracy: {accuracy}%</p>
          <p>Questions Answered: {answeredQuestions}</p>

          <button
            className="btn"
            onClick={() => {
              setScore(0);
              setLives(3);
              setAnsweredQuestions(0);
              setCorrectQuestions(0);
              setGameOver(false);

              generateQuestion(questionPool);
            }}
          >
            Restart
          </button>
        </div>
      )}

      <button className="back-btn" onClick={onExit}>
        Back
      </button>
    </div>
  );
}