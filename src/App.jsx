import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { wordList } from './wordList';

function App() {
  const [targetWord, setTargetWord] = useState(getRandomWord());
  const [guesses, setGuesses] = useState(['', ...Array(5).fill('')]);
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!showKeyboard && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showKeyboard]);

  useEffect(() => {
    if (currentAttempt === 6 && !showPopup) {
      setMessage(`Dommage! Le mot était: ${targetWord}`);
      setShowPopup(true);
    }
  }, [currentAttempt, showPopup, targetWord]);

  function getRandomWord() {
    let word;
    do {
      word = wordList[Math.floor(Math.random() * wordList.length)];
    } while (word.length !== 6);
    return word;
  }

  const handleInputChange = (e) => {
    const value = e.target.value.toUpperCase();
     if (value.length <= 6) {
            setInput(value);
            setGuesses((prevGuesses) => {
                const newGuesses = [...prevGuesses];
                newGuesses[currentAttempt] = value;
                return newGuesses;
            });
        }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (showPopup) {
        resetGame();
      } else {
        handleGuess();
      }
    }
  };

  const handleGuess = () => {
    if (input.length === 6 && currentAttempt < 6) {
      const feedback = getFeedback(input);
      animateFeedback(feedback, () => {
        if (input === targetWord) {
          setScore(score + 1);
          setMessage('Bravo! Vous avez trouvé le mot.');
          setShowPopup(true);
        } else {
          setCurrentAttempt(currentAttempt + 1);
          setInput('');
        }
      });
    }
  };

  const animateFeedback = (feedback, callback) => {
    feedback.forEach((status, index) => {
      setTimeout(() => {
        setGuesses((prevGuesses) => {
          const newGuesses = [...prevGuesses];
          newGuesses[currentAttempt] = input; // Assign the current input
          return newGuesses;
        });

        // Apply a CSS class at the right time to animate each letter
        const cell = document.querySelectorAll(`.row:nth-child(${currentAttempt + 1}) .cell`)[index];
        if (status) {
          cell.classList.add(status);
        }

        // Once the animation is complete, execute the rest of the code
        if (index === feedback.length - 1) {
          setTimeout(callback, 500); // Wait for the last animation before continuing
        }
      }, index * 300); // Apply the delay progressively
    });
  };

  const resetGame = () => {
    const newTargetWord = getRandomWord();
    setTargetWord(newTargetWord);
    setGuesses(['', ...Array(5).fill('')]);
    setCurrentAttempt(0);
    setInput('');
    setShowPopup(false);
    
    if (!showKeyboard && inputRef.current) {
      inputRef.current.focus();
    }

    // Reset all cells to blue
    document.querySelectorAll('.cell').forEach(cell => {
      cell.classList.remove('correct', 'present');
    });
  };

  const resetGameAndScore = () => {
    resetGame();
    setScore(0);
  };

  const getFeedback = (guess) => {
    const feedback = Array(6).fill('');
    const targetWordArray = targetWord.split('');
    const guessArray = guess.split('');

    // Check for correct positions first
    guessArray.forEach((letter, index) => {
      if (letter === targetWordArray[index]) {
        feedback[index] = 'correct';
        targetWordArray[index] = null; // Mark as used
        guessArray[index] = null; // Mark as used
      }
    });

    // Check for present letters
    guessArray.forEach((letter, index) => {
      if (letter && targetWordArray.includes(letter)) {
        feedback[index] = 'present';
        targetWordArray[targetWordArray.indexOf(letter)] = null; // Mark as used
      }
    });
    return feedback;
  };

 const handleKeyboardClick = (letter) => {
        if (input.length < 6) {
            const new_input = input + letter;
            setInput(new_input);
            setGuesses((prevGuesses) => {
                const newGuesses = [...prevGuesses];
                newGuesses[currentAttempt] = new_input;
                return newGuesses;
            });
        }
    };

  const handleBackspace = () => {
    if (input.length > 0) {
      const new_input = input.slice(0, -1);
      setInput(new_input);
  
      setGuesses((prevGuesses) => {
        const newGuesses = [...prevGuesses];
        newGuesses[currentAttempt] = new_input;
        return newGuesses;
      });
    }
  };

  const handleEnter = () => {
    handleGuess();
  };

  const toggleKeyboard = () => {
    setShowKeyboard(!showKeyboard);
  };

  return (
    <div className="game-container">
      <h1>Motus</h1>
      <div className="subtitle">Jeu de Devinettes</div>
      <div className="score">Score: {score}</div>
      <div className="grid">
        {guesses.map((guess, attemptIndex) => (
          <div key={attemptIndex} className="row">
            {Array.from({ length: 6 }).map((_, letterIndex) => {
              let displayLetter = '';
                if (attemptIndex > 0 && attemptIndex === currentAttempt && letterIndex === 0) {
                    displayLetter = input[0] || targetWord[0];
                } else if (attemptIndex === 0 && letterIndex === 0) {
                    displayLetter = targetWord[0];
                }
                else if (guess) {
                    displayLetter = guess[letterIndex] || '';
                }
              return (
                <span
                  key={letterIndex}
                  className={`cell ${
                    attemptIndex < currentAttempt
                      ? getFeedback(guess)[letterIndex]
                      : ''
                  }`}
                >
                  {displayLetter}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      {!showKeyboard && (
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          maxLength={6}
        />
      )}
      <div className="button-container">
        <button onClick={toggleKeyboard}>
          {showKeyboard ? 'Afficher la zone de saisie' : 'Afficher le clavier'}
        </button>
        <button onClick={resetGameAndScore}>Réinitialiser le Jeu</button>
      </div>
      {showKeyboard && (
        <div className="keyboard">
          <div className="keyboard-row">
            {'AZERTYUIOP'.split('').map((letter) => (
              <button
                key={letter}
                className="key"
                onClick={() => handleKeyboardClick(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="keyboard-row">
            {'QSDFGHJKLM'.split('').map((letter) => (
              <button
                key={letter}
                className="key"
                onClick={() => handleKeyboardClick(letter)}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="keyboard-row">
            <button className="key special" onClick={handleBackspace}>
              ←
            </button>
            {'WXCVBN'.split('').map((letter) => (
              <button
                key={letter}
                className="key"
                onClick={() => handleKeyboardClick(letter)}
              >
                {letter}
              </button>
            ))}
            <button className="key special" onClick={handleEnter}>
              Entrée
            </button>
          </div>
        </div>
      )}
      {showPopup && (
        <div className="popup" onKeyPress={handleKeyPress}>
          <div className="popup-content">
            <h2>{message}</h2>
            <button onClick={resetGame}>Jouer à nouveau</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
