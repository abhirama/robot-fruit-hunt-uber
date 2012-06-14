function new_game() {
}

function FruitType(type) {
    this.type = type;
    this.totalCount = get_total_item_count(type);
    this.myCount = get_my_item_count(type);
    this.opponentCount = get_opponent_item_count(type);
    this.onBoardCount = this.totalCount - this.myCount - this.opponentCount;

    this.getFruitMoves = function() {
        var board = get_board();
        var myPosition = new Node(get_my_x(), get_my_y());

        var x = 0, y = 0;
        var moves = [];
        for (x = 0; x < WIDTH; ++x) {
            for (y = 0; y < HEIGHT; ++y) {
                if (board[x][y] == this.type) {
                    moves.push(getMove(myPosition, new Node(x, y)));
                }
            }
        }

        return moves;
    }

    this.moves = this.getFruitMoves();
}

function getMove(roboNode, fruitNode) {
    var roboX = roboNode.x, roboY = roboNode.y, fruitX = fruitNode.x, fruitY = fruitNode.y;
    //assumes that the fruit and robo are not on the same square
    var distance = 0;
    var direction= PASS;
    if (roboY == fruitY) { //they are on the same row
        if (roboX > fruitX) { 
            distance = roboX - fruitX;
            direction = WEST;
        } else {
            distance = fruitX - roboX;
            direction = EAST;
        }
    }

    if (roboX == fruitX) { //they are on the same column
        if (roboY > fruitY) {
            distance = roboY - fruitY;
            direction = NORTH;
        } else {
            distance = fruitY - roboY;
            direction = SOUTH;
        }
    }

    if ((fruitX > roboX) && (fruitY < roboY)) { //fruit upper right
        distance = fruitX - roboX + roboY - fruitY;
        direction = EAST;
    }

    if ((fruitX > roboX) && (fruitY > roboY)) { //fruit lower right
        distance = fruitX - roboX + fruitY - roboY;
        direction = EAST;
    }

    if ((fruitX < roboX) && (fruitY > roboY)) { //fruit lower left 
        distance = roboX - fruitX + fruitY - roboY;
        direction = WEST;
    }

    if ((fruitX < roboX) && (fruitY < roboY)) { //fruit upper left
        distance = roboX - fruitX + roboY - fruitY;
        direction = WEST;
    }

    ////console.log('Distance=' + distance + ', Direction=' + direction);
    return new Move(fruitNode, distance);
}

function getAllFruitTypes() {
    var typeCount = get_number_of_item_types();

    var types = [];
    for (var i = 1; i <= typeCount; ++i) {
        types.push(i)    
    }

    return types;
}

function Node(x, y) {
    this.x = x;
    this.y = y;

    var that = this;

    this.equal = function(node) {
        return (that.x == node.x) && (that.y == node.y);
    }
}

function Move(destinationNode, distance) {
    this.destinationNode = destinationNode;
    this.distance = distance;
}


function make_move() {
    var types = getAllFruitTypes();

    var len = types.length;
    var type;
    for (var x = 0; x < len; ++x) {
        type = types[x];    
        console.dir(new FruitType(type));
    }

    ksdjfldlk

    /*
   var board = get_board();

   // we found an item! take it!
   if (board[get_my_x()][get_my_y()] > 0) {
       return TAKE;
   }

   var rand = Math.random() * 4;

   if (rand < 1) return NORTH;
   if (rand < 2) return SOUTH;
   if (rand < 3) return EAST;
   if (rand < 4) return WEST;

   return PASS;
   */
}

// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
//
function default_board_number() {
    return 287190;
}
