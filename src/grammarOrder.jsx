import { useEffect, useState } from "react";

export default function GrammarOrder({
  level,
  difficulty,
  selectedGrammar,
  onExit,
  BASE_PATH,
}) {
  const [exercisePool, setExercisePool] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slots, setSlots] = useState([null, null, null, null]);
  const [usedChoices, setUsedChoices] = useState([]);
  const [result, setResult] = useState("");
  const [showHint, setShowHint] = useState(false);

/* EFFECTS */
  useEffect(() => {
    fetch(`${BASE_PATH}Data/grammarOrder.json`)
      .then((res) => {
        return res.json();
        })
      .then((data) => {
        console.log("LEVEL:", level);
        const levelData = data?.[level];
        if (!levelData) return;
        const combined = [
        ...(levelData.beginner || []),
        ...(levelData.intermediate || []),
        ...(levelData.advanced || []),
        ];

        const grammarExercises = combined.filter((ex) =>
        selectedGrammar.includes(ex.id)
        );

        setExercisePool(grammarExercises);
      });
  }, [level, difficulty, selectedGrammar, BASE_PATH]);
    
    useEffect(() => {
        setCurrentIndex(0);
        setSlots([null, null, null, null]);
        setUsedChoices([]);
        setResult("");
    }, [selectedGrammar, level, difficulty]);


  const currentExercise = exercisePool[currentIndex];

  const playSound = (type) => {
    const audio = new Audio(
      `${BASE_PATH}/sounds/${type}.mp3`
    );

    audio.play();
  };

  const handleChoiceClick = (choice) => {
    const firstEmpty = slots.findIndex((slot) => slot === null);

    if (firstEmpty === -1) return;

    const updatedSlots = [...slots];
    updatedSlots[firstEmpty] = choice;

    setSlots(updatedSlots);
    setUsedChoices([...usedChoices, choice]);
  };

  const handleSlotClick = (index) => {
    if (!slots[index]) return;

    const removedChoice = slots[index];

    const updatedSlots = [...slots];
    updatedSlots[index] = null;

    setSlots(updatedSlots);

    setUsedChoices(
      usedChoices.filter((choice, i) => {
        return !(
          choice === removedChoice &&
          i === usedChoices.indexOf(removedChoice)
        );
      })
    );
  };

  const handleDragStart = (e, choice) => {
    e.dataTransfer.setData("choice", choice);
  };

  const handleDrop = (e, index) => {
    e.preventDefault();

    if (slots[index]) return;

    const choice = e.dataTransfer.getData("choice");

    const updatedSlots = [...slots];
    updatedSlots[index] = choice;

    setSlots(updatedSlots);
    setUsedChoices([...usedChoices, choice]);
  };

  const checkAnswer = () => {
    if (!currentExercise) return;

    const correct =
      JSON.stringify(slots) ===
      JSON.stringify(currentExercise.answer);

    if (correct) {
      playSound("correct");
      setResult("Correct!");

      setTimeout(() => {
        const nextIndex = currentIndex + 1;

        if (nextIndex >= exercisePool.length) {
          setCurrentIndex(0);
        } else {
          setCurrentIndex(nextIndex);
        }

        setSlots([null, null, null, null]);
        setUsedChoices([]);
        setResult("");
      }, 1000);
    } else {
      playSound("wrong");
      setResult(`Wrong! Correct order: ${currentExercise.answer}`);
    }
  };

  if (!exercisePool.length) {
    return (
        <div className="flex-column flex-center">
        <button onClick={onExit}>Back</button>
        <p>No exercises found.</p>
        </div>
    );
    }

    if (!currentExercise) return null;

    const sentenceParts =
    currentExercise.sentence.split("____");

    const availableChoices = currentExercise.choices.filter(
    (choice, index) => {
      const usedCount = usedChoices.filter(
        (used) => used === choice
      ).length;

      const totalCount = currentExercise.choices.filter(
        (c) => c === choice
      ).length;

      return usedCount < totalCount;
    }
  );

  return (
    <div className="flex-column flex-center">
      {/* <h2>{currentExercise.grammar}</h2> */}
      {/* <p>{currentExercise.prompt}</p> */}

        <div className="hint-section">
            <button
                className="btn"
                onClick={() => setShowHint((prev) => !prev)}
            >
                {showHint ? "Hide Translation" : "Show Translation"}
            </button>

            {showHint && (
                <div className="grammar-translation">
                {currentExercise.translation}
                </div>
            )}
        </div>

            <div className="sentence-preview">
              {sentenceParts.map((part, index) => (
                <span key={index}>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: part,
                    }}
                  />

                  {index < slots.length && (
                    <span
                      className="inline-slot"
                      onClick={() => handleSlotClick(index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onDragOver={(e) => e.preventDefault()}
                    >
                      {slots[index] || "＿＿"}
                    </span>
                  )}
                </span>
              ))}
            </div>
      

      <div className="answers">
        {availableChoices.map((choice, index) => (
          <button
            key={`${choice}-${index}`}
            className="choice-button"
            draggable
            onDragStart={(e) =>
              handleDragStart(e, choice)
            }
            onClick={() => handleChoiceClick(choice)}
          >
            {choice}
          </button>
        ))}
      </div>

      <button
        className="btn"
        onClick={checkAnswer}
      >
        Submit
      </button>

      {result && (
        <div className="grammar-result">
          {result}
        </div>
      )}
      <button className="back-btn" onClick={onExit}>
        Back
      </button>
    </div>
  );
}