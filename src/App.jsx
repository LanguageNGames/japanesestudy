import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./footer.jsx";
import "./style.css";
import "./game.css";
import KanaSelect from "./kanaSelect.jsx";
import KanaGame from "./kanaGame.jsx"
import KanjiGame from "./kanjiGame.jsx";
import VocabGame from "./vocabGame.jsx";
import ConjugationSelect from "./conjugationSelect.jsx";
import ConjugationGame from "./conjugationGame.jsx";
import ConjugationWheel from "./conjugationWheel.jsx";
import GrammarSelect from "./grammarSelect.jsx";
import GrammarFillBlanks from "./grammarFillBlanks.jsx";
import GrammarOrder from "./grammarOrder.jsx";
import KanjiLearn from "./kanjiLearn.jsx";
import VocabLearn from "./vocabLearn.jsx"
import NumberGame from "./numberGame.jsx";


export default function App() {
  const [view, setView] = useState({screen: "home"});
  const [steps, setSteps] = useState([]);
  const [title, setTitle] = useState("Choose sublevel");
  const [gameMode, setGameMode] = useState(null);
  const [kanaPool, setKanaPool] = useState([]);
  const [conjugationPool, setConjugationPool] = useState([]);
  const [grammarConfig, setGrammarConfig] = useState({level: null, difficulty: null, grammar: null,});

  // Kanji Game radio configuration
  const [questionType, setQuestionType] = useState("kanji");
  const [answerType, setAnswerType] = useState("reading");
  const isValidConfig = questionType !== answerType;
  const canStart = gameMode === "kanji" ? isValidConfig : true;

  const BASE_PATH = import.meta.env.BASE_URL;
  

  const loadKanji = async (jlpt) => {
    try {
      const res = await fetch(`${BASE_PATH}Data/kanji_data_N${jlpt}.json`);
      const data = await res.json();
      const levels = Object.keys(data.levels);
      setSteps(levels);
    } catch (err) {
      console.error(err);
    }
  };

  const loadVocab = async (jlpt) => {
    try {
      const res = await fetch(`${BASE_PATH}Data/Vocab_data_N${jlpt}.json`);
      const data = await res.json();
      const levels = Object.keys(data.units);
      setSteps(levels);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStepClick = (step) => {
    // Pass the configuration to localStorage so KanjiGame can read it
    localStorage.setItem("questionType", questionType);
    localStorage.setItem("answerType", answerType);

    localStorage.setItem("step", step);
    setView({ screen: "game" });
  };

  return (
    <>
      <Header setView={setView}/>

      <div className="main-container">
        {/* HOME */}
        {view.screen === "home" && (
          <div className="flex-center flex-column">
            <h1>Japanese Quiz</h1>

          <div className="main-grid">
            <h3>Learn</h3>
            <h3>Practice</h3>
            <h3>Miscellaneous</h3>
            {/* LEARN */}
            <div className="learn-column">
              <div className="btn" onClick={() => setView({ screen: "kanjiLearn"})}>
              Learn Kanji
              </div>

              <div className="btn" onClick={() => setView({ screen: "vocabLearn"})}>
              Learn Vocabulary
              </div>

            </div>

            {/* PRACTICE */}
            <div className="learn-column">
              <div className="btn" onClick={() => setView({ screen: "kana" })}>
                Hiragana & Katakana
              </div>

              <div className="btn" onClick={() => setView({ screen: "numbers" })}>
                Practice Numbers
              </div>

              <div className="btn" onClick={() => setView({ screen: "kanji"})}>
                Practice Kanji
              </div>

              <div className="btn" onClick={() => setView({ screen: "vocab"})}>
                Practice Vocabulary
              </div>

              <div className="btn" onClick={() => setView({ screen: "grammar"})}>
                Grammar
              </div>

              <div className="btn" onClick={() => setView({ screen: "conjugation"})}>
                Conjugation
              </div>
            </div>
            <div className="miscelaneous">
              <div className="btn" onClick={() => setView({ screen: "conjugationWheel"})}>
                Conjugation Wheel
              </div>
              <div disabled className="btn">
                High Scores
              </div>
            </div>
          </div>
           
        </div>
        )}

        {/* KANA */}
        {view.screen === "kana" && (
          <KanaSelect
            setView={setView}
            setKanaPool={setKanaPool}
            setGameMode={setGameMode}
          />
        )}

        {/* NUMBERS */}
        {view.screen === "numbers" && (
          <NumberGame
            setView={setView}
            setKanaPool={setKanaPool}
            setGameMode={setGameMode}
          />
        )}

        {/* KANJI LEVEL */}
        {view.screen === "kanji" && (
          <div className="flex-center flex-column">
            <h1>Kanji Level</h1>

            {/* Question & Answer Type Selection */}
            <div className="config-section">
                <label><strong>Question shows:</strong></label>
                <div className="config-radio">
                <label>
                  <input
                    type="radio"
                    name="questionType"
                    value="kanji"
                    checked={questionType === "kanji"}
                    onChange={(e) => setQuestionType(e.target.value)}
                  />
                  Kanji
                </label>
                <label>
                  <input
                    type="radio"
                    name="questionType"
                    value="reading"
                    checked={questionType === "reading"}
                    onChange={(e) => setQuestionType(e.target.value)}
                  />
                  Reading
                </label>
                <label>
                  <input
                    type="radio"
                    name="questionType"
                    value="translation"
                    checked={questionType === "translation"}
                    onChange={(e) => setQuestionType(e.target.value)}
                  />
                  Translation
                </label>
                </div>

                <label><strong>Answer options are:</strong></label>
                <div className="config-radio">
                <label>
                  <input
                    type="radio"
                    name="answerType"
                    value="kanji"
                    checked={answerType === "kanji"}
                    onChange={(e) => setAnswerType(e.target.value)}
                  />
                  Kanji
                </label>
                <label>
                  <input
                    type="radio"
                    name="answerType"
                    value="reading"
                    checked={answerType === "reading"}
                    onChange={(e) => setAnswerType(e.target.value)}
                  />
                  Reading
                </label>
                <label>
                  <input
                    type="radio"
                    name="answerType"
                    value="translation"
                    checked={answerType === "translation"}
                    onChange={(e) => setAnswerType(e.target.value)}
                  />
                  Translation
                </label>
                </div>

              {!isValidConfig && (
                <p className="error-msg">Question and Answer types cannot be the same!</p>
              )}
            </div>
            {/* ============================================ */}

            {[5, 4, 3, 2, 1].map((lvl) => (
              <div
                key={lvl}
                className="btn"
                onClick={() => {
                  localStorage.setItem("JLPT", lvl);
                  setTitle(`Choose N${lvl} sublevel`);
                  loadKanji(lvl);
                  setGameMode("kanji");
                  setView({ screen: "steps" });
                }}
              >
                N{lvl}
              </div>
            ))}

            <button className="btn" onClick={() => setView({ screen: "home" })}>
              Back
            </button>
          </div>
        )}

        {/* KANJI LEARN LEVEL */}
        {view.screen === "kanjiLearn" && (
          <div className="flex-center flex-column">
            <h1>Kanji Level</h1>
            {[5, 4, 3, 2, 1].map((lvl) => (
              <div
                key={lvl}
                className="btn"
                onClick={() => {
                  localStorage.setItem("JLPT", lvl);
                  setTitle(`Choose N${lvl} sublevel`);
                  loadKanji(lvl);
                  setGameMode("kanjiLearn");
                  setView({ screen: "steps" });
                }}
              >
                N{lvl}
              </div>
            ))}

            <button className="btn" onClick={() => setView({ screen: "home" })}>
              Back
            </button>
          </div>
        )}

        {/* VOCAB LEVEL */}
        {view.screen === "vocab" && (
          <div className="flex-center flex-column vocab-level">
            <h1>Vocabulary Level</h1>

            {[5, 4, 3, 2, 1].map((lvl) => (
              <div
                key={lvl}
                className="btn"
                onClick={() => {
                  localStorage.setItem("JLPT", lvl);
                  setTitle(`Choose N${lvl} sublevel`);
                  loadVocab(lvl);
                  setGameMode("vocab");
                  setView({ screen: "steps" });
                }}
              >
                N{lvl}
              </div>
            ))}

            <button className="btn" onClick={() => setView({ screen: "home" })}>
              Back
            </button>
          </div>
        )}

        {/* VOCAB LEARN LEVEL */}
        {view.screen === "vocabLearn" && (
          <div className="flex-center flex-column vocab-level">
            <h1>Vocabulary Level</h1>

            {[5, 4, 3, 2, 1].map((lvl) => (
              <div
                key={lvl}
                className="btn"
                onClick={() => {
                  localStorage.setItem("JLPT", lvl);
                  setTitle(`Choose N${lvl} sublevel`);
                  loadVocab(lvl);
                  setGameMode("vocabLearn");
                  setView({ screen: "steps" });
                }}
              >
                N{lvl}
              </div>
            ))}

            <button className="btn" onClick={() => setView({ screen: "home" })}>
              Back
            </button>
          </div>
        )}

        {/* CONJUGATION */}
        {view.screen === "conjugation" && (
          <ConjugationSelect
            setView={setView}
            setConjugationPool={setConjugationPool}
            setGameMode={setGameMode}
          />
        )}

        {/* STEPS */}
        {view.screen === "steps" && (
          <div className="flex-center flex-column">
            <h1>{title}</h1>

            <div className="sub-container">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`btn ${!canStart ? "disabled" : ""}`}
                  onClick={() => canStart && handleStepClick(i + 1)}
                  style={{
                    pointerEvents: canStart ? "auto" : "none",
                    opacity: canStart ? 1 : 0.6,
                  }}
                >
                  Step {i + 1}
                  <div className="completion-bar">
                    <div className="completion-bar-fill"></div>
                  </div>
                </div>
              ))}
            </div>

            <button className="btn" onClick={() => {
              if (gameMode === "kanji") {
                setView({ screen: "kanji" });
              } else if (gameMode === "vocab") {
                setView({ screen: "vocab" });
              } else if (gameMode === "kanjiLearn"){
                setView({ screen: "kanjiLearn" });
              } else if (gameMode === "vocabLearn"){
                setView({ screen: "vocabLearn" });
              }}}>
              Back
            </button>
          </div>
        )}

        {/* GAME */}
        {view.screen === "kanaGame" && (
          <KanaGame
            mode={gameMode}
            kanaPool={kanaPool}
            BASE_PATH={BASE_PATH}
            onExit={() => setView({ screen: "kana" })}
          />
        )}

        {view.screen === "game" && gameMode === "kanji" && (
          <KanjiGame
            key="kanji"
            setView={setView}
            BASE_PATH={BASE_PATH}
            onExit={() => setView({ screen: "home" })}
          />)}


        {view.screen === "game" && gameMode === "kanjiLearn" && (
          <KanjiLearn
            key="kanjiLearn"
            setView={setView}
            BASE_PATH={BASE_PATH}
            onExit={() => setView({ screen: "home" })}
          />)}

        {view.screen === "game" && gameMode === "vocab" && (
          <VocabGame
            key="vocab"
            setView={setView}
            BASE_PATH={BASE_PATH}
            onExit={() => setView({ screen: "home" })}
          />)}

          {view.screen === "game" && gameMode === "vocabLearn" && (
          <VocabLearn
            key="vocabLearn"
            setView={setView}
            BASE_PATH={BASE_PATH}
            onExit={() => setView({ screen: "home" })}
          />)}

          {view.screen === "grammar" && (
            <GrammarSelect
              BASE_PATH={BASE_PATH}
              setView={setView}
              setGrammarConfig={setGrammarConfig}
              initialLevel={view.level || null}
              onExit={() => setView({ screen: "home" })}
            />
          )}

          {view.screen === "grammarFillBlanks" && (
            <GrammarFillBlanks
              BASE_PATH={BASE_PATH}
              level={grammarConfig.level}
              difficulty={grammarConfig.difficulty}
              selectedGrammar={grammarConfig.grammar}
              onExit={() =>
                setView({
                  screen: "grammar",
                  level: grammarConfig.level,
                })
              }
            />
          )}

          {view.screen === "grammarOrder" && (
            <GrammarOrder
              BASE_PATH={BASE_PATH}
              level={grammarConfig.level}
              difficulty={grammarConfig.difficulty}
              selectedGrammar={grammarConfig.grammar}
              onExit={() =>
                setView({
                  screen: "grammar",
                  level: grammarConfig.level,
                })
              }
            />
          )}

          {view.screen === "conjugationGame" && (
          <ConjugationGame
            conjugationPool={conjugationPool}
            mode={gameMode}
            onExit={() => setView({ screen: "conjugation" })}
            BASE_PATH={BASE_PATH}
          />
        )}

        {view.screen === "conjugationWheel" && (
          <ConjugationWheel
            conjugationPool={conjugationPool}
            mode={gameMode}
            BASE_PATH={BASE_PATH}
            onExit={() => setView({ screen: "home" })}
          />
        )}
        
          
      </div>
      {/* {view.screen === "home" && <Footer/>} */}
      <div id="overlay"></div>      
    </>
  );
}