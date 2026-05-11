import { useEffect, useState, useRef, useCallback } from "react";

export default function VocabLearn({ setView, BASE_PATH }) {
  const MODES = {
    INTRO: "intro",
    QUIZ: "quiz",
    COMPLETE: "complete",
  };

  const BATCH_SIZE = 4;

  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState(MODES.INTRO);

  const [vocabData, setVocabData] = useState([]);
  const [vocabToLearn, setVocabToLearn] = useState([]);
  const [reviewPool, setReviewPool] = useState([]);

  const [introducedCount, setIntroducedCount] = useState(0);
  const [cycleQueue, setCycleQueue] = useState([]);

  const [currentVocab, setCurrentVocab] = useState(null);
  const [choices, setChoices] = useState([]);

  const [seenCount, setSeenCount] = useState({});
  const [showAnswer, setShowAnswer] = useState(false);
  const [selected, setSelected] = useState(null);

  const [isTransitioning, setIsTransitioning] = useState(false);

  const jlptLevel = localStorage.getItem("JLPT");
  const step = Number(localStorage.getItem("step"));

  const correctAudio = useRef(null);

  const resetSession = () => {
    setMode(MODES.INTRO);
    setVocabToLearn([...vocabData]);
    setReviewPool([]);
    setCycleQueue([]);
    setIntroducedCount(0);
    setSeenCount({});
    setCurrentVocab(null);
    setChoices([]);
    setShowAnswer(false);
    setSelected(null);
  };

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    const loadVocab = async () => {
      try {
        const base = BASE_PATH.endsWith("/") ? BASE_PATH : BASE_PATH + "/";
        const res = await fetch(`${base}Data/Vocab_data_N${jlptLevel}.json`);
        const data = await res.json();

        const levelData = data.units[`unit ${step}`] || [];

        setVocabData(levelData);
        setVocabToLearn([...levelData]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVocab();
  }, [BASE_PATH, jlptLevel, step]);

  useEffect(() => {
    correctAudio.current = new Audio(`${BASE_PATH}Audio/correct.wav`);
  }, [BASE_PATH]);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  /* ---------------- HELPERS ---------------- */
  const stripRuby = (html) => {
    return html
    // Replace ruby blocks with only their reading
    .replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, "$2")

    // Remove any remaining HTML
    .replace(/<[^>]+>/g, "")

    // Remove romaji in parentheses
    .replace(/\([^)]*\)/g, "")

    // Clean spaces
    .replace(/\s+/g, " ")
    .trim();
  };

  function speak(text) {
    const clean = stripRuby(text).replace(/\|/g, "");

    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = "ja-JP";

    speechSynthesis.cancel();
    speechSynthesis.speak(utter);
  }

  /* ---------------- QUIZ FUNCTIONS ---------------- */
  const generateChoices = useCallback((correctVocab) => {
    const answers = [
      {
        label: correctVocab.english,
        value: correctVocab.japanese,
      },
    ];

    while (answers.length < 4) {
      const rand = vocabData[Math.floor(Math.random() * vocabData.length)];

      if (!answers.find(a => a.value === rand.japanese)) {
        answers.push({
          label: rand.english,
          value: rand.japanese,
        });
      }
    }

    setChoices(shuffle(answers));
  }, [vocabData]);

  const nextQuestion = useCallback((queueOverride = null) => {
    const queue = queueOverride ?? cycleQueue;

    if (!queue || queue.length === 0) {
      const isDone =
        vocabToLearn.length === 0 &&
        reviewPool.length === 0;

      if (isDone) {
        setCurrentVocab(null);
        setMode(MODES.COMPLETE);
      } else {
        setCurrentVocab(null);
        setMode(MODES.INTRO);
        setIntroducedCount(0);
      }

      return;
    }

    const [next, ...rest] = queue;

    setCycleQueue(rest);
    setCurrentVocab(next);
    generateChoices(next);

    setShowAnswer(false);
    setSelected(null);
  }, [
    cycleQueue,
    vocabToLearn.length,
    reviewPool.length,
    generateChoices,
  ]);

  /* ---------------- INTRO ---------------- */
  const handleIntroduceNext = useCallback(() => {
    if (isTransitioning || vocabToLearn.length === 0) {
      if (vocabToLearn.length === 0) {
        setMode(MODES.COMPLETE);
      }

      return;
    }

    setIsTransitioning(true);

    setVocabToLearn((prevToLearn) => {
      if (prevToLearn.length === 0) {
        setIsTransitioning(false);
        return prevToLearn;
      }

      const nextVocab = prevToLearn[0];
      const newToLearn = prevToLearn.slice(1);

      setReviewPool((prevReview) => [...prevReview, nextVocab]);

      setIntroducedCount((prevCount) => {
        const newCount = prevCount + 1;

        if (newCount < BATCH_SIZE) {
          setIsTransitioning(false);
          return newCount;
        } else {
          setReviewPool((latestReview) => {
            const queue = shuffle([...latestReview]);

            setCycleQueue(queue);
            setMode(MODES.QUIZ);

            nextQuestion(queue);

            setIsTransitioning(false);

            return latestReview;
          });

          return 0;
        }
      });

      return newToLearn;
    });
  }, [
    vocabToLearn.length,
    isTransitioning,
    nextQuestion,
  ]);

  /* ---------------- ANSWER ---------------- */
  const handleAnswer = useCallback((choice) => {
    if (showAnswer || !currentVocab) return;

    const isCorrect =
      choice.value === currentVocab.japanese;

    if (isCorrect && correctAudio.current) {
      correctAudio.current.currentTime = 0;

      correctAudio.current.play().catch(() => {});

      setTimeout(() => {
        speak(currentVocab.japanese);
      }, 500);
    }

    const key = currentVocab.japanese;

    setSeenCount((prev) => {
      const count = (prev[key] || 0) + 1;

      if (count >= 4) {
        setReviewPool((pool) =>
          pool.filter((v) => v.japanese !== key)
        );

        setCycleQueue((q) =>
          q.filter((v) => v.japanese !== key)
        );
      }

      return { ...prev, [key]: count };
    });

    setSelected(choice);
    setShowAnswer(true);
  }, [showAnswer, currentVocab]);

  const skipVocab = useCallback(() => {
    if (!currentVocab) return;

    const key = currentVocab.japanese;

    setReviewPool((pool) =>
      pool.filter((v) => v.japanese !== key)
    );

    setCycleQueue((q) =>
      q.filter((v) => v.japanese !== key)
    );

    nextQuestion();
  }, [currentVocab, nextQuestion]);

  /* ---------------- KEYBOARD ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.repeat) return;

      if (mode === MODES.INTRO) {
        if (e.key === "Enter") {
          handleIntroduceNext();
        }

        return;
      }

      if (mode !== MODES.QUIZ) return;

      const num = Number(e.key);

      if (!showAnswer && num >= 1 && num <= choices.length) {
        handleAnswer(choices[num - 1]);
      } else if (showAnswer && e.key === "Enter") {
        nextQuestion();
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [
    mode,
    showAnswer,
    choices,
    handleIntroduceNext,
    handleAnswer,
    nextQuestion,
  ]);

  /* ---------------- UI ---------------- */
  if (isLoading) {
    return (
      <div className="flex-center flex-column">
        <h1>Loading Vocabulary...</h1>

        <button
          className="btn"
          onClick={() => {
            resetSession();
            setView({ screen: "home" });
          }}
        >
          Back
        </button>
      </div>
    );
  }

  const currentIntroVocab = vocabToLearn[0];

  if (mode === MODES.INTRO && currentIntroVocab) {
    return (
      <div className="learn-container">
        <h3>N{jlptLevel} - Step: {step}</h3>
        <div className="kanji-next">
          <h1
            dangerouslySetInnerHTML={{
              __html: currentIntroVocab.japanese,
            }}
          />

          <button
            className="next-btn"
            onClick={handleIntroduceNext}
            disabled={isTransitioning}
          >
            →
          </button>
        </div>

        <div className="kunyomi">
          <button
            className="audio-btn"
            onClick={() =>
              speak(currentIntroVocab.japanese)
            }
          >
            🔊
          </button>
        </div>

        <h2 className="translation">
          {currentIntroVocab.english}
        </h2>

        {currentIntroVocab.example && (
          <div className="translation">
            <h3
              dangerouslySetInnerHTML={{
                __html: currentIntroVocab.example,
              }}
            />
          </div>
        )}

        <button
          className="back-btn"
          onClick={() =>
            setView({ screen: "home" })
          }
        >
          Back
        </button>
      </div>
    );
  }

  if (mode === MODES.QUIZ) {
    if (!currentVocab) return null;

    return (
      <div className="flex-center flex-column">
        <div className="grid">
          <div className="top-bar">
            <h2
              style={{ fontSize: "4rem" }}
              dangerouslySetInnerHTML={{
                __html: currentVocab.japanese,
              }}
            />

            <button
              className="next-btn"
              onClick={() => nextQuestion()}
            >
              →
            </button>

            <button 
              className="skip-btn"
              onClick={skipVocab}
              title="remove from review"
            >
              −
            </button>
          </div>

          <div className="extra-info">
            {showAnswer && (
              <div className="translation">
                <h3>{currentVocab.english}</h3>
              </div>
            )}
          </div>

          <div className="answers">
            {choices.map((c, i) => {
              let className = "choice-container";

              if (showAnswer) {
                if (
                  c.value === currentVocab.japanese
                ) {
                  className += " correct";
                } else if (
                  c.value === selected?.value
                ) {
                  className += " incorrect";
                }
              }

              return (
                <div
                  key={i}
                  className={className}
                  onClick={() =>
                    !showAnswer &&
                    handleAnswer(c)
                  }
                >
                  <p className="choice-prefix">
                    {i + 1}
                  </p>

                  <div className="choice-text">
                    {c.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          className="btn"
          onClick={() =>
            setView({ screen: "home" })
          }
        >
          Back
        </button>
      </div>
    );
  }

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
  );
}