import "./App.css";
import Card from "./components/Card";
import { useState, useRef } from "react";

const cardImages = [
  { src: "A", matched: false },
  { src: "B", matched: false },
  { src: "C", matched: false },
  { src: "D", matched: false },
  { src: "E", matched: false },
];

function App() {
  const [cards, setCards] = useState([]);
  const [choiceOne, setChoiceOne] = useState(null);
  const [choiceTwo, setChoiceTwo] = useState(null);
  const [disabled, setDisabled] = useState(false);

  // Store the timeout so a new game can cancel it.
  const mismatchTimeout = useRef(null);

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
  };

  const handleChoice = (card) => {
    // Ignore clicks while resolving a pair.
    if (disabled || card.matched) {
      return;
    }

    // First card selected.
    if (!choiceOne) {
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

    if (choiceOne.src === card.src) {
      // The cards match.
      setCards((prevCards) =>
        prevCards.map((currentCard) => {
          if (currentCard.src === card.src) {
            return { ...currentCard, matched: true };
          }

          return currentCard;
        })
      );
      // Matched cards stay visible because they are marked matched.

      resetTurn();
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

      <button onClick={shuffleCards}>New Game</button>

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
