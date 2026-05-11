import { useEffect, useState, useRef, useCallback } from "react";

export default function KanjiType({ setView, BASE_PATH }) {
  const [kanjiData, setKanjiData] = useState([]);
  const [remainingKanji, setRemainingKanji] = useState([]);
  const [currentKanji, setCurrentKanji] = useState(null);

  const [questionCounter, setQuestionCounter] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);

  const [input, setInput] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const [modalType, setModalType] = useState(null);
  const [modalContent, setModalContent] = useState(null);

  const questionType = localStorage.getItem("questionType") || "kanji";
  const answerType = localStorage.getItem("answerType") || "reading";

  const jlptLevel = localStorage.getItem("JLPT");
  const step = Number(localStorage.getItem("step"));
  const inputRef = useRef(null);

  const correctAudio = useRef(null);

  const winWidth = window.innerWidth;

  /* =========================
     LOAD DATA
  ========================= */

  useEffect(() => {
    const loadKanji = async () => {
      try {
        const base = BASE_PATH.endsWith("/")
          ? BASE_PATH
          : BASE_PATH + "/";

        const url = `${base}Data/kanji_data_N${jlptLevel}.json`;

        const res = await fetch(url);

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();

        const levelData = data.levels[`Level ${step}`] || [];

        setKanjiData(levelData);
        setRemainingKanji([...levelData]);
        setTotalQuestions(levelData.length);

        setTimeout(
          () => nextQuestionInternal(levelData, [...levelData]),
          10
        );
      } catch (err) {
        console.error(err);
      }
    };

    loadKanji();
  }, [BASE_PATH, jlptLevel, step]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentKanji]);

  /* =========================
     AUDIO
  ========================= */

  useEffect(() => {
    const audioPath = `${BASE_PATH}Audio/correct.wav`;

    correctAudio.current = new Audio(audioPath);

    return () => {
      if (correctAudio.current) {
        correctAudio.current.pause();
      }
    };
  }, [BASE_PATH]);

  function speak(text) {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "ja-JP";
    speechSynthesis.speak(utter);
  }

  /* =========================
     HELPERS
  ========================= */

  function kataToHira(str) {
    return str.replace(/[\u30a1-\u30f6]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) - 0x60)
    );
  }

  const getField = (kanjiItem, type) => {
    if (!kanjiItem) return "";

    if (type === "kanji") return kanjiItem.kanji || "";

    if (type === "reading") {
      return `${kanjiItem.kunyomi.join("・")}・${kanjiItem.onyomi.join("・")}`;
    }

    if (type === "translation") {
      return kanjiItem.translation?.join(", ") || "";
    }

    return "";
  };

  /* =========================
     QUESTIONS
  ========================= */

  const nextQuestionInternal = (fullData, currentRemaining) => {
    if (currentRemaining.length === 0) {
      endGame();
      return;
    }

    const randomIndex = Math.floor(
      Math.random() * currentRemaining.length
    );

    const kanji = currentRemaining[randomIndex];

    setCurrentKanji(kanji);

    setRemainingKanji((prev) =>
      prev.filter((_, i) => i !== randomIndex)
    );

    setInput("");
    setShowAnswer(false);
    setIsCorrect(false);

    setModalType(null);
  };

  const nextQuestion = () => {
    nextQuestionInternal(kanjiData, remainingKanji);
  };

  /* =========================
     ANSWERS
  ========================= */

  function validateAnswer() {
    if (!currentKanji) return false;

    const normalizedInput = kataToHira(
      input.trim().toLowerCase()
    );

    if (answerType === "kanji") {
      return input.trim() === currentKanji.kanji;
    }

    if (answerType === "translation") {
      return currentKanji.translation.some(
        (t) =>
          t.toLowerCase().trim() === normalizedInput
      );
    }

    if (answerType === "reading") {
      const normalizeReading = (str) =>
        kataToHira(str.toLowerCase())
          .replace(/\./g, "") // remove dots
          .trim();

      const normalized = normalizeReading(normalizedInput);

      const readings = [
        ...currentKanji.kunyomi,
        ...currentKanji.onyomi,
      ].flatMap((r) => {
        const clean = normalizeReading(r);

        // allow both versions:
        // なな.つ -> ななつ AND なな
        if (r.includes(".")) {
          return [
            clean,
            normalizeReading(r.split(".")[0]),
          ];
        }

        return [clean];
      });

      return readings.includes(normalized);
    }

    return false;
  }

  function submitAnswer() {
    if (showAnswer) return;

    const correct = validateAnswer();

    const newQuestionCounter = questionCounter + 1;

    setQuestionCounter(newQuestionCounter);

    if (correct) {
      setCorrectCount((prev) => prev + 1);

      if (correctAudio.current) {
        correctAudio.current.pause();
        correctAudio.current.currentTime = 0;
        correctAudio.current.play().catch(() => {});
      }

      if (currentKanji.kunyomi) {
        currentKanji.kunyomi.forEach((e) => speak(e));
      }

      if (currentKanji.onyomi) {
        currentKanji.onyomi.forEach((e) => speak(e));
      }
    }

    setIsCorrect(correct);
    setShowAnswer(true);
  }

  function endGame() {
    alert(
      `Game Over!\n\nScore: ${correctCount} / ${questionCounter}`
    );

    setView({ screen: "home" });
  }

  /* =========================
     MODALS
  ========================= */

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

  /* =========================
     KEYBOARD
  ========================= */

  const handleKeyDown = useCallback(
    (e) => {
      if (!currentKanji) return;

      if (!showAnswer && e.key === "Enter") {
        submitAnswer();
      }

      if (showAnswer && e.key === "Enter") {
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
    [showAnswer, modalType, currentKanji, input]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
  }, [handleKeyDown]);

  const questionDisplay = currentKanji
    ? getField(currentKanji, questionType)
    : "";

  return (
    <div className="flex-center flex-column">
      <div className="grid">
        {/* HUD */}

        <div className="hud">
          <div className="hud-item">
            <h3>
              N{jlptLevel} - Step: {step}
            </h3>
          </div>

          <div className="hud-item">
            <p className="hud-text">
              Question: {questionCounter} /{" "}
              {totalQuestions}
            </p>

            <div className="progress-bar">
              <div
                className="progress-bar-fill"
                style={{
                  width:
                    totalQuestions > 0
                      ? `${
                          (questionCounter /
                            totalQuestions) *
                          100
                        }%`
                      : "0%",
                }}
              />
            </div>
          </div>

          <div className="hud-item">
            <p className="hud-text">
              Accuracy:{" "}
              {questionCounter > 0
                ? (
                    (correctCount /
                      questionCounter) *
                    100
                  ).toFixed(2)
                : "0.00"}
              %
            </p>
          </div>
        </div>

        {/* QUESTION */}
        <div className="top-bar">
          <h2
            style={{
              fontSize:
                winWidth > 800
                  ? questionType === "kanji"
                    ? "6rem"
                    : "4rem"
                  : questionType === "kanji"
                  ? "4rem"
                  : "3rem",
              whiteSpace: "pre-line",
            }}
          >
            {questionDisplay || "Loading..."}
          </h2>
          {showAnswer && (
            <button
              className="next-btn"
              onClick={nextQuestion}
            >
              →
            </button>
          )}

          <div className="extra-info">
            {showAnswer &&
              questionType !==
                "translation" && (
                <div className="translation">
                  <h3>
                    {currentKanji?.translation?.join(
                      ", "
                    ) || ""}
                  </h3>
                </div>
              )}

            {showAnswer && (
            <div 
            style={{
                marginTop: "1rem",
                textAlign: "center",
            }}
            >
            <h3
                style={{
                color: isCorrect
                    ? "limegreen"
                    : "red",
                }}
            >
                {isCorrect
                ? "Correct!"
                : "Incorrect"}
            </h3>
            <h3>
                    {getField(
                    currentKanji,
                    answerType
                    )}
                </h3>
            </div>
        )}

            {showAnswer && (
              <div
                className="info-buttons"
                style={{
                  textAlign: "center",
                  margin: "1rem 0",
                }}
              >
                <button
                  onClick={openExamples}
                  className="info-btn"
                >
                  Example Sentences
                </button>

                <button
                  onClick={openRadicals}
                  className="info-btn"
                  style={{
                    marginLeft: "1rem",
                  }}
                >
                  Radicals
                </button>
              </div>
            )}
          </div>

        </div>
        <div className="typing-input">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={showAnswer}
          autoFocus
          />
        </div>
        <button
          className="back-btn"
          onClick={() =>
            setView({ screen: "home" })
          }
        >
          Back
        </button>
      </div>

      {/* MODAL */}

      {modalType && (
        <div
          className="modal-overlay"
          onClick={closeModal}
        >
          <div
            className="modal-content"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              className="modal-close"
              onClick={closeModal}
            >
              ×
            </button>

            {modalType === "examples" && (
              <div>
                <h3>Example Sentences</h3>

                {Object.entries(
                  modalContent || {}
                ).map(
                  ([reading, sentences]) => (
                    <div
                      key={reading}
                      style={{
                        marginBottom: "1.5rem",
                      }}
                    >
                      <strong>
                        Reading: {reading}
                      </strong>

                      {sentences.map(
                        (ex, idx) => (
                          <div
                            key={idx}
                            style={{
                              marginTop: "0.8rem",
                            }}
                          >
                            <p
                              dangerouslySetInnerHTML={{
                                __html:
                                  ex.sentence,
                              }}
                            />

                            <p
                              style={{
                                color: "#666",
                                fontStyle:
                                  "italic",
                              }}
                            >
                              {
                                ex.translation
                              }
                            </p>
                          </div>
                        )
                      )}
                    </div>
                  )
                )}
              </div>
            )}

            {modalType === "radicals" && (
              <div>
                <h3>Radicals</h3>

                <div
                  style={{
                    fontSize: "2.5rem",
                    margin: "1rem 0",
                  }}
                >
                  {modalContent?.join(" ")}
                </div>

                <p>
                  The radicals that make up
                  this kanji.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}