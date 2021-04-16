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


// Create a representation of the board
let board = new Array();

// Note which spaces are currently selected, and which ones were selected in the previous move
let previousMove = new Array(2);
let currentMove = new Array(2);

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
        allTiles[i].style.backgroundImage = ''
    }

    // Loop through every space in the JS board and set background images accordingly
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            if (board[i][j]) {
                let currentPiece = board[i][j];
                
                let currentPosition = currentPiece.position;
                let currentNotation = currentPosition['x'] + String(currentPosition['y']);
                let currentTile = document.getElementById(currentNotation);

                let imageLocation = 'url("/images/' + currentPiece.type + currentPiece.color + '.svg")'

                currentTile.style.backgroundImage = imageLocation;
            } 
        }
    }
}

// This function resets the board.
function resetBoard() {
    // Set the board to be empty (really only neccesary if there's anything already in it; i.e., not the first time)
    board = []
    // Create 8 rows of 8 (empty) items each
    for (let i = 0; i < 8; i++) {
        board[i] = new Array(8);
    }

    // Set all of the initial pieces on the board
    board[0][0] = new chessPiece('a', 1, 'r', 'w');
    board[0][1] = new chessPiece('b', 1, 'n', 'w');
    board[0][2] = new chessPiece('c', 1, 'b', 'w');
    board[0][3] = new chessPiece('d', 1, 'q', 'w');
    board[0][4] = new chessPiece('e', 1, 'k', 'w');
    board[0][5] = new chessPiece('f', 1, 'b', 'w');
    board[0][6] = new chessPiece('g', 1, 'n', 'w');
    board[0][7] = new chessPiece('h', 1, 'r', 'w');

    // This allows us to quickly look up which file we are in from a number
    let fileLetters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

    // These are full rows of (nearly) identical pawns, so it's fairly simple to just loop through them.
    for (let i = 0; i < 8; i++) {
        board[1][i] = new chessPiece(fileLetters[i], 2, 'p', 'w')
    }

    for (let i = 0; i < 8; i++) {
        board[6][i] = new chessPiece(fileLetters[i], 7, 'p', 'b')
    }
    
    board[7][0] = new chessPiece('a', 8, 'r', 'b');
    board[7][1] = new chessPiece('b', 8, 'n', 'b');
    board[7][2] = new chessPiece('c', 8, 'b', 'b');
    board[7][3] = new chessPiece('d', 8, 'q', 'b');
    board[7][4] = new chessPiece('e', 8, 'k', 'b');
    board[7][5] = new chessPiece('f', 8, 'b', 'b');
    board[7][6] = new chessPiece('g', 8, 'n', 'b');
    board[7][7] = new chessPiece('h', 8, 'r', 'b');

    // Make the pieces actually show up
    // This is probably somewhat inefficient (as noted above), but it's simple.
    synchronizeBoardState();
}

// Actually use the function above to reset the board
resetBoard();

function movePiece() {

}

function clickSquare(e) {
    let tileClicked = e.target.id;

    if (currentMove == new Array(2)) {
        currentMove[0] = tileClicked;
    } else if (tileClicked == currentMove[0]) {
        currentMove = new Array(2);
    } else {
        currentMove[1] = tileClicked;
        movePiece();
    }

    // Move the piece
    movePiece();
}

// Run a function when the board is clicked
document.getElementById('board').addEventListener('click', clickSquare);