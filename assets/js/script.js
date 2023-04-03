const dealerHand = document.getElementById("dealer-hand");
const playerHand = document.getElementById("player-hand");
const dealerScore = document.getElementById("dealer-score");
const playerScore = document.getElementById("player-score");
const hitButton = document.getElementById("hit-button");
const standButton = document.getElementById("stand-button");
const dealButton = document.getElementById("deal-button");

let dealerCards = [];
let playerCards = [];

let playerTotal = 0;
let dealerTotal = 0;

let deckId = "";
let gameOn = false;

const startNewGame = async () => {
  // start a new game and set variables to default

  gameOn = true; // set the game status to on

  playerHand.innerHTML = ""; // clear the player's hand in the UI
  dealerHand.innerHTML = ""; // clear the dealer's hand in the UI

  playerScore.textContent = ""; // reset the player's score in the UI
  dealerScore.textContent = ""; // reset the dealer's score in the UI

  playerCards = []; // clear the player's cards in the array
  dealerCards = []; // clear the dealer's cards in the array

  playerTotal = 0; // reset the player's total
  dealerTotal = 0; // reset the dealer's total

  await shuffleDeck() // shuffle the deck
    .then(() => {
      // after the deck is shuffled
      drawCard() // draw first card for the player
        .then((card) => {
          // after the card is drawn
          playerHand.appendChild(createFaceUpCard(card)); // add the card to the player's hand in the UI
          playerCards.push(card); // add the card to the player's cards array

          const cardValue = getCardValue(card, playerTotal); // get the value of the card
          playerTotal += cardValue; // add the value of the card to the player's total
          playerScore.textContent = playerTotal; // update the player's score in the UI
        });
      drawCard() // draw first card for the dealer
        .then((card) => {
          // after the card is drawn
          dealerHand.appendChild(createFaceDownCard(card)); // add the card to the dealer's hand in the UI
          dealerCards.push(card); // add the card to the dealer's cards array
        });
      drawCard() // draw second card for the player
        .then((card) => {
          // after the card is drawn
          playerHand.appendChild(createFaceUpCard(card)); // add the card to the player's hand in the UI
          playerCards.push(card); // add the card to the player's cards array

          const cardValue = getCardValue(card, playerTotal); // get the value of the card
          playerTotal += cardValue; // add the value of the card to the player's total
          playerScore.textContent = playerTotal; // update the player's score in the UI
        });
      drawCard() // draw second card for the dealer
        .then((card) => {
          // after the card is drawn
          dealerHand.appendChild(createFaceUpCard(card)); // add the card to the dealer's hand in the UI
          dealerCards.push(card); // add the card to the dealer's cards array
        });
    });
};

const shuffleDeck = async () => {
  // Get a new shuffled deck from the API and store the deck ID

  await fetch("https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1") // fetch the deck
    .then((response) => response.json()) // convert the response to JSON
    .then((data) => {
      // use the JSON data
      deckId = data.deck_id; // store the deck ID
    });
};

const drawCard = async () => {
  // draw a card from the deck
  return await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
  ) // fetch the card
    .then((response) => response.json()) // convert the response to JSON
    .then((data) => {
      // use the JSON data
      return data.cards[0]; // return the card
    });
};

const createFaceUpCard = (card) => {
  // create an image element

  let cardImage = document.createElement("img"); // create an image element
  cardImage.src = card.image; // set the image source
  cardImage.alt = card.code; // set the image alt text
  cardImage.classList.add("card"); // add the card class to the image

  return cardImage; // return the image element
};

const createFaceDownCard = (card) => {
  // create an image element

  let cardImage = document.createElement("img"); // create an image element
  cardImage.src = "https://deckofcardsapi.com/static/img/back.png"; // set the image source
  cardImage.alt = "card-back"; // set the image alt text
  cardImage.classList.add("card"); // add the card class to the image

  return cardImage; // return the image element
};

const getCardValue = (card, score) => {
  // get the value of a card

  if (card.value === "ACE") {
    // if the card is an ace
    if (score + 11 > 21) {
      // if the score plus 11 is greater than 21
      return 1; // return 1
    } else {
      // if the score plus 11 is less than 21
      return 11; // return 11
    }
  }

  if (
    card.value === "JACK" ||
    card.value === "QUEEN" ||
    card.value === "KING"
  ) {
    // if the card is a face card
    return 10; // return 10
  }

  return parseInt(card.value); // return the card value
};

dealButton.addEventListener("click", async () => {
  // on click of the Deal button, start a new game
  startNewGame();
});

hitButton.addEventListener("click", async () => {
  const countPlayerCards = () => {
    // find all aces in the playerCardsDuplicate array and move them to the end of the array
    let playerCardsDuplicate = [...playerCards]; // duplicate the player's cards array
    const aceArray = playerCardsDuplicate.filter(
      (card) => card.value === "ACE"
    ); // find all aces in the playerCardsDuplicate array
    playerCardsDuplicate = playerCardsDuplicate.filter(
      (card) => card.value !== "ACE"
    ); // remove all aces from the playerCardsDuplicate array
    playerCardsDuplicate = [...playerCardsDuplicate, ...aceArray]; // add the aces to the end of the playerCardsDuplicate array

    // count the cards in the playerCardsDuplicate array
    let cardCount = 0;
    playerCardsDuplicate.forEach((card) => {
      cardCount += getCardValue(card, cardCount);
    });
    return cardCount;
  };

  // on click of the Hit button, draw a card for the player
  if (gameOn) {
    // draw a card for the player
    drawCard() // draw second card for the player
      .then((card) => {
        // after the card is drawn
        playerHand.appendChild(createFaceUpCard(card)); // add the card to the player's hand in the UI
        playerCards.push(card); // add the card to the player's cards array

        playerTotal = countPlayerCards(); // count the cards in the player's hand

        playerScore.textContent = playerTotal; // update the player's score in the UI
        if (playerTotal > 21) {
          // if the player's total is greater than 21
          gameOn = false; // set the game status to off
          setTimeout(() => {
            // wait 200 milliseconds
            alert(`You Bust! Player Card count: ${playerTotal}`); // alert the player that they lost
          }, 200);
        }
      });
  }
});

