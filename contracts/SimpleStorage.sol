// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SimpleStorage {
    uint256 private _storedData;
    address public owner;
    
    event ValueStored(address indexed storer, uint256 value);
    event ValueReset(address indexed reseter);
    
    constructor() {
        owner = msg.sender;
    }
    
    function set(uint256 value) public {
        _storedData = value;
        emit ValueStored(msg.sender, value);
    }
    
    function get() public view returns (uint256) {
        return _storedData;
    }
    
    function reset() public {
        require(msg.sender == owner, "Only owner can reset");
        _storedData = 0;
        emit ValueReset(msg.sender);
    }
    
    function transferOwnership(address newOwner) public {
        require(msg.sender == owner, "Only owner can transfer");
        require(newOwner != address(0), "Invalid address");
        owner = newOwner;
    }
}
