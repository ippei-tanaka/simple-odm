import co from 'co';
import { expect } from 'chai';
import { Types, isValidValueAs, isTypeObject } from '../../src/type';
import { ObjectID } from 'mongodb';

describe('Type', function () {

    describe('.isTypeObject(value)', () => {
        it('should check if value is a type object.', (done) => {
            co(function* () {
                expect(isTypeObject(Types.String)).to.be.true;
                expect(isTypeObject(Types.Integer)).to.be.true;
                expect(isTypeObject("String")).to.be.false;
                done();
            }).catch((e) => {
                done(e);
            });
        });
    });

    describe('.isValidValueAs(value, type)', () => {
        it('should check if value is valid as a given type.', (done) => {
            co(function* () {
                expect(isValidValueAs("test", Types.String)).to.be.true;
                expect(isValidValueAs(0, Types.String)).to.be.false;
                expect(isValidValueAs({}, Types.String)).to.be.false;
                expect(isValidValueAs(0, Types.Integer)).to.be.true;
                expect(isValidValueAs(1.0, Types.Integer)).to.be.true;
                expect(isValidValueAs("0", Types.Integer)).to.be.false;
                expect(isValidValueAs(1.2, Types.Integer)).to.be.false;
                expect(isValidValueAs(new Date(), Types.Date)).to.be.true;
                expect(isValidValueAs("date", Types.Date)).to.be.false;
                expect(isValidValueAs({}, Types.Date)).to.be.false;
                expect(isValidValueAs(ObjectID(), Types.MongoObjectID)).to.be.true;
                expect(isValidValueAs("wwww", Types.MongoObjectID)).to.be.false;
                expect(isValidValueAs({}, Types.MongoObjectID)).to.be.false;
                expect(isValidValueAs(10, Types.MongoObjectID)).to.be.true;
                expect(isValidValueAs("95ecc380-afe9-11e4-9b6c-751b66dd541e", Types.UUID)).to.be.true;
                expect(isValidValueAs(10, Types.UUID)).to.be.false;
                expect(isValidValueAs({}, Types.UUID)).to.be.false;
                expect(isValidValueAs("090", Types.UUID)).to.be.false;
                done();
            }).catch((e) => {
                done(e);
            });
        });
    });

});