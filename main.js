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
            this.canEP = false;
        }

        if (this.type == 'r' || this.type == 'k') {
            this.canCastle = true;
        }
    }
}

/*
This is a super inefficient way to do this (it loops through every single space on the board).
It works.

(And most moves shouldn't use it)
*/
function synchronizeBoardState() {
    // Set the background of all tiles to be blank
    let allTiles = document.getElementsByClassName('tile');
    for (let i = 0; i < allTiles.length; i++) {
        allTiles[i].style.backgroundImage = '';
    }

    // Loop through every space in the JS board and set background images accordingly
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

// This function resets the board.
function resetBoard() {
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

    // This allows us to quickly look up which file we are in from a number (or vice versa)
    const fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

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

    // Make the pieces actually show up
    // This is probably somewhat inefficient (as noted above), but it's simple.
    synchronizeBoardState();
}

// Actually use the function above to reset the board
resetBoard();


/* MOVING PIECES */

// Converts notation (as used in tile IDs) to numbers to reference the array
function notationToArrayIndex(notation) {
    // C.f. above
    const fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

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
    // C.f. above
    const fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    
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
    } else if (dx == dy) {

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
    
    // C.f. above
    const fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    let dx = fileLetters.indexOf(endingPosition.x) - fileLetters.indexOf(startingPosition.x);
    let dy = endingPosition.y - startingPosition.y;

    switch(piece.type) {
        case 'p':
            if (piece.color == 'b') {
                // If a black piece is moving, flip this
                // Usually this doesn't matter (we can just take the absolute value),
                // but pawns can only move forward
                dy = dy * -1;
            }

            if (dx == 0 && dy == 1) {
                if (board[endingIndex.x][endingIndex.y] != undefined) {
                    // Pawns can't capture forward
                    return false;
                } else {
                    return true;
                }
            }

            if (dx == 0 && dy == 2 && piece.canDoubleMove && piecesBetween(startingPosition, endingPosition) == false) {
                if (board[endingIndex.x][endingIndex.y] != undefined) {
                    // Pawns can't capture forward
                    return false;
                } else {
                    return true;
                }
            }

            let x = fileLetters.indexOf(piece.position.x) + dx;
            let y = piece.position.y;

            if (Math.abs(dx) == 1 && dy == 1 && board[x][y] != undefined) {
                return true;
            }

            y = piece.position.y - 1;
            
            if (Math.abs(dx) == 1 && dy == 1 && board[x][y] != undefined && board[x][y].canEP && board[x][y].color != piece.color) {
                document.getElementById(board[x][y].position.x + board[x][y].position.y).style.backgroundImage = 'unset';
                board[x][y] = undefined;
                EP = '';
                return true;
            }

            return false;

        case 'r':
            return true;
        case 'n':
            return true;
        case 'b':
            return true;
        case 'k':
            return true;
        case 'q':
            return true;
        default:
            return false;
    }
}

function movePiece() {
    // An en passant can only take place the next move (and taking care of this before anything actually changes is easier)
    if (EP != '') {
        let epIndex = notationToArrayIndex(EP);
        board[epIndex.x][epIndex.y].canEP = false;
        EP = '';
    }
    
    // Stop marking the previous move
    if (previousMove[0] != undefined) {
        // Unless it's also one of the current moves
        if (!currentMove.includes(previousMove[0])) {
            document.getElementById(previousMove[0]).classList.remove('selected');            
        }
        if (!currentMove.includes(previousMove[1])) {
            document.getElementById(previousMove[1]).classList.remove('selected');            
        }
    }

    // Convert a few things into more easily usable formats
    let startingIndex = notationToArrayIndex(currentMove[0]);
    let endingIndex = notationToArrayIndex(currentMove[1]);

    let startingElement = document.getElementById(currentMove[0]);
    let endingElement = document.getElementById(currentMove[1]);

    // Move the piece on our JS representation of the board (overwriting anything that's already there)
    board[endingIndex.x][endingIndex.y] = board[startingIndex.x][startingIndex.y];
    board[endingIndex.x][endingIndex.y].position = notationToPositionObject(currentMove[1]);
    board[startingIndex.x][startingIndex.y] = undefined;

    // A pawn cannot move two tiles after its first move
    if (board[endingIndex.x][endingIndex.y].type == 'p') {
        board[endingIndex.x][endingIndex.y].canDoubleMove = false;

        // If the pawn moved two tiles, it can be en passant-ed the next move
        if (Math.abs(endingIndex.y - startingIndex.y) == 2) {
            board[endingIndex.x][endingIndex.y].canEP = true;
            EP = currentMove[1];
        }
    }

    // If the king or a rook moves, it can no longer castle
    if (board[endingIndex.x][endingIndex.y].type == 'k' || board[endingIndex.x][endingIndex.y].type == 'r') {
        board[endingIndex.x][endingIndex.y].canCastle = false;
    }

    // Display the move
    endingElement.style.backgroundImage = startingElement.style.backgroundImage;
    startingElement.style.backgroundImage = '';

    // Set this to be the previous move and set the current to be empty
    previousMove = currentMove;
    currentMove = new Array(2);
}

// This is the function that runs when a tile is clicked
function clickSquare(e) {
    let elementClicked = e.target;
    let tileClicked = elementClicked.id;

    if (currentMove[0] == undefined) {
        // If there are no tiles selected for the current move, select this one if there is a piece there
        let index = notationToArrayIndex(tileClicked);
        
        if (board[index.x][index.y]) {
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