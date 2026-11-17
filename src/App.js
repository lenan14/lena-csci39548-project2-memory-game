import "./App.css";
import Card from "./components/Card";
import { useState, useRef, useEffect } from "react";

const cardImages = [
  { src: "A", matched: false },
  { src: "B", matched: false },
  { src: "C", matched: false },
  { src: "D", matched: false },
  { src: "E", matched: false },
  { src: "F", matched: false },
];

function App() {
  const [cards, setCards] = useState([]);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Store the timeout so a new game can cancel it.
  const mismatchTimeout = useRef(null);
  const startTime = useRef(null);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timerInterval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isRunning]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const resetTurn = () => {
    setChoiceOne(null);
    setChoiceTwo(null);
    setDisabled(false);
  };

  const shuffleCards = () => {
    // Cancel any pending mismatch timeout.
    if (mismatchTimeout.current) {
      clearTimeout(mismatchTimeout.current);
      mismatchTimeout.current = null;
    }

    const shuffledCards = [...cardImages, ...cardImages]
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        ...card,
        id: index,
      }));

    setCards(shuffledCards);
    resetTurn();
    setAttempts(0);
    setElapsedSeconds(0);
    setIsRunning(false);
    setHasWon(false);
    startTime.current = null;
  };

  const handleChoice = (card) => {
    // Ignore clicks while resolving a pair.
    if (disabled || card.matched) {
      return;
    }

    // First card selected.
    if (!choiceOne) {
      if (!startTime.current) {
        startTime.current = Date.now();
        setIsRunning(true);
      }
      setChoiceOne(card);
      return;
    }

    // Don't allow the same card to be selected twice.
    if (choiceOne.id === card.id) {
      return;
    }

    // Second card selected.
    setChoiceTwo(card); //only informs UI
    setDisabled(true);
    setAttempts((currentAttempts) => currentAttempts + 1);

    if (choiceOne.src === card.src) {
      // The cards match.
      const updatedCards = cards.map((currentCard) => {
        if (currentCard.src === card.src) {
          return { ...currentCard, matched: true };
        }

        return currentCard;
      });
      setCards(updatedCards);
      // Matched cards stay visible because they are marked matched.

      resetTurn();

      if (updatedCards.every((currentCard) => currentCard.matched)) {
        setElapsedSeconds(Math.floor((Date.now() - startTime.current) / 1000));
        setIsRunning(false);
        setHasWon(true);
      }
    } else {
      // The cards don't match. Give the player time to see them.
      mismatchTimeout.current = setTimeout(() => {
        resetTurn();
        mismatchTimeout.current = null;
      }, 1000);
    }
  };

  return (
    <div className="App">
      <h1>Memory Game</h1>
      <p className="game-stats">
        Time: <strong>{formatTime(elapsedSeconds)}</strong>
        <span aria-hidden="true"> | </span>
        Attempts: <strong>{attempts}</strong>
      </p>

      <button className="new-game-button" onClick={shuffleCards}>
        New Game
      </button>

      {hasWon && (
        <p className="win-message" role="status">
          You won in {formatTime(elapsedSeconds)} with {attempts} attempts!
        </p>
      )}

      <div className="card-grid">
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            handleChoice={handleChoice}
            flipped={card === choiceOne || card === choiceTwo || card.matched}
          />
        ))}
      </div>
    </div>
  );
}

export default App;