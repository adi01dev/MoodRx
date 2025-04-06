import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shuffle, Clock, Trophy } from "lucide-react";

interface MemoryGameProps {
  onComplete: (score: number) => void;
}

type CardType = {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

const EMOJIS = ["😊", "😎", "🥳", "😍", "🤔", "😴", "🌞", "🌈", "🌻", "🦋", "🐢", "🦉"];

export function MemoryGame({ onComplete }: MemoryGameProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameStarted && cards.length > 0 && cards.every(card => card.matched)) {
      endGame();
    }
  }, [cards, gameStarted]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards[first];
      const secondCard = cards[second];

      setTimeout(() => {
        setFlippedCards([]);

        if (firstCard.emoji === secondCard.emoji) {
          setCards(prevCards =>
            prevCards.map((card, i) =>
              i === first || i === second ? { ...card, matched: true } : card
            )
          );
        } else {
          setCards(prevCards =>
            prevCards.map((card, i) =>
              i === first || i === second ? { ...card, flipped: false } : card
            )
          );
        }

        setMoves(prev => prev + 1);
      }, 800);
    }
  }, [flippedCards, cards]);

  const initializeGame = () => {
    setMoves(0);
    setTimer(0);
    setGameCompleted(false);
    setFlippedCards([]);
    setScore(0);

    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    const selectedEmojis = EMOJIS.slice(0, 6);
    const cardPairs = [...selectedEmojis, ...selectedEmojis].map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }));

    const shuffledCards = shuffleArray(cardPairs);
    setCards(shuffledCards);
  };

  const startGame = () => {
    setGameStarted(true);
    const id = window.setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  const endGame = () => {
    setGameCompleted(true);
    setGameStarted(false);

    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }

    const baseScore = 100;
    const movesPenalty = Math.max(0, moves - 6) * 2;
    const timePenalty = Math.max(0, timer - 30) * 1;
    const finalScore = Math.max(0, baseScore - movesPenalty - timePenalty);

    setScore(finalScore);
    onComplete(finalScore);
  };

  const handleCardClick = (index: number) => {
    if (!gameStarted || flippedCards.length >= 2 || cards[index].flipped || cards[index].matched) {
      return;
    }

    const newCards = cards.map((card, i) =>
      i === index ? { ...card, flipped: true } : card
    );

    setCards(newCards);
    setFlippedCards(prev => [...prev, index]);

    if (!gameStarted) {
      startGame();
    }
  };

  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-wellness-green-dark">Memory Match</CardTitle>
        <CardDescription>
          Find all matching pairs of cards to complete the game. Click on a card to reveal it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="flex items-center">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {formatTime(timer)}
          </Badge>
          <Badge variant="outline" className="flex items-center">
            Moves: {moves}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={initializeGame}
            disabled={gameStarted}
          >
            <Shuffle className="h-4 w-4 mr-1" />
            Shuffle
          </Button>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 md:gap-4">
          {cards.map((card, index) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(index)}
              className={`aspect-square flex items-center justify-center text-3xl sm:text-4xl rounded-md cursor-pointer transition-all duration-300 transform ${
                card.flipped || card.matched
                  ? "bg-wellness-green-light text-wellness-green-dark rotate-y-0"
                  : "bg-wellness-green text-wellness-green rotate-y-180"
              } ${
                gameStarted && !gameCompleted ? "hover:bg-wellness-green-dark/80" : ""
              }`}
              style={{ 
                perspective: "1000px", 
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden"
              }}
            >
              {(card.flipped || card.matched) ? card.emoji : ""}
            </div>
          ))}
        </div>
        {!gameStarted && !gameCompleted && (
          <div className="flex justify-center">
            <Button onClick={startGame}>
              Start Game
            </Button>
          </div>
        )}
        {gameCompleted && (
          <div className="bg-wellness-green-light/20 rounded-lg p-4 text-center">
            <h3 className="flex items-center justify-center text-lg font-medium text-wellness-green-dark mb-2">
              <Trophy className="h-5 w-5 mr-2" />
              Game Complete!
            </h3>
            <p className="mb-2">
              You completed the game in {moves} moves and {formatTime(timer)}.
            </p>
            <p className="text-lg font-medium">
              Your score: {score} / 100
            </p>
            <Button onClick={initializeGame} className="mt-4">
              Play Again
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        {gameStarted ? "Find all matches to complete the game!" : 
         gameCompleted ? "Great job! Try again to improve your score." : 
         "Click Start Game when you're ready!"}
      </CardFooter>
    </Card>
  );
}
