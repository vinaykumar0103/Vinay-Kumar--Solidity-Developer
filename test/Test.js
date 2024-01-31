const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("AirdropToken", function () {
  let owner;
  let recipient1;
  let recipient2;
  let airdropToken;

  beforeEach(async function () {
    // Get signers
    [owner, recipient1, recipient2] = await ethers.getSigners();

    // Deploy the contract
    const AirdropToken = await ethers.getContractFactory("AirdropToken");
    airdropToken = await AirdropToken.deploy("0xeb68e5fbe0fa33419f8ec88f425ad2a50a59fa12", 100); // Replace "TOKEN_ADDRESS" with the actual token address
    await airdropToken.deployed();
  });

  it("Should allocate tokens correctly", async function () {
    // Get the current airdrop allocation
    const allocationBefore = await airdropToken.airdropQuantity();

    // Change the allocation
    await airdropToken.tokensAllocation(200);

    // Check if allocation changed
    const allocationAfter = await airdropToken.airdropQuantity();
    expect(allocationAfter).to.equal(200);
  });

  it("Should transfer tokens to recipients", async function () {
    // Get initial balances
    const balanceBeforeOwner = await airdropToken.token().balanceOf(await owner.getAddress());
    const balanceBeforeRecipient1 = await airdropToken.token().balanceOf(await recipient1.getAddress());
    const balanceBeforeRecipient2 = await airdropToken.token().balanceOf(await recipient2.getAddress());

    // Transfer tokens
    await airdropToken.transferTokens([
      await recipient1.getAddress(),
      await recipient2.getAddress(),
    ]);

    // Check balances after transfer
    const balanceAfterOwner = await airdropToken.token().balanceOf(await owner.getAddress());
    const balanceAfterRecipient1 = await airdropToken.token().balanceOf(await recipient1.getAddress());
    const balanceAfterRecipient2 = await airdropToken.token().balanceOf(await recipient2.getAddress());

    // Check if tokens were transferred correctly
    expect(balanceAfterOwner).to.equal(balanceBeforeOwner - 200);
    expect(balanceAfterRecipient1).to.equal(balanceBeforeRecipient1 + 100);
    expect(balanceAfterRecipient2).to.equal(balanceBeforeRecipient2 + 100);
  });
});
