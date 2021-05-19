const Wallet = require("./index");
const Transaction = require('./transaction')
const { verifySignature } = require("../util")

describe("Wallet", () => {
    let wallet;

    beforeEach(() => {
        wallet = new Wallet();
    });

    it("has a balance", () => {
        expect(wallet).toHaveProperty('balance');
    });

    it("has a publicKey", () => {
        expect(wallet).toHaveProperty('publicKey');
    });

    describe("Signing data", () => {
        const data = "foo-bar";

        it("verifies a signiture", () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: wallet.sign(data)
                })
            ).toBe(true);
        });

        it("does not verify an invalid signiture", () => {
            expect(
                verifySignature({
                    publicKey: wallet.publicKey,
                    data,
                    signature: new Wallet().sign(data)
                })
            ).toBe(false);
        });
    });

    describe("createTransaction", () => {
        describe("and the amount exceeds the balance", () => {
            it("throws an error", () => {
                expect(() => {
                    wallet.createTransaction({ amount: 99999, recipient: "YOU" })
                }).toThrow("Amount exceeds the balance");
            });
        });

        describe("and the amount is valid", () => {
            let transaction, amount, recipient;

            beforeEach(() => {
                amount = 50,
                recipient = "aRecipient",
                transaction = wallet.createTransaction({ amount, recipient })
            })

            it("creates an instance of Transaction", () => {
                expect(transaction instanceof Transaction).toBe(true);
            });

            it("matches the transaction input with the wallet", () => {
                expect(transaction.input.address).toEqual(wallet.publicKey);
            });

            it("outputs the amount the recipient", () => {
                expect(transaction.outputMap[recipient]).toEqual(amount);
            });
        });
    });
});