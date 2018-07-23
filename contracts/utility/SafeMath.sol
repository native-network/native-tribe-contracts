pragma solidity ^0.4.23;

/*
    Safe Addition and Subtraction
*/
contract SafeMath {
    /**
    @dev returns the sum of _x and _y, asserts if the calculation overflows
    @param _x   value 1
    @param _y   value 2
    @return sum
    */
    function safeAdd(uint256 _x, uint256 _y) internal pure returns (uint256) {
        uint256 z = _x + _y;
        assert(z >= _x);
        return z;
    }

    /**
    @dev returns the difference of _x minus _y, asserts if the subtraction results in a negative number
    @param _x   minuend
    @param _y   subtrahend
    @return difference
    */
    function safeSub(uint256 _x, uint256 _y) internal pure returns (uint256) {
        assert(_x >= _y);
        return _x - _y;
    }
}