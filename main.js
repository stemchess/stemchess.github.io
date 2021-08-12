"use strict"

/*
Cheat sheet for those unfamiliar with chess
(because I made some of this less verbose than it could/should be):

p = pawn
r = rook (castle)
n = knight
b = bishop
q = queen
k = king

w = white
b = black

This shorthand is used a couple places that I can't be bothered to change,
so I just used it everywhere so I don't have to convert it back and forth.
*/


/* GLOBAL VARIABLE DECLARATION */

// Create a representation of the board
let board = new Array();

// Note whose turn it is
let colorToMove = 'w';

// This allows us to quickly look up which file we are in from a number (or vice versa)
// Used in a number of places
const fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

// Note which spaces are currently selected, and which ones were selected in the previous move
let previousMove = new Array(2);
let currentMove = new Array(2);

// Note if a piece can be en passant-ed
let EP = '';


/* BOARD SETUP */

/*
This class takes variuos characteristics and turns them into an "object".
We can use this to create an object for each piece, but with a lot of shared characteristics to avoid repetition.
The widespread use of objects led to something called "object-oriented programming" and it was a thing or something.
*/
class chessPiece {
    constructor(x, y, type, color) {
        this.position = {x, y};
        this.type = type;
        this.color = color;

        if (this.type == 'p') {
            this.canDoubleMove = true;
            this.canBeEnPassanted = false;
        }

        if (this.type == 'r' || this.type == 'k') {
            this.canCastle = true;
        }
    }
}

/*
Reset the board visually by basically nuking everything and starting over (iterating over every element)

This is inefficient for most use cases, but it works and is the simplest solution for major changes.
It is only used when the board is entirely reset.
*/
function synchronizeBoardState() {
    // Set the background of all tiles to be blank
    let allTiles = document.getElementsByClassName('tile');
    for (let i = 0; i < allTiles.length; i++) {
        allTiles[i].style.backgroundImage = '';
    }

    // Loop through every space in the array and set background images accordingly
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j]) {
                let currentPiece = board[i][j];
                
                let currentPosition = currentPiece.position;
                let currentNotation = currentPosition.x + String(currentPosition.y);
                let currentTile = document.getElementById(currentNotation);

                let imageLocation = 'url("/images/' + currentPiece.type + currentPiece.color + '.svg")';

                currentTile.style.backgroundImage = imageLocation;
            } 
        }
    }
}

// Resets the state of the array internally representing the board
function resetBoardArray() {
    // Set the board to be empty (really only neccesary if there's anything already in it; i.e., not the first time)
    board = [];
    // Create 8 rows of 8 (empty) items each
    for (let i = 0; i < 8; i++) {
        board[i] = new Array(8);
    }

    // Set all of the initial pieces on the board
    board[0][0] = new chessPiece('a', 1, 'r', 'w');
    board[1][0] = new chessPiece('b', 1, 'n', 'w');
    board[2][0] = new chessPiece('c', 1, 'b', 'w');
    board[3][0] = new chessPiece('d', 1, 'q', 'w');
    board[4][0] = new chessPiece('e', 1, 'k', 'w');
    board[5][0] = new chessPiece('f', 1, 'b', 'w');
    board[6][0] = new chessPiece('g', 1, 'n', 'w');
    board[7][0] = new chessPiece('h', 1, 'r', 'w');

    // These are full rows of (nearly) identical pawns, so it's fairly simple to just loop through them.
    for (let i = 0; i < 8; i++) {
        board[i][1] = new chessPiece(fileLetters[i], 2, 'p', 'w');
    }

    for (let i = 0; i < 8; i++) {
        board[i][6] = new chessPiece(fileLetters[i], 7, 'p', 'b');
    }
    
    board[0][7] = new chessPiece('a', 8, 'r', 'b');
    board[1][7] = new chessPiece('b', 8, 'n', 'b');
    board[2][7] = new chessPiece('c', 8, 'b', 'b');
    board[3][7] = new chessPiece('d', 8, 'q', 'b');
    board[4][7] = new chessPiece('e', 8, 'k', 'b');
    board[5][7] = new chessPiece('f', 8, 'b', 'b');
    board[6][7] = new chessPiece('g', 8, 'n', 'b');
    board[7][7] = new chessPiece('h', 8, 'r', 'b');
}

// Removes the highlight of the previous move
// There isn't a particularly good place to put this function that both works and makes sense
function unmarkPreviousMove() {
    if (previousMove[0] != undefined) {
        previousMove.forEach(move => document.getElementById(move).classList.remove('previous'));
    }
}

// This function resets the board.
function resetBoard() {
    // Reset the array
    resetBoardArray();

    // Remove markings of the last move played (if any)
    unmarkPreviousMove();

    // Reset records of current and previous moves
    previousMove = new Array(2);
    currentMove = new Array(2);

    // An en passant cannot occur from the initial game state
    EP = '';

    // White moves first
    colorToMove = 'w';

    // Make the pieces actually show up
    // This is probably somewhat inefficient (as noted above), but it's simple.
    synchronizeBoardState();
}

