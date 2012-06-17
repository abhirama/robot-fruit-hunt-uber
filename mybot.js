//Global variables
var probableMove;
var currentType;

function new_game() {
    //This is needed when we reset the game without refreshing the page.
    probableMove = null;
    currentType = null;
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

        sortObjectsAsc(moves, 'distance');
        return moves;
    }

    this.moves = this.getFruitMoves();

    this.minimumSweepMoves = 0;
    
    if (this.moves.length) {
        this.minimumSweepMoves = getMinimumSweepMoves(this);
    }
        

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

    /*
    function getMinimumSweepMoves(fruitType) {
        var sortedMoves = fruitType.moves;
        var nearestMove = sortedMoves[0];

        var sortedMoves = copy(sortedMoves);

        sortedMoves.splice(0, 1);

        var perms = getAllPermutations(sortedMoves);

        var len = perms.length;
        var i = 0;
        var elem;
        var traversalDistances = [];
        var minTraversalDistance = 0;

        var map = {};
        if (len > 1) {
            for (i = 0; i < len; ++i) {
                elem = perms[i];
                elem.unshift(nearestMove);
                traversalDistances.push(getTraversalDistance(elem));
            }

            traversalDistances.sort();
            minTraversalDistance = traversalDistances[0];
        }


        var sweepMoves = nearestMove.distance + minTraversalDistance + fruitType.onBoardCount;

        //console.log(sweepMoves);
        return sweepMoves;

        //Assumes moves has greater than one element
        function getTraversalDistance(moves) {
            var i = 0;
            var len = moves.length - 1;
            //console.log('Len:' + len);
            var move;

            var traversalDistance = 0;
            for (i = 0; i < len; ++i) {
                traversalDistance = traversalDistance + getMove(moves[i].destinationNode, moves[i + 1].destinationNode).distance;    
            }

            return traversalDistance;

        }

    }*/

    function getMinimumSweepMoves(fruitType) {
        //console.log('-------------------start----------------------------');
        //console.log("Length:" + fruitType.moves.length);
        //console.log('---Moves start---');
        var sortedMoves = copy(fruitType.moves);
        //console.dir(sortedMoves);
        //console.log('---Moves end---');

        var len = sortedMoves.length;
        var elem;
        var i = 0, j = 0;
        var visited = [sortedMoves[0]];
        var underCalculation;
        delete sortedMoves[0];

        var map = {};
        var index, distance;
        var seletedIndex, smallestDistance;
        var sweepDistance = 0;

        var noOfMovesToConsider = Math.round(fruitType.totalCount / 2);

        if (fruitType.moves.length > 1) {
            for (i = 0; i < len; ++i) {
                underCalculation = visited[visited.length - 1];
                //console.log('This length is:' + visited.length);
                //console.dir(underCalculation);
                map = {};
                smallestDistance = Number.POSITIVE_INFINITY;

                for (j = 0; j < len; ++j) {
                    elem = sortedMoves[j];
                    if (elem == undefined) {
                        continue;
                    }

                    distance = getMove(underCalculation.destinationNode, elem.destinationNode).distance;

                    map[j] = distance;
                }

                //console.log('Map is:');
                //console.dir(map);

                for (index in map) {
                    distance = map[index];

                    if (distance < smallestDistance) {
                        smallestDistance = distance;
                        seletedIndex = index;
                    }
                }

                sweepDistance = sweepDistance + smallestDistance;
                //console.log('Pushing this, index is:' + seletedIndex);
                //console.dir(sortedMoves[seletedIndex]);
                visited.push(sortedMoves[seletedIndex]);
                delete sortedMoves[seletedIndex];

                if (visited.length >= noOfMovesToConsider) {
                    break;
                }
            }
        }
        
        //console.log('Visited length:' + visited.length);

        var sweepMoves = visited[0].distance + sweepDistance + visited.length;
        //console.log('Moves:' + sweepMoves);
        //console.log('-------------------end----------------------------');

        return sweepMoves;
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

function getBestMove(fruitTypes, myNode, opponentNode) {
    var oLen = fruitTypes.length;
    var iLen;
    var fruitType;
    var move;
    var moves;
    var i, j;
    for (i = 0; i < oLen; ++i) {
        fruitType = fruitTypes[i];
        moves = fruitType.moves;
        iLen = moves.length;

        for (j = 0; j < iLen; ++j) {
            move = moves[j]; 

            if (getMove(myNode, move.destinationNode).distance <= getMove(opponentNode, move.destinationNode).distance) {
                return move;
            }
        }
    }

    return null;
}

function make_move() {
    var board = get_board();

    var myNode = new Node(get_my_x(), get_my_y());
    var opponentNode = new Node(get_opponent_x(), get_opponent_y());

    var types = getAllFruitTypes();

    var len = types.length;
    var type;
    var fruitTypes = [];
    var fruitType;

    var fruitTypesDict = {};

    for (var x = 0; x < len; ++x) {
        type = types[x];    
        fruitType = new FruitType(type);

        if (!fruitType.shouldPickThisFruit()) {
            continue;
        }

        fruitTypes.push(fruitType);

        fruitTypesDict[type] = fruitType;
    }

    if (!fruitTypes.length) {
        return PASS;
    }

    //console.dir(fruitTypes);

    var bestDirection;
    console.log('Current type is:' + currentType);
    if (currentType && fruitTypesDict[currentType]) {
        bestDirection = getBestDirection();

        if (bestDirection) {
            console.log('Current type is preset');
            debugger;
            return bestDirection;
        }
    }

    sortObjectsAsc(fruitTypes, 'minimumSweepMoves');

    currentType = fruitTypes[0].type;

    bestDirection = getBestDirection();

    if (bestDirection) {
        console.log('Current type is not present');
        debugger;
        return bestDirection;
    }

    //Opponent is closer to all the fruits than us, just move towards the first fruit.
    console.log('Opponent is closer than us');
    debugger;
    return fruitTypes[0].moves[0].direction; 

    function getBestDirection() {
        if (board[myNode.x][myNode.y] == currentType) {
            return TAKE;
        }
        var moves = fruitTypesDict[currentType].moves;
        var move;
        var i = 0;
        var len = moves.length;

        for (i = 0; i < len; ++i) {
            move = moves[i];    

            if (move.distance <= getMove(opponentNode, move.destinationNode).distance) {
                return move.direction;
            }
        }

        return null;
    }
}

function getAllPermutations(ary) {
    var len = ary.length;
    //console.log('Length:' + len);
    var i = 0, j = 0, k = 0;
    var elem, containerElem;
    //console.dir(ary[0]);
    var container = [[ary[0]]];
    var copied;

    /*
    console.log('------------>------------');
    for (i = 0; i < len; ++i) {
        elem = ary[i];
        console.dir(elem);
    }
    console.log('------------>------------');
    */

    for (i = 1; i < len; ++i) {
        //console.log('I is:' + i);
        elem = ary[i];
        copied = copy(container);
        container = [];
        for (j = 0; j < copied.length; ++j) {
            containerElem = copied[j];
            ret = helper(elem, containerElem);

            for (k = 0; k < ret.length; ++k) {
                container.push(ret[k]);
            }
        }
    }

    return container;

    function helper(elem, ary) {
        /*
        console.log('In helper start');
        console.log('Elem is:');
        console.dir(elem);
        console.log('Ary is:');
        console.dir(ary);
        */
        var len = ary.length;
        var elem;

        var container = [];
        var copied;
        for (var i = 0; i < len; ++i) {
            copied = copy(ary);        
            copied.splice(i, 0, elem);
            container.push(copied);
        }
        copied = copy(ary);        
        copied.push(elem);
        container.push(copied);
        /*
        console.log('Result is:');
        console.dir(container);
        console.log('In helper end');
        */
        return container;
    }
}

function copy(ary) {
    var copied = [];
    var len = ary.length;

    for (var i = 0; i < len; ++i) {
        copied.push(ary[i]);
    }
    
    return copied;
}


// Optionally include this function if you'd like to always reset to a 
// certain board number/layout. This is useful for repeatedly testing your
// bot(s) against known positions.
function default_board_number() {
    return 490072;
}
