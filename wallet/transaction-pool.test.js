const Wallet = require(".");
const Transaction = require("./transaction");
const TransactionPool = require("./transaction-pool");
const Blockchain = require("../blockchain");


describe("TransactionPool", () => {
    let transactionPool, transaction, senderWallet;

    beforeEach(() => {
        transactionPool = new TransactionPool();
        senderWallet = new Wallet()
        transaction = new Transaction({
            senderWallet,
            recipient: "fake-person",
            amount: 50
        });
    });

    describe("setTransaction()", () => {
        it("adds a transaction", () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.transactionMap[transaction.id])
                .toEqual(transaction);
        });
    });

    describe("existingTransaction()", () => {
        it("returns an existing transaction given an input address", () => {
            transactionPool.setTransaction(transaction);

            expect(transactionPool.existingTransaction({ inputAddress: senderWallet.publicKey }))
                .toBe(transaction);
        });
    });

    describe("validTransactions()", () => {
        let validTransactions, errMock;

        beforeEach(() => {
            validTransactions = [];
            errMock = jest.fn();

            global.console.error = errMock;

            for (let i=0; i<10; i++) {
                transaction = new Transaction({senderWallet, recipient: "any", amount: 30});

                if (i % 3 === 0) {
                    transaction.input.amount = 893247;
                } else if (i % 3 === 1) {
                    transaction.input.signature = new Wallet().sign("foo");
                } else {
                    validTransactions.push(transaction);
                }

                transactionPool.setTransaction(transaction);
            }
        })

        it("returns the valid transactions", () => {
            expect(transactionPool.validTransactions()).toEqual(validTransactions);
        })

        it("logs errors for invalid transactions", () => {
            transactionPool.validTransactions();
            expect(errMock).toHaveBeenCalled();
        })
    });

    describe("clear()", () => {
        it("clears the transactions", () => {
            transactionPool.clear();

            expect(transactionPool.transactionMap).toEqual({});
        });
    });

    describe("clearBlockchainTransaction()", () => {
        it("clears the pool of any existing blockchain transactions", () => {
            const blockchain = new Blockchain();
            const expectedTransactionMap = {};

            for(let i=0; i<6; i++) {
                const transaction = new Wallet().createTransaction({
                    recipient: "foo",
                    amount: 20
                });

                transactionPool.setTransaction(transaction);

                if (i%2===0) {
                    blockchain.addBlock({ data: [transaction] });
                } else {
                    expectedTransactionMap[transaction.id] = transaction;
                }
            }

            transactionPool.clearBlockchainTransactions({ chain: blockchain.chain });
            expect(transactionPool.transactionMap).toEqual(expectedTransactionMap);
        });
    })
});
