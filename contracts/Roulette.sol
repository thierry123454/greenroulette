// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

contract Roulette {
    address private house_addr;
    uint256 public bettingClosesAt;

    // Outcome & Meaning: 0 = Red, 1 = Black, 2 = Green
    uint256 public temporaryBalance;

    // Betting details
    struct BetDetails {
        uint256 amount;
        uint8 guess;
    }

    mapping(address => BetDetails) public playerBets;
    address[] public bettors;  // Array to keep track of all bettors

    event BetPlaced(address indexed player, uint256 amount, uint8 guess);
    event BettingClosed(uint256 closedAt);

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

    // Function which house can use to open the betting round.
    function openBetting() external onlyOwner {
        bettingClosesAt = block.timestamp + 2 minutes;  // Betting open for 2 minutes
        emit BettingClosed(bettingClosesAt);  // Emit event with the future close time
    }

    // Pay house in case of security breach or transfer of funds.
    function withdraw() external onlyOwner {
        payable(house_addr).transfer(address(this).balance);
    }

    // Set bet
    function setBet (uint8 _guess) external payable {
        require(block.timestamp < bettingClosesAt, "Betting is closed");
        require(_guess <= 1, "Invalid guess.");
        require(msg.value > 0 && temporaryBalance > msg.value, "Bet amount invalid or pool low");
        require(playerBets[msg.sender].amount == 0, "Already placed bet");

        bettors.push(msg.sender);

        // Storing the bet details in the mapping
        playerBets[msg.sender] = BetDetails({
            amount: msg.value,
            guess: _guess
        });

        temporaryBalance -= msg.value;

        emit BetPlaced(msg.sender, msg.value, _guess);
    }

    // Set outcome and payout winners.
    function payoutWinners(uint8 outcome_game) external onlyOwner {
        require(block.timestamp >= bettingClosesAt, "Betting period has not ended yet");

        for (uint i = 0; i < bettors.length; i++) {
            address bettor = bettors[i];

            if (playerBets[bettor].guess == outcome_game) {
                payable(bettor).transfer(playerBets[bettor].amount * 2);
            }

            delete playerBets[bettor];
        }

        temporaryBalance = address(this).balance;

        delete bettors;
    }

    // View balance of pool.
    function viewPool() external view returns(uint256){
        return address(this).balance;
    }

    receive() external payable {}
}