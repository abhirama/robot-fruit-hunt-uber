function new_game() {
}

//Global variables
var probableMove;

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

    //Pick this fruit only if we have the chance of gathering more than the opponent
    this.shouldPickThisFruit = function() {
        //We have more than enough to win
        if (this.myCount > (this.totalCount / 2)) {
            return false;
        }

        //We do not have a chance of maxing this fruit category, hence do not waste a move picking it
        if (this.opponentCount > (this.totalCount / 2)) {
            return false;
        }

        if (this.myCount == (this.totalCount / 2)) {
            if (this.opponentCount != (this.totalCount / 2)) {
                //We have a chance to max this category, hence pick this fruit
                return true;
            } else {
                return false;
            }
        }

        return true;
    }
}

function sortObjectsAsc(ary, field) {
    ary.sort(function(a, b) {
        return a[field] - b[field];
    });

    return ary;
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
    return new Move(fruitNode, distance, direction);
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

function Move(destinationNode, distance, direction) {
    this.destinationNode = destinationNode;
    this.distance = distance;
    this.direction = direction;
}


function make_move() {
    var board = get_board();


    var types = getAllFruitTypes();

    var len = types.length;
    var type;
    var fruitTypes = [];
    var fruitType;

    var fruitTypesDict = {};

    for (var x = 0; x < len; ++x) {
        type = types[x];    
        fruitType = new FruitType(type);

        if (!fruitType.moves.length) {
            continue;
        }

        if (!fruitType.shouldPickThisFruit()) {
            continue;
        }

        fruitTypes.push(fruitType);

        fruitTypesDict[type] = fruitType;
    }

    var currentType = board[get_my_x()][get_my_y()];

    if (currentType && fruitTypesDict[currentType]) {
        return TAKE;
    }

    sortObjectsAsc(fruitTypes, 'totalCount');

    if (!fruitTypes.length) {
        return PASS;
    }

    var moves = fruitTypes[0].moves;

    sortObjectsAsc(moves, 'distance');

    if (!moves.length) {
        return PASS;
    }

    return moves[0].direction;

    /*
   var board = get_board();

   // we found an item! take it!

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
//function default_board_number() {
//    return 287190;
//}
