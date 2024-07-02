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
    
    address[] public charities;
    uint256 public totalDonated;

    event BettingClosed(uint256 closedAt);

    // House deploys contract.
    constructor() {
        house_addr = msg.sender;
        temporaryBalance = address(this).balance;
        totalDonated = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == house_addr, "Only owner can call this function.");
        _;
    }

    // Function which can used to supply funding to the pool.
    function donate() external payable {
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
        require(playerBets[msg.sender].amount == 0, "Already placesd bet");

        bettors.push(msg.sender);

        // Storing the bet details in the mapping
        playerBets[msg.sender] = BetDetails({
            amount: msg.value,
            guess: _guess
        });

        temporaryBalance -= msg.value;
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

    function addCharity(address _charity) external onlyOwner {
        charities.push(_charity);
    }

    function removeCharity(uint index) external onlyOwner {
        require(index < charities.length, "Index out of bounds.");
        for (uint i = index; i < charities.length - 1; i++) {
            charities[i] = charities[i + 1];
        }
        charities.pop();
    }

    function distributeFunds() external onlyOwner {
        require(temporaryBalance > 0, "Insufficient funds");

        uint256 houseShare = temporaryBalance * 1 / 100;
        uint256 charityShare = temporaryBalance * 3 / 100;

        totalDonated += charityShare;

        uint256 perCharityShare = charityShare / charities.length;

        payable(house_addr).transfer(houseShare);

        for (uint i = 0; i < charities.length; i++) {
            payable(charities[i]).transfer(perCharityShare);
        }
        
        temporaryBalance -= houseShare + charityShare;
    }

    // View balance of pool.
    function viewPool() external view returns(uint256){
        return address(this).balance;
    }

    function getNumberOfBets() external view returns(uint) {
        return bettors.length;
    }

    receive() external payable {}
}