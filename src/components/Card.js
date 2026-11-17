import "./Card.css";

export default function Card({ card, handleChoice, flipped }) {
  return (
    <div className="card">
      {flipped ? (
        <div className="front">{card.src}</div>
      ) : (
        <div className="back" onClick={() => handleChoice(card)} />
      )}
    </div>
  );
}