// Use the function above to reset the board, bringing us to our initial state
resetBoard();


/* MOVING PIECES */

// Converts notation (as used in tile IDs) to numbers to reference the array
function notationToArrayIndex(notation) {
    let x = fileLetters.indexOf(notation[0]);
    let y = notation[1] - 1;

    return {x, y};
}

// Converts notation (as used in tile IDs) to an {x, y} object as stored in the representation of individual pieces
function notationToPositionObject(notation) {
    let x = notation[0];
    let y = Number(notation[1]);

    return {x, y};
}

// Converts a position obect to numbers to reference the array
function positionObjectToArrayIndex(position) {
    let x = fileLetters.indexOf(position.x);
    let y = position.y - 1;

    return {x, y};
}

function piecesBetween (start, end) {
    let startIndex = positionObjectToArrayIndex(start);
    let endIndex = positionObjectToArrayIndex(end);

    let dx = endIndex.x - startIndex.x;
    let dy = endIndex.y - startIndex.y;

    // If the tiles are next to each other, there, will be nothing between them
    if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
        return false;
    }

    if (dx == 0) {
        // Vertical movement
        if (dy > 0) {
            for (let i = 1; i < dy; i++) {
                if (board[startIndex.x][startIndex.y + i]) {
                    return true;
                }
            }
        } else {
            for (let i = -1; i > dy; i--) {
                if (board[startIndex.x][startIndex.y + i]) {
                    return true;
                }
            }
        }
        return false;

    } else if (dy == 0) {
        // Horizontal movement
        if (dx > 0) {
            for (let i = 1; i < dx; i++) {
                if (board[startIndex.x + i][startIndex.y]) {
                    return true;
                }
            }
        } else {
            for (let i = -1; i > dx; i--) {
                if (board[startIndex.x + i][startIndex.y]) {
                    return true;
                }
            }
        }
        return false;

    } else if (Math.abs(dx) == Math.abs(dy)) {
        // Diagonal movement
        if (dx > 0 && dy > 0) {
            for (let i = 1; i < dx; i++) {
                if (board[startIndex.x + i][startIndex.y + i]) {
                    return true;
                }
            }
            return false;

        } else if (dx < 0 && dy < 0) {
            for (let i = -1; i > dx; i--) {
                if (board[startIndex.x + i][startIndex.y + i]) {
                    return true;
                }
            }
            return false;

        } else if (dx > 0 && dy < 0) {
            for (let i = 1; i < dx; i++) {
                if (board[startIndex.x + i][startIndex.y - i]) {
                    return true;
                }
            }
            return false;

        } else if (dx < 0 && dy > 0) {
            for (let i = 1; i < dy; i++) {
                if (board[startIndex.x - i][startIndex.y + i]) {
                    return true;
                }
            }
            return false;

        }
    } else {
        // Give up and tell whatever asked us to stop
        return true;
    }
}

function validateMove(piece, target) {
    let endingIndex = notationToArrayIndex(target);

    // We cannot move to a tile with a piece of the same color on it
    if (board[endingIndex.x][endingIndex.y] != undefined && board[endingIndex.x][endingIndex.y].color == piece.color) {
        return false;
    }

    // Note the horizontal and vertical movement
    let startingPosition = piece.position;
    let endingPosition = notationToPositionObject(target);

    let dx = fileLetters.indexOf(endingPosition.x) - fileLetters.indexOf(startingPosition.x);
    let dy = endingPosition.y - startingPosition.y;

    switch(piece.type) {
        case 'p':
            let forward = dy;
            if (piece.color == 'b') {
                // If a black piece is moving, flip this
                // Usually this doesn't matter (we can just take the absolute value),
                // but pawns can only move forward
                forward = dy * -1;
            }

            if (dx == 0 && forward == 1) {
                if (board[endingIndex.x][endingIndex.y] != undefined) {
                    // Pawns can't capture forward
                    return false;
                } else {
                    return true;
                }
            }

            if (dx == 0 && forward == 2 && piece.canDoubleMove && piecesBetween(startingPosition, endingPosition) == false) {
                if (board[endingIndex.x][endingIndex.y] != undefined) {
                    // Pawns can't capture forward
                    return false;
                } else {
                    return true;
                }
            }

            let x = fileLetters.indexOf(piece.position.x) + dx;
            let y = piece.position.y - 1 + dy;

            if (Math.abs(dx) == 1 && forward == 1 && board[x][y] != undefined) {
                return true;
            }

            y = piece.position.y - 1;
            
            if (Math.abs(dx) == 1 && dy == 1 && board[x][y] != undefined && board[x][y].canBeEnPassanted && board[x][y].color != piece.color) {
                document.getElementById(board[x][y].position.x + board[x][y].position.y).style.backgroundImage = 'unset';
                board[x][y] = undefined;
                EP = '';
                return true;
            }
            return false;

        case 'r':
            if ((dx == 0 || dy == 0) && piecesBetween(startingPosition, endingPosition) == false) {
                return true;
            }
            return false;

        case 'n':
            if ((Math.abs(dx) == 1 && Math.abs(dy) == 2) || (Math.abs(dx) == 2 && Math.abs(dy) == 1)) {
                return true;
            }
            return false;

        case 'b':
            if (Math.abs(dx) == Math.abs(dy) && piecesBetween(startingPosition, endingPosition) == false) {
                return true;
            }
            return false;

        case 'k':
            if (Math.abs(dx) < 2 && Math.abs(dy) < 2) {
                return true;
            }
            return false;

        case 'q':
            if (((dx == 0 || dy == 0) || (Math.abs(dx) == Math.abs(dy))) && piecesBetween(startingPosition, endingPosition) == false) {
                return true;
            }
            return false;
            
        default:
            return false;
    }
}

