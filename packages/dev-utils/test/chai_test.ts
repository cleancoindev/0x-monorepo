import { StringRevertError } from '@0x/utils';
import * as chai from 'chai';

import { chaiSetup } from '../src';

chaiSetup.configure();
const expect = chai.expect;

class DescendantRevertError extends StringRevertError {
    constructor(msg: string) {
        super(msg);
    }
}

describe('Chai tests', () => {
    describe('RevertErrors', () => {
        describe('#equal', () => {
            it('should equate two identical RevertErrors', () => {
                const message = 'foo';
                const revert1 = new StringRevertError(message);
                const revert2 = new StringRevertError(message);
                expect(revert1).is.equal(revert2);
            });
            it('should equate two RevertErrors where one has missing fields', () => {
                const revert1 = new StringRevertError('foo');
                const revert2 = new StringRevertError();
                expect(revert1).is.equal(revert2);
            });
            it('should not equate two RevertErrors with diferent fields', () => {
                const revert1 = new StringRevertError('foo1');
                const revert2 = new StringRevertError('foo2');
                expect(revert1).is.not.equal(revert2);
            });
            it('should not equate two RevertErrors with diferent types', () => {
                const message = 'foo';
                const revert1 = new StringRevertError(message);
                const revert2 = new DescendantRevertError(message);
                expect(revert1).is.not.equal(revert2);
            });
            it('should equate a StringRevertError to a string equal to message', () => {
                const message = 'foo';
                const revert = new StringRevertError(message);
                expect(message).is.equal(revert);
            });
            it('should equate an Error to a StringRevertError with an equal message', () => {
                const message = 'foo';
                const revert = new StringRevertError(message);
                const error = new Error(message);
                expect(error).is.equal(revert);
            });
            it('should equate a string to a StringRevertError with the same message', () => {
                const message = 'foo';
                const revert = new StringRevertError(message);
                expect(revert).is.equal(message);
            });
            it('should not equate a StringRevertError to a string not equal to message', () => {
                const revert = new StringRevertError('foo1');
                expect('foo2').is.not.equal(revert);
            });
            it('should not equate a string to a StringRevertError with a different message', () => {
                const revert = new StringRevertError('foo1');
                expect(revert).is.not.equal('foo2');
            });
            it('should not equate an Error to a StringRevertError with a different message', () => {
                const revert = new StringRevertError('foo1');
                const error = new Error('foo2');
                expect(error).is.not.equal(revert);
            });
        });
        describe('#rejectedWith', () => {
            it('should equate a promise that rejects to an identical RevertErrors', async () => {
                const message = 'foo';
                const revert1 = new StringRevertError(message);
                const revert2 = new StringRevertError(message);
                const promise = (async () => {
                    throw revert1;
                })();
                return expect(promise).to.be.rejectedWith(revert2);
            });
            it('should not equate a promise that rejects to a StringRevertError with a different messages', async () => {
                const revert1 = new StringRevertError('foo1');
                const revert2 = new StringRevertError('foo2');
                const promise = (async () => {
                    throw revert1;
                })();
                return expect(promise).to.not.be.rejectedWith(revert2);
            });
            it('should not equate a promise that rejects to different RevertError types', async () => {
                const message = 'foo';
                const revert1 = new StringRevertError(message);
                const revert2 = new DescendantRevertError(message);
                const promise = (async () => {
                    throw revert1;
                })();
                return expect(promise).to.not.be.rejectedWith(revert2);
            });
        });
        describe('#become', () => {
            it('should equate a promise that resolves to an identical RevertErrors', async () => {
                const message = 'foo';
                const revert1 = new StringRevertError(message);
                const revert2 = new StringRevertError(message);
                const promise = (async () => revert1)();
                return expect(promise).to.become(revert2);
            });
            it('should not equate a promise that resolves to a StringRevertError with a different messages', async () => {
                const revert1 = new StringRevertError('foo1');
                const revert2 = new StringRevertError('foo2');
                const promise = (async () => revert1)();
                return expect(promise).to.not.become(revert2);
            });
            it('should not equate a promise that resolves to different RevertError types', async () => {
                const message = 'foo';
                const revert1 = new StringRevertError(message);
                const revert2 = new DescendantRevertError(message);
                const promise = (async () => revert1)();
                return expect(promise).to.not.become(revert2);
            });
        });
    });
});
