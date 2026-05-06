import { useEffect, useState, useRef, useCallback } from "react";

export default function KanjiLearn({ setView, BASE_PATH }) {
  const MODES = {
    INTRO: "intro",
    QUIZ: "quiz",
    COMPLETE: "complete",
  };

  const BATCH_SIZE = 2;

  const [isLoading, setIsLoading] = useState(true);
  const [mode, setMode] = useState(MODES.INTRO);

  const [kanjiData, setKanjiData] = useState([]);
  const [kanjiToLearn, setKanjiToLearn] = useState([]);
  const [reviewPool, setReviewPool] = useState([]);

  const [introducedCount, setIntroducedCount] = useState(0);
  const [cycleQueue, setCycleQueue] = useState([]);

  const [currentKanji, setCurrentKanji] = useState(null);
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
    setKanjiToLearn([...kanjiData]);
    setReviewPool([]);
    setCycleQueue([]);
    setIntroducedCount(0);
    setSeenCount({});
    setCurrentKanji(null);
    setChoices([{ label: formatReading(kanji), value: kanji.kanji }]);
    setShowAnswer(false);
    setSelected(null);
  };

  /* ---------------- LOAD ---------------- */
  useEffect(() => {
    const loadKanji = async () => {
      try {
        const base = BASE_PATH.endsWith("/") ? BASE_PATH : BASE_PATH + "/";
        const res = await fetch(`${base}Data/kanji_data_N${jlptLevel}.json`);
        const data = await res.json();

        const levelData = data.levels[`Level ${step}`] || [];
        setKanjiData(levelData);
        setKanjiToLearn([...levelData]);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadKanji();
  }, [BASE_PATH, jlptLevel, step]);

  useEffect(() => {
    correctAudio.current = new Audio(`${BASE_PATH}Audio/correct.wav`);
  }, [BASE_PATH]);

  const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

  /* ---------------- QUIZ FUNCTIONS ---------------- */
  const formatReading = (kanji) => {
    const on = kanji.onyomi?.join(", ");
    const kun = kanji.kunyomi?.join(", ");
    

    return (
      <>
        <div>{kun}</div>
        <div>{on}</div>
      </>
    );
  };

  const generateChoices = useCallback((correctKanji) => {
    const answers = [
      {
        label: formatReading(correctKanji),
        value: correctKanji.kanji,
      },
    ];

    while (answers.length < 4) {
      const rand = kanjiData[Math.floor(Math.random() * kanjiData.length)];

      if (!answers.find(a => a.value === rand.kanji)) {
        answers.push({
          label: formatReading(rand),
          value: rand.kanji,
        });
      }
    }

    setChoices(shuffle(answers));
  }, [kanjiData]);

  const nextQuestion = useCallback((queueOverride = null) => {
    const queue = queueOverride ?? cycleQueue;

    if (!queue || queue.length === 0) {
      const isDone = kanjiToLearn.length === 0 && reviewPool.length === 0;

      if (isDone) {
        setCurrentKanji(null);
        setMode(MODES.COMPLETE);
      } else {
        setCurrentKanji(null);
        setMode(MODES.INTRO);
        setIntroducedCount(0);
      }

      return;
    }

    const [next, ...rest] = queue;

    setCycleQueue(rest);
    setCurrentKanji(next);
    generateChoices(next);

    setShowAnswer(false);
    setSelected(null);
  }, [cycleQueue, kanjiToLearn.length, reviewPool.length, generateChoices]);

  /* ---------------- INTRO ---------------- */
  const handleIntroduceNext = useCallback(() => {
    if (isTransitioning || kanjiToLearn.length === 0) {
      if (kanjiToLearn.length === 0) setMode(MODES.COMPLETE);
      return;
    }

    setIsTransitioning(true);

    setKanjiToLearn((prevToLearn) => {
      if (prevToLearn.length === 0) {
        setIsTransitioning(false);
        return prevToLearn;
      }

      const nextKanji = prevToLearn[0];
      const newToLearn = prevToLearn.slice(1);

      setReviewPool((prevReview) => [...prevReview, nextKanji]);

      setIntroducedCount((prevCount) => {
        const newCount = prevCount + 1;

        if (newCount < BATCH_SIZE) {
          setIsTransitioning(false);
          return newCount;
        } else {
          // Start quiz
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
  }, [kanjiToLearn.length, BATCH_SIZE, isTransitioning, nextQuestion]);

  /* ---------------- ANSWER ---------------- */
  const handleAnswer = useCallback((choice) => {
    if (showAnswer || !currentKanji) return;

    const isCorrect = choice.value === currentKanji.kanji;
    const correctText = formatReading(currentKanji);

    if (isCorrect && correctAudio.current) {
      correctAudio.current.currentTime = 0;
      correctAudio.current.play().catch(() => {});
    }

    const key = currentKanji.kanji;

    setSeenCount((prev) => {
      const count = (prev[key] || 0) + 1;

      if (count >= 4) {
        setReviewPool((pool) => pool.filter((k) => k.kanji !== key));
        setCycleQueue((q) => q.filter((k) => k.kanji !== key));
      }

      return { ...prev, [key]: count };
    });

    setSelected(choice);
    setShowAnswer(true);
  }, [showAnswer, currentKanji]);

  const skipKanji = useCallback(() => {
    if (!currentKanji) return;

    const key = currentKanji.kanji;

    setReviewPool((pool) => pool.filter((k) => k.kanji !== key));
    setCycleQueue((q) => q.filter((k) => k.kanji !== key));

    nextQuestion();
  }, [currentKanji, nextQuestion]);

  /* ---------------- KEYBOARD ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (e.repeat) return;

      if (mode === MODES.INTRO) {
        if (e.key === "Enter") handleIntroduceNext();
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
    return () => window.removeEventListener("keydown", handler);
  }, [mode, showAnswer, choices, handleIntroduceNext, handleAnswer, nextQuestion]);

  /* ---------------- UI ---------------- */
  if (isLoading) {
    return (
      <div className="flex-center flex-column">
        <h1>Loading Kanji...</h1>
        <button className="btn" onClick={() => {resetSession(); setView("home");}}>Back</button>
      </div>
    );
  }

  const currentIntroKanji = kanjiToLearn[0];

  if (mode === MODES.INTRO && currentIntroKanji) {
    return (
      <div className="learn-container">
        <div className="kanji-next">
          <h1>Kanji: {currentIntroKanji.kanji}</h1>
          <button
            className="next-btn"
            onClick={handleIntroduceNext}
            disabled={isTransitioning}
          >
            →
          </button>
        </div>
        <div className="onyomi-remove">
          <h2>Japanese reading: {currentIntroKanji.kunyomi.join(", ")}</h2>
        </div>
        <h2 className="chinese-reading">
          Chinese reading: {currentIntroKanji.onyomi.join(", ")}
        </h2>
        <h2 className="translation">
          English: {currentIntroKanji.translation.join(", ")}
        </h2>
        <h3 className="translation">
          Uses: {currentIntroKanji.vocabulary.join(", ")}
        </h3>
        <button className="back-btn" onClick={() => setView({ screen: "home" })}>Back</button>
      </div>
      
    );
  }

  if (mode === MODES.QUIZ) {
    if (!currentKanji) return null;
    return (
      <div className="flex-center flex-column">
        <div className="grid">
          <div className="top-bar">
            <h2 style={{ fontSize: "5rem" }}>{currentKanji.kanji}</h2>
            <button className="next-btn" onClick={() => nextQuestion()}>→</button>
            <button className="skip-btn" onClick={skipKanji}>−</button>
          </div>

          <div className="extra-info">
            {showAnswer && (
              <div className="translation">
                <h3>{currentKanji.translation.join(", ")}</h3>
              </div>
            )}
          </div>

          <div className="answers">
            {choices.map((c, i) => {
              let className = "choice-container";

              if (showAnswer) {
                if (c.value === currentKanji.kanji) className += " correct";
                else if (c.value === selected?.value) className += " incorrect";
              }

              return (
                <div
                  key={i}
                  className={className}
                  onClick={() => !showAnswer && handleAnswer(c)}
                >
                  <p className="choice-prefix">{i + 1}</p>
                  <div className="choice-text">{c.label}</div>
                </div>
              );
            })}
          </div>
        </div>
            <button className="btn" onClick={() => setView({ screen: "home" })}>Back</button>
      </div>
    );
  }

  return (
    <div className="flex-center flex-column">
      <h1>All Kanji Learned 🎉</h1>
      <button
        className="back-btn"
        onClick={() => {resetSession(); setView({ screen: "home" });}}
      >
        Back
      </button>
    </div>
  );
}