function movePiece() {
    // An en passant can only take place the next move (and taking care of this before anything actually changes is easier)
    if (EP != '') {
        let epIndex = notationToArrayIndex(EP);
        board[epIndex.x][epIndex.y].canBeEnPassanted = false;
        EP = '';
    }
    
    // Stop marking the previous move
    unmarkPreviousMove();

    // Convert a few things into more easily usable formats
    let startingIndex = notationToArrayIndex(currentMove[0]);
    let endingIndex = notationToArrayIndex(currentMove[1]);

    let startingElement = document.getElementById(currentMove[0]);
    let endingElement = document.getElementById(currentMove[1]);

    // Move the piece on our JS representation of the board (overwriting anything that's already there)
    board[endingIndex.x][endingIndex.y] = board[startingIndex.x][startingIndex.y];
    board[endingIndex.x][endingIndex.y].position = notationToPositionObject(currentMove[1]);
    board[startingIndex.x][startingIndex.y] = undefined;

    let promoted = false;

    // A pawn cannot move two tiles after its first move
    if (board[endingIndex.x][endingIndex.y].type == 'p') {
        board[endingIndex.x][endingIndex.y].canDoubleMove = false;

        // If the pawn moved two tiles, it can be en passant-ed the next move
        if (Math.abs(endingIndex.y - startingIndex.y) == 2) {
            board[endingIndex.x][endingIndex.y].canBeEnPassanted = true;
            EP = currentMove[1];
        }

        // If a pawn is in the last rank, promote it to a queen
        if (endingIndex.y == 0 || endingIndex.y == 7) {
            let og = board[endingIndex.x][endingIndex.y];
            board[endingIndex.x][endingIndex.y] = new chessPiece(og.position.x, og.position.y, 'q', og.color);

            let imageURL = 'url("/images/q' + og.color + '.svg")';
            endingElement.style.backgroundImage = imageURL;
            promoted = true;
        }
    }

    // If the king or a rook moves, it can no longer castle
    if (board[endingIndex.x][endingIndex.y].type == 'k' || board[endingIndex.x][endingIndex.y].type == 'r') {
        board[endingIndex.x][endingIndex.y].canCastle = false;
    }

    // Change whose turn it is
    if (colorToMove == 'w') {
        colorToMove = 'b';
    } else if (colorToMove == 'b') {
        colorToMove = 'w';
    }

    // Display the move
    if (!promoted) {
        endingElement.style.backgroundImage = startingElement.style.backgroundImage;
    }
    startingElement.style.backgroundImage = '';

    // Change the background of the previous move
    let previous = document.getElementsByClassName('selected');
    previous[1].classList.add('previous');
    previous[0].classList.add('previous');
    previous[1].classList.remove('selected');
    previous[0].classList.remove('selected');

    // Set this to be the previous move and set the current to be empty
    previousMove = currentMove;
    currentMove = new Array(2);
}

// This is the function that runs when the board is clicked
function clickSquare(e) {
    // Detect which tile was clicked
    let elementClicked = e.target;
    let tileClicked = elementClicked.id;

    if (currentMove[0] == undefined) {
        // If there are no tiles selected for the current move, select this one if there is a piece there
        let index = notationToArrayIndex(tileClicked);
        
        if (board[index.x][index.y] && board[index.x][index.y].color == colorToMove) {
            currentMove[0] = tileClicked;
            elementClicked.classList.add('selected');
        }
    } else if (tileClicked == currentMove[0]) {
        // If this tile is already selected for the current move, deselect it
        currentMove = new Array(2);
        elementClicked.classList.remove('selected');
    } else {
        // If one other tile is alredy selected for the current move, check if the move is valid\
        // If it is, select this tile and move the piece
        let startIndex = notationToArrayIndex(currentMove[0]);

        if (validateMove(board[startIndex.x][startIndex.y], tileClicked)) {
            currentMove[1] = tileClicked;
            elementClicked.classList.add('selected');
            movePiece();
        }
    }
}

// Run a function when the board is clicked
document.getElementById('board').addEventListener('click', clickSquare);