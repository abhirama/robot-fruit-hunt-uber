//Global variables
var probableMove;
var maxCountFruit;

function new_game() {
    //This is needed when we reset the game without refreshing the page.
    probableMove = null;
    maxCountFruit = null;

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

    this.minimumSweepDistance = 0;
    this.minimumSweepMoves = null;
    
    if (this.moves.length) {
        var minimumSweepDistanceAndMoves = getMinimumSweepDistanceAndMoves(this.moves, this.totalCount, this.myCount);
        //console.log('Minimum sweep distance and moves:' + this.totalCount);
        //console.dir(minimumSweepDistanceAndMoves);
        this.minimumSweepDistance = minimumSweepDistanceAndMoves[0];
        this.minimumSweepMoves = sortObjectsAsc(minimumSweepDistanceAndMoves[1], 'distance');

        //console.dir(this.minimumSweepMoves);
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
    function getMinimumSweepDistanceAndMoves(fruitType) {
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

    function arraySwapElements(ary, index0, index1) {
        var tmp = ary[index0];
        ary[index0] = ary[index1];
        ary[index1] = tmp;

        return ary;
    }

    function getMinimumSweepDistanceAndMoves(moves, totalFruitCount, myCount) {
        var len = moves.length;
        var elem;
        var copied;
        var map = {};
        var sweepDistanceAndMoves;
        for (var i = 0; i < len; ++i) {
            copied = copy(moves);
            copied = arraySwapElements(copied, 0, i);
            sweepDistanceAndMoves = getSweepDistanceAndMoves(copied);

            map[sweepDistanceAndMoves[0]] = sweepDistanceAndMoves[1];
        }

        len = sweepDistanceAndMoves.length;
        var least = Number.POSITIVE_INFINITY;
        for (var distance in map) {
            distance = parseInt(distance);
            if (distance < least) {
                least = distance;
            }
        }

        /*
        console.log('Distance is:' + least);
        console.dir(map);
        */

        return [least, map[least]];

        
        function getSweepDistanceAndMoves(moves) {
            /*
            console.log('-------------------start----------------------------');
            console.log("Length:" + fruitType.moves.length);
            console.log('---Moves start---');
            */
            var sortedMoves = copy(moves);
            /*
            console.dir(sortedMoves);
            console.log('---Moves end---');
            */

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

            var noOfMovesToConsider = Math.round(totalFruitCount / 2) - myCount;

            if ((sortedMoves.length > 1) && (visited.length < noOfMovesToConsider)) {
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

            var minimumSweepDistance = visited[0].distance + sweepDistance + visited.length;
            //console.log('Moves:' + sweepMoves);
            //console.log('-------------------end----------------------------');

            return [minimumSweepDistance, visited];
        }
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

function getCloserToOpponentMoves(fruitTypes, myNode, opponentNode) {
    var fruitTypeLen = fruitTypes.length, movesLen;

    var fruitType, move;
    var closerToOpponent = [];
    var i,j;
    for (i = 0; i < fruitTypeLen; ++i) {
        fruitType = fruitTypes[i];        

        movesLen = fruitType.moves.length;
        for (j = 0; j < movesLen; ++j) {
            move = fruitType.moves[j];

            if (getMove(myNode, move.destinationNode).distance >= getMove(opponentNode, move.destinationNode).distance) {
                closerToOpponent.push(move);
            }
        }
    }

    return closerToOpponent;
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

        sweepMoves = fruitType.minimumSweepMoves;
        iLen = sweepMoves.length;

        for (j = 0; j < iLen; ++j) {
            move = sweepMoves[j];

            if (getMove(myNode, move.destinationNode).distance <= getMove(opponentNode, move.destinationNode).distance) {
                return move;
            }
        }

        if (getCloserToOpponentMoves(fruitTypes, myNode, opponentNode).length) { //More than one fruit is present, hence move towards them even if the opponent is closer
            return sweepMoves[0];
        }


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

    //console.dir(fruitTypes);

    sortObjectsAsc(fruitTypes, 'minimumSweepDistance');

    //populate the max count fruit. This should happen only once, the first time this is called.
    if (!maxCountFruit) {
        sortObjectsAsc(copy(fruitTypes), 'totalCount');
        maxCountFruit = fruitTypes[fruitTypes.length - 1].type;
    }


    if (!fruitTypes.length) {
        return PASS;
    }

    var currentMove = getBestMove(fruitTypes, myNode, opponentNode);

    if (!currentMove) { //Opponent bot is closer to all the fruits.
        currentMove = fruitTypes[0].moves[0]; //Just take the first fruit.
    }

    //If there is no probable move or the fruit that we were planning to move to does not exist on the board now or is not beneficial to us.
    if (!probableMove || !fruitTypesDict[board[probableMove.destinationNode.x][probableMove.destinationNode.y]]) {
        probableMove = currentMove;
    } else {
        //Update probable move
        probableMove = getMove(myNode, probableMove.destinationNode);
    }

    var currentType = board[myNode.x][myNode.y];

    if (currentType) { //We are standing on a fruit
        if (fruitTypesDict[currentType]) { //This fruit is beneficial to us 
            if (probableMove.destinationNode.equal(myNode)) { //This is the node we were planning to move to
                probableMove = null;
                return TAKE;
            } else { //Check as to whether the opponent is at the same distance as us to the node we were planning to move to
                if (probableMove.distance == getMove(opponentNode, probableMove.destinationNode).distance) { //Opponent is at the same distance as us, hence do not pick the current fruit and waste a move
                    return probableMove.direction;    
                } else { //We can afford to take this fruit
                    if (currentType != maxCountFruit ) { //Pick this only if it is not of max count type
                        return TAKE;
                    }
                }
            }
        }
    }

    return probableMove.direction;
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
//function default_board_number() {
//    return 17532;
//    return 528874;
//}
