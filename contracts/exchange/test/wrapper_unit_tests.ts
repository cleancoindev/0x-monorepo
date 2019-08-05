import {
    blockchainTests,
    constants,
    describe,
    expect,
    hexRandom,
} from '@0x/contracts-test-utils';
import { OrderInfo, OrderStatus, OrderWithoutDomain as Order } from '@0x/types';
import { BigNumber } from '@0x/utils';
import * as ethjs from 'ethereumjs-util';
import * as _ from 'lodash';

import {
    artifacts,
    TestWrapperFunctionsContract,
    TestWrapperFunctionsFillOrderCalledEventArgs as FillOrderCalledEventArgs,
} from '../src';

blockchainTests.only('Exchange wrapper functions unit tests.', env => {
    const { ONE_ETHER } = constants;
    const randomAddress = () => hexRandom(constants.ADDRESS_LENGTH);
    const randomAssetData = () => hexRandom(34);
    const randomAmount = () => ONE_ETHER.times(_.random(0, 100, true).toFixed(10));
    const randomTimestamp = () => new BigNumber(Math.floor(_.now() / 1000) + _.random(0, 34560));
    const randomSalt = () => new BigNumber(hexRandom(constants.WORD_LENGTH).substr(2), 16);
    let testContract: TestWrapperFunctionsContract;

    before(async () => {
        testContract = await TestWrapperFunctionsContract.deployFrom0xArtifactAsync(
            artifacts.TestWrapperFunctions,
            env.provider,
            env.txDefaults,
        );
    });

    function createRandomOrder(fields?: Partial<Order>): Order {
        return _.assign({
            makerAddress: randomAddress(),
            takerAddress: randomAddress(),
            feeRecipientAddress: randomAddress(),
            senderAddress: randomAddress(),
            takerAssetAmount: randomAmount(),
            makerAssetAmount: randomAmount(),
            makerFee: randomAmount(),
            takerFee: randomAmount(),
            expirationTimeSeconds: randomTimestamp(),
            salt: randomSalt(),
            makerAssetData: randomAssetData(),
            takerAssetData: randomAssetData(),
            makerFeeAssetData: randomAssetData(),
            takerFeeAssetData: randomAssetData(),
        }, fields);
    }

    // Computes the expected (fake) order hash generated by the `TestWrapperFunctions` contract.
    function getExpectedOrderHash(order: Order): string {
        // It's just `keccak256(order.salt)`.
        return ethjs.bufferToHex(ethjs.sha3(ethjs.toBuffer(`0x${order.salt.toString(16)}`)));
    }

    describe('getOrdersInfo', () => {
        // Computes the expected (fake) order info generated by the `TestWrapperFunctions` contract.
        function getExpectedOrderInfo(order: Order): OrderInfo {
            const MAX_ORDER_STATUS = OrderStatus.Cancelled;
            return {
                orderHash: getExpectedOrderHash(order),
                // Lower uint128 of `order.salt` is the `orderTakerAssetFilledAmount`.
                orderTakerAssetFilledAmount: order.salt.mod(new BigNumber(2).pow(128)),
                // High byte of `order.salt` is the `orderStatus`.
                orderStatus: order.salt.dividedToIntegerBy(
                    new BigNumber(2).pow(248)).toNumber() % (MAX_ORDER_STATUS + 1),
            };
        }

        it('works with no orders', async () => {
            const infos = await testContract.getOrdersInfo.callAsync([]);
            expect(infos.length).to.eq(0);
        });

        it('works with one order', async () => {
            const orders = [ createRandomOrder() ];
            const expected = orders.map(getExpectedOrderInfo);
            const actual = await testContract.getOrdersInfo.callAsync(orders);
            expect(actual).to.deep.eq(expected);
        });

        it('works with multiple orders', async () => {
            const NUM_ORDERS = 7;
            const orders = _.times(NUM_ORDERS, () => createRandomOrder());
            const expected = orders.map(getExpectedOrderInfo);
            const actual = await testContract.getOrdersInfo.callAsync(orders);
            expect(actual).to.deep.eq(expected);
        });
    });
});