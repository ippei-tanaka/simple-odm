import co from 'co';
import { expect } from 'chai';
import Types from '../../src/types';
import typeFunctions from '../../src/type-functions';
import { ObjectID } from 'mongodb';

describe('type', function () {

    describe('.isValidType(value)', () => {
        it('should check if value is a type object.', (done) => {
            co(function* () {
                expect(typeFunctions.isValidType(Types.String)).to.be.true;
                expect(typeFunctions.isValidType(Types.Integer)).to.be.true;
                expect(typeFunctions.isValidType("String")).to.be.false;
                expect(typeFunctions.isValidType([Types.String])).to.be.true;
                expect(typeFunctions.isValidType([0])).to.be.false;
                expect(typeFunctions.isValidType({name: Types.String})).to.be.true;
                expect(typeFunctions.isValidType({name: Types.String, age: Types.Integer})).to.be.true;
                expect(typeFunctions.isValidType({name: "yes"})).to.be.false;
                expect(typeFunctions.isValidType({name: "yes", age: Types.Integer})).to.be.false;
                done();
            }).catch((e) => {
                done(e);
            });
        });
    });

    describe('.isValidValueAs(value, type)', () => {
        it('should check if value is valid as a given type.', (done) => {
            co(function* () {
                expect(typeFunctions.isValidValueAs("test", Types.String)).to.be.true;
                expect(typeFunctions.isValidValueAs(0, Types.String)).to.be.false;
                expect(typeFunctions.isValidValueAs({}, Types.String)).to.be.false;
                expect(typeFunctions.isValidValueAs([], Types.String)).to.be.false;
                expect(typeFunctions.isValidValueAs(0, Types.Integer)).to.be.true;
                expect(typeFunctions.isValidValueAs(1.0, Types.Integer)).to.be.true;
                expect(typeFunctions.isValidValueAs("0", Types.Integer)).to.be.false;
                expect(typeFunctions.isValidValueAs(1.2, Types.Integer)).to.be.false;
                expect(typeFunctions.isValidValueAs(new Date(), Types.Date)).to.be.true;
                expect(typeFunctions.isValidValueAs("date", Types.Date)).to.be.false;
                expect(typeFunctions.isValidValueAs({}, Types.Date)).to.be.false;
                expect(typeFunctions.isValidValueAs([], Types.Date)).to.be.false;
                expect(typeFunctions.isValidValueAs(ObjectID(), Types.MongoObjectID)).to.be.true;
                expect(typeFunctions.isValidValueAs("wwww", Types.MongoObjectID)).to.be.false;
                expect(typeFunctions.isValidValueAs({}, Types.MongoObjectID)).to.be.false;
                expect(typeFunctions.isValidValueAs(10, Types.MongoObjectID)).to.be.true;
                expect(typeFunctions.isValidValueAs("95ecc380-afe9-11e4-9b6c-751b66dd541e", Types.UUID)).to.be.true;
                expect(typeFunctions.isValidValueAs(10, Types.UUID)).to.be.false;
                expect(typeFunctions.isValidValueAs({}, Types.UUID)).to.be.false;
                expect(typeFunctions.isValidValueAs("090", Types.UUID)).to.be.false;
                expect(typeFunctions.isValidValueAs({}, [Types.String])).to.be.false;
                expect(typeFunctions.isValidValueAs(["test"], [Types.String])).to.be.true;
                expect(typeFunctions.isValidValueAs(["test1", "test2"], [Types.String])).to.be.true;
                expect(typeFunctions.isValidValueAs([123, "test"], [Types.Integer])).to.be.false;
                expect(typeFunctions.isValidValueAs([123, 123, []], [Types.Integer])).to.be.false;
                expect(typeFunctions.isValidValueAs({t: 123}, {t: Types.Integer})).to.be.true;
                expect(typeFunctions.isValidValueAs({t: 123, s: "456"}, {t: Types.Integer, s: Types.String})).to.be.true;
                expect(typeFunctions.isValidValueAs({t: 123}, {t: Types.Integer, s: Types.String})).to.be.true;
                expect(typeFunctions.isValidValueAs({t: "123"}, {t: Types.Integer, s: Types.String})).to.be.false;
                expect(typeFunctions.isValidValueAs({t: 123, s: 456}, {t: Types.Integer, s: Types.String})).to.be.false;
                expect(typeFunctions.isValidValueAs({t: [123], s: {d: "s"}}, {t: [Types.Integer], s: {d: Types.String}})).to.be.true;
                expect(typeFunctions.isValidValueAs({t: [123], s: {d: 123}}, {t: [Types.Integer], s: {d: Types.String}})).to.be.false;
                done();
            }).catch((e) => {
                done(e);
            });
        });
    });

    describe('.convertTo(value, type)', () => {
        it('should convert a value to an appropriate type.', (done) => {
            co(function* () {
                expect(typeFunctions.convertTo(123)).to.equal(123);
                expect(typeFunctions.convertTo(null)).to.equal(null);
                expect(typeFunctions.convertTo(0, Types.String)).to.equal("0");
                expect(typeFunctions.convertTo("5.6", Types.Integer)).to.equal(5);
                expect(typeFunctions.convertTo([1, 2, 3], [Types.String])[1]).to.equal("2");
                expect(typeFunctions.convertTo({s: 1, i: "5"}, {s: Types.String, i: Types.Integer}).s).to.equal("1");
                expect(typeFunctions.convertTo({i: "5"}, {s: Types.String, i: Types.Integer}).s).to.equal(undefined);

                let data = typeFunctions.convertTo({s: {d: 2}, i: [5, "6"]}, {s: {d: Types.String}, i: [Types.Integer]});
                expect(data.s.d).to.equal("2");
                expect(data.i[0]).to.equal(5);
                expect(data.i[1]).to.equal(6);

                done();
            }).catch((e) => {
                done(e);
            });
        });
    });

});