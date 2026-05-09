import { useEffect, useState, useRef, useCallback } from "react";

export default function KanjiGame({ setView, BASE_PATH }) {
  const [kanjiData, setKanjiData] = useState([]);
  const [remainingKanji, setRemainingKanji] = useState([]);
  const [currentKanji, setCurrentKanji] = useState(null);
  const [choices, setChoices] = useState([]);

  // Configuration from App.jsx
  const questionType = localStorage.getItem("questionType") || "kanji";
  const answerType = localStorage.getItem("answerType") || "reading";

  const [questionCounter, setQuestionCounter] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);
  const [totalQuestions, setTotalQuestions] = useState(0);

  // Modal state
  const [modalType, setModalType] = useState(null); // "examples" or "radicals"
  const [modalContent, setModalContent] = useState(null);

  const jlptLevel = localStorage.getItem("JLPT");
  const step = Number(localStorage.getItem("step"));
  const correctAudio = useRef(null);


  /* EFFECTS */
  // LOAD DATA
  useEffect(() => {
    const loadKanji = async () => {
      try {
        // Make sure BASE_PATH always ends with '/'
        const base = BASE_PATH.endsWith('/') ? BASE_PATH : BASE_PATH + '/';
        const url = `${base}Data/kanji_data_N${jlptLevel}.json`;
        
        console.log("Fetching kanji from:", url);

        const res = await fetch(url);
        
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        const levelData = data.levels[`Level ${step}`] || [];

        setKanjiData(levelData);
        setRemainingKanji([...levelData]);
        setTotalQuestions(levelData.length);

        setTimeout(() => nextQuestionInternal(levelData, [...levelData]), 10);
      } catch (error) {
        console.error("Failed to load kanji data:", error);
      }
    };

    loadKanji();
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

  const shuffle = (array) => [...array].sort(() => Math.random() - 0.5);

  // Helper: Get the display value for a given type
  const getField = (kanjiItem, type) => {
    if (!kanjiItem) return "";

    if (type === "kanji") return kanjiItem.kanji || "";
    if (type === "reading") {
      return `${kanjiItem.kunyomi.join("・")}\n${kanjiItem.onyomi.join("・")}`;
    }
    if (type === "translation") {
      return kanjiItem.translation?.join(", ") || "";
    }
    return "";
  };

  const nextQuestionInternal = (fullData, currentRemaining) => {
    if (currentRemaining.length === 0) {
      endGame(questionCounter, correctCount);
      return;
    }

    const randomIndex = Math.floor(Math.random() * currentRemaining.length);
    const kanji = currentRemaining[randomIndex];

    const correctAnswer = getField(kanji, answerType);

    // Generate 4 unique choices (1 correct + 3 wrong)
    const answers = new Set([correctAnswer]);
    while (answers.size < 4) {
      const randKanji = fullData[Math.floor(Math.random() * fullData.length)];
      const wrongAnswer = getField(randKanji, answerType);

      if (wrongAnswer && wrongAnswer !== correctAnswer) {
        answers.add(wrongAnswer);
      }
    }

    setChoices(shuffle([...answers]));
    setCurrentKanji(kanji);
    setRemainingKanji((prev) => prev.filter((_, i) => i !== randomIndex));

    setShowAnswer(false);
    setSelected(null);
    setModalType(null);
  };

  const nextQuestion = () => {
    nextQuestionInternal(kanjiData, remainingKanji);
  };

  const handleAnswer = (choice) => {
    if (showAnswer || !currentKanji) return;

    const correctAnswerText = getField(currentKanji, answerType);
    const isCorrect = choice === correctAnswerText;

    const newCorrectCount = isCorrect ? correctCount + 1 : correctCount;
    const newQuestionCounter = questionCounter + 1;

    if (isCorrect && correctAudio.current) {
      setTimeout(() => {
        if(currentKanji.kunyomi){
          speak(currentKanji.kunyomi[0]);
        }
        if(currentKanji.onyomi){
          speak(currentKanji.onyomi[0])
        }
      }, 500);
      correctAudio.current.pause();
      correctAudio.current.currentTime = 0;
      correctAudio.current.play().catch(() => {});
    }

    setCorrectCount(newCorrectCount);
    setQuestionCounter(newQuestionCounter);
    setSelected(choice);
    setShowAnswer(true);
  };

  const endGame = (finalQuestions, finalCorrect) => {
    alert(`Game Over!\n\nScore: ${finalCorrect} / ${finalQuestions}`);
    // You can improve this later with a proper results screen
    setView("home");
  };

  // Modal handlers
  const openExamples = () => {
    if (!currentKanji?.example_sentences) return;
    setModalContent(currentKanji.example_sentences);
    setModalType("examples");
  };

  const openRadicals = () => {
    if (!currentKanji?.radicals) return;
    setModalContent(currentKanji.radicals);
    setModalType("radicals");
  };

  const closeModal = () => {
    setModalType(null);
    setModalContent(null);
  };

  // Keyboard support
  const handleKeyDown = useCallback(
    (e) => {
      if (!currentKanji) return;

      const key = Number(e.key);

      if (!showAnswer && key >= 1 && key <= choices.length) {
        handleAnswer(choices[key - 1]);
      }

      if (showAnswer && (e.key === "Enter" || e.key === " ")) {
        if (modalType) {
          closeModal();
        } else {
          nextQuestion();
        }
      }

      if (e.key === "Escape" && modalType) {
        closeModal();
      }
    },
    [currentKanji, choices, showAnswer, modalType]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // What to show as the "question"
  const questionDisplay = currentKanji ? getField(currentKanji, questionType) : "";

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
                  width: totalQuestions > 0 ? `${(questionCounter / totalQuestions) * 100}%` : "0%",
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

        {/* Question Area */}
        <div className="top-bar">
          <h2 style={{
            fontSize: questionType === "kanji" ? "6rem" : "4rem" 
            }}>
            {questionDisplay || "Loading..."}
          </h2>
          <button className="next-btn" onClick={nextQuestion} disabled={!showAnswer}>
            →
          </button>
          <div className="extra-info">
            {/* Extra info shown only after answering */}
            {showAnswer && questionType !== "translation" && (
              <div className="translation">
                <h3>{currentKanji?.translation?.join(", ") || ""}</h3>
              </div>
            )}
            {/* Info Buttons (Examples & Radicals) - only after answering */}
            {showAnswer && (
              <div className="info-buttons" style={{ textAlign: "center", margin: "1rem 0" }}>
                <button onClick={openExamples} className="info-btn">
                  Example Sentences
                </button>
                <button onClick={openRadicals} className="info-btn" style={{ marginLeft: "1rem" }}>
                  Radicals
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Answer Choices */}
        <div className="answers">
          {choices.map((choice, i) => {
            let className = "choice-container";

            if (showAnswer) {
              const correctAnswerText = getField(currentKanji, answerType);
              if (choice === correctAnswerText) className += " correct";
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
                <p className="choice-text" style={{ whiteSpace: "pre-line" }}>
                  {choice}
                </p>
              </div>
            );
          })}
        </div>
      <button className="back-btn" onClick={() => setView({ screen: "home" })}>
        Back
      </button>
      </div>


      {/* Modal */}
      {modalType && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              ×
            </button>
            {modalType === "examples" && (
              <div>
                <h3>Example Sentences</h3>
                {Object.entries(modalContent || {}).map(([reading, sentences]) => (
                  <div key={reading} style={{ marginBottom: "1.5rem" }}>
                    <strong>Reading: {reading}</strong>
                    {sentences.map((ex, idx) => (
                      <div key={idx} style={{ marginTop: "0.8rem" }}>
                        <p dangerouslySetInnerHTML={{ __html: ex.sentence }} />
                        <p style={{ color: "#666", fontStyle: "italic" }}>
                          {ex.translation}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {modalType === "radicals" && (
              <div>
                <h3>Radicals</h3>
                <div style={{ fontSize: "2.5rem", margin: "1rem 0" }}>
                  {modalContent?.join(" ")}
                </div>
                <p>The radicals that make up this kanji.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <div className="flex-center flex-column">
      <h1>All Kanji Learned 🎉</h1>

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