// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Roulette {
    address private house_addr;

    // Outcome & Meaning: 0 = Red, 1 = Black, 2 = Green
    uint8 private outcome;
    bool private outcomeSet = false;
    uint256 public temporaryBalance;

    // Betting details
    struct BetDetails {
        uint256 amount;
        uint8 guess;
    }

    mapping(address => BetDetails) public playerBets;
    address[] public bettors;  // Array to keep track of all bettors

    event BetPlaced(address indexed player, uint256 amount, uint8 guess);

    // House deploys contract.
    constructor() {
        house_addr = msg.sender;
        temporaryBalance = address(this).balance;
    }

    modifier onlyOwner() {
        require(msg.sender == house_addr, "Only owner can call this function.");
        _;
    }

    // Function which house can use to supply funding to the pool.
    function housePay() external payable onlyOwner {
        temporaryBalance += msg.value;
    }

    // Function which house can use to set the outcome of the game.
    function setOutcome(uint8 outcome_game) external onlyOwner {
        outcome = outcome_game;
        outcomeSet = true;
    }

    // Pay house in case of security breach or transfer of funds.
    function withdraw() external onlyOwner {
        payable(house_addr).transfer(address(this).balance);
    }

    // Set bet
    function setBet (uint8 _guess) external payable {
        require(msg.value > 0, "Bet amount must be greater than zero.");
        require(temporaryBalance > msg.value, "Pool has insufficient funds for this bet. Bet with a lower amount or wait for more funding.");
        require(_guess <= 1, "Invalid guess.");
        require(playerBets[msg.sender].amount == 0, "You are not allowed to place two bets.");

        bettors.push(msg.sender);

        // Storing the bet details in the mapping
        playerBets[msg.sender] = BetDetails({
            amount: msg.value,
            guess: _guess
        });

        temporaryBalance -= msg.value;

        emit BetPlaced(msg.sender, msg.value, _guess);
    }

    // Payout winners once the outcome has been decided.
    function payoutWinners() external onlyOwner {
        require(outcomeSet, "Outcome of the game has to be decided.");

        for (uint i = 0; i < bettors.length; i++) {
            address bettor = bettors[i];

            if (playerBets[bettor].guess == outcome) {
                payable(bettor).transfer(playerBets[bettor].amount * 2);
            }

            delete playerBets[bettor];
        }

        outcomeSet = false;
        temporaryBalance = address(this).balance;

        delete bettors;
    }

    // View balance of pool.
    function viewPool() external view returns(uint256){
        return address(this).balance;
    }

    receive() external payable {}
}