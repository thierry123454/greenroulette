// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

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
    AggregatorV3Interface internal priceFeed;

    event BettingClosed(uint256 closedAt);

    // House deploys contract.
    constructor() {
        house_addr = msg.sender;
        temporaryBalance = address(this).balance;
        totalDonated = 0;
        priceFeed = AggregatorV3Interface(0x694AA1769357215DE4FAC081bf1f309aDC325306);
    }

    // Function to get the current ETH/USD price
    function getLatestPrice() public view returns (uint256) {
        (,int price,,,) = priceFeed.latestRoundData();
        return uint256(price / 1e8);  // Price feed returns with 8 decimal places
    }

    // Function to convert ETH amount to USD amount
    function ethToUsd(uint256 ethAmount) public view returns (uint256) {
        uint256 ethPrice = getLatestPrice();
        return (ethAmount * ethPrice) / 1e18;  // Convert wei to ether
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

    function payoutWinners(uint8 outcome_game) external onlyOwner {
        require(block.timestamp >= bettingClosesAt, "Betting period has not ended yet");

        // First, determine payouts and update the state before any transfers.
        uint256[] memory payouts = new uint256[](bettors.length);
        for (uint i = 0; i < bettors.length; i++) {
            address bettor = bettors[i];
            if (playerBets[bettor].guess == outcome_game) {
                payouts[i] = playerBets[bettor].amount * 2;
            }
            delete playerBets[bettor];  // Cleanup state upfront
        }

        // After state is cleaned up, then transfer payouts
        for (uint i = 0; i < bettors.length; i++) {
            if (payouts[i] > 0) {
                payable(bettors[i]).transfer(payouts[i]);
            }
        }

        temporaryBalance = address(this).balance;

        delete bettors;  // Clear list of bettors after all operations are complete
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
        uint256 donationUsd = ethToUsd(charityShare);

        totalDonated += donationUsd;

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

    // Get nummber of bets
    function getNumberOfBets() external view returns(uint) {
        return bettors.length;
    }

    // View total amount donated in USD
    function getTotalDonated() external view returns(uint) {
        return totalDonated;
    }

    receive() external payable {}
}