standButton.addEventListener("click", async () => {
  // on click of the Stand button, call the computersTurn function
  if (gameOn) {
    // if the game is on
    // flip up the dealer's face down card
    dealerHand.removeChild(dealerHand.firstChild); // remove first child of the dealer's hand
    dealerHand.prepend(createFaceUpCard(dealerCards[0])); // add the card to the dealer's hand in the UI

    const countDealerCards = () => {
      dealerTotal = 0; // reset the dealer's total
      let dealerCardsDuplicate = [...dealerCards]; // create a duplicate of the dealer's cards array to be able to move the ace to the end of the array
      // find all aces in the dealerCardsDuplicate array and move them to the end of the array
      const aceArray = dealerCardsDuplicate.filter(
        (card) => card.value === "ACE"
      ); // find all aces in the dealerCardsDuplicate array
      dealerCardsDuplicate = dealerCardsDuplicate.filter(
        (card) => card.value !== "ACE"
      ); // remove all aces from the dealerCardsDuplicate array
      dealerCardsDuplicate = [...dealerCardsDuplicate, ...aceArray]; // add the aces to the end of the dealerCardsDuplicate array

      dealerCardsDuplicate.forEach((card) => {
        const cardValue = getCardValue(card, dealerTotal); // get the value of the card
        dealerTotal += cardValue; // add the value of the card to the dealer's total
        dealerScore.textContent = dealerTotal; // update the dealer's score in the UI
      });
    };

    const checkForWinner = () => {
      // function determines if the player or dealer won
      // players total must be less than 22 at this point in the game
      if (playerTotal > dealerTotal || dealerTotal > 21) {
        // if the player's total is greater than the dealer's total or the dealer's total is greater than 21
        alert(
          `You Win! Player Card count: ${playerTotal}, Dealer Card count: ${dealerTotal}`
        ); // alert the player that they won
      } else if (playerTotal < dealerTotal && dealerTotal <= 21) {
        // if the player's total is less than the dealer's total and dealer's total is less than 22
        alert(
          `You Lose! Player Card count: ${playerTotal}, Dealer Card count: ${dealerTotal}`
        ); // alert the player that they lost
      } else {
        alert(
          `It's a tie! Player Card count: ${playerTotal}, Dealer Card count: ${dealerTotal}`
        ); // alert the player that it was a tie
      }
    };

    countDealerCards(); // count the dealer's cards

    const hitDealer = async () => {
      // draw a card for the dealer
      drawCard() // draw a new card for the dealer
        .then((card) => {
          // after the card is drawn
          dealerHand.appendChild(createFaceUpCard(card)); // add the card to the dealer's hand in the UI
          dealerCards.push(card); // add the card to the dealer's cards array

          countDealerCards(); // count the dealer's cards
        })
        .then(() => {
          if (dealerTotal < 17 && dealerTotal < playerTotal) {
            // if the dealer's total is less than 17 and the dealer's total is less than the player's total
            hitDealer(); // call the hitDealer function
          } else {
            // if the dealer's total is greater than 17 or the dealer's total is greater than the player's total
            setTimeout(() => {
              // wait 200 milliseconds
              checkForWinner(); // call the checkForWinner function
            }, 200);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    };

    if (dealerTotal < 17) {
      // if the dealer's total is less than 17, the dealer must hit
      console.log("Dealer hits once");
      hitDealer(); // call the hitDealer function
    } else {
      console.log("else once");
      const aceArray = dealerCards.filter((card) => card.value === "ACE"); // create an array of the dealer's aces
      if (aceArray.length) {
        console.log("has ace");
        aceArray.forEach((card) => {
          // if the dealer has an ace
          // remove all aces from the dealer's cards array
          dealerCards = dealerCards.filter((card) => card.value !== "ACE");
          // add all of the aces to the end of the dealer's cards array
          dealerCards = [...dealerCards, ...aceArray];
          countDealerCards(); // count the dealer's cards

          // check to see if dealer total is less than player total
          if (dealerTotal < playerTotal) {
            console.log("Dealer should hit");
            hitDealer(); // call the hitDealer function
          } else {
            console.log("Dealer does not hit");
            gameOn = false; // set the game status to off
            setTimeout(() => {
              // wait 200 milliseconds
              checkForWinner(); // check for a winner
            }, 200);
          }
        });
      } else {
        gameOn = false; // set the game status to off
        setTimeout(() => {
          // wait 200 milliseconds
          checkForWinner(); // check for a winner
        }, 200);
      }
    }
  }
});

// Path: assets/js/script.js
