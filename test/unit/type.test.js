import co from 'co';
import { expect } from 'chai';
import { Types, isValidValueAs, isValidType, convertTo } from '../../src/type';
import { ObjectID } from 'mongodb';

describe('Type', function () {

    describe('.isValidType(value)', () => {
        it('should check if value is a type object.', (done) => {
            co(function* () {
                expect(isValidType(Types.String)).to.be.true;
                expect(isValidType(Types.Integer)).to.be.true;
                expect(isValidType("String")).to.be.false;
                expect(isValidType([Types.String])).to.be.true;
                expect(isValidType([0])).to.be.false;
                expect(isValidType({name: Types.String})).to.be.true;
                expect(isValidType({name: Types.String, age: Types.Integer})).to.be.true;
                expect(isValidType({name: "yes"})).to.be.false;
                expect(isValidType({name: "yes", age: Types.Integer})).to.be.false;
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
                expect(isValidValueAs([], Types.String)).to.be.false;
                expect(isValidValueAs(0, Types.Integer)).to.be.true;
                expect(isValidValueAs(1.0, Types.Integer)).to.be.true;
                expect(isValidValueAs("0", Types.Integer)).to.be.false;
                expect(isValidValueAs(1.2, Types.Integer)).to.be.false;
                expect(isValidValueAs(new Date(), Types.Date)).to.be.true;
                expect(isValidValueAs("date", Types.Date)).to.be.false;
                expect(isValidValueAs({}, Types.Date)).to.be.false;
                expect(isValidValueAs([], Types.Date)).to.be.false;
                expect(isValidValueAs(ObjectID(), Types.MongoObjectID)).to.be.true;
                expect(isValidValueAs("wwww", Types.MongoObjectID)).to.be.false;
                expect(isValidValueAs({}, Types.MongoObjectID)).to.be.false;
                expect(isValidValueAs(10, Types.MongoObjectID)).to.be.true;
                expect(isValidValueAs("95ecc380-afe9-11e4-9b6c-751b66dd541e", Types.UUID)).to.be.true;
                expect(isValidValueAs(10, Types.UUID)).to.be.false;
                expect(isValidValueAs({}, Types.UUID)).to.be.false;
                expect(isValidValueAs("090", Types.UUID)).to.be.false;
                expect(isValidValueAs({}, [Types.String])).to.be.false;
                expect(isValidValueAs(["test"], [Types.String])).to.be.true;
                expect(isValidValueAs(["test1", "test2"], [Types.String])).to.be.true;
                expect(isValidValueAs([123, "test"], [Types.Integer])).to.be.false;
                expect(isValidValueAs([123, 123, []], [Types.Integer])).to.be.false;
                expect(isValidValueAs({t: 123}, {t: Types.Integer})).to.be.true;
                expect(isValidValueAs({t: 123, s: "456"}, {t: Types.Integer, s: Types.String})).to.be.true;
                expect(isValidValueAs({t: 123}, {t: Types.Integer, s: Types.String})).to.be.true;
                expect(isValidValueAs({t: "123"}, {t: Types.Integer, s: Types.String})).to.be.false;
                expect(isValidValueAs({t: 123, s: 456}, {t: Types.Integer, s: Types.String})).to.be.false;
                expect(isValidValueAs({t: [123], s: {d: "s"}}, {t: [Types.Integer], s: {d: Types.String}})).to.be.true;
                expect(isValidValueAs({t: [123], s: {d: 123}}, {t: [Types.Integer], s: {d: Types.String}})).to.be.false;
                done();
            }).catch((e) => {
                done(e);
            });
        });
    });

    describe('.convertTo(value, type)', () => {
        it('should convert a value to an appropriate type.', (done) => {
            co(function* () {
                expect(convertTo(123)).to.equal(123);
                expect(convertTo(null)).to.equal(null);
                expect(convertTo(0, Types.String)).to.equal("0");
                expect(convertTo("5.6", Types.Integer)).to.equal(5);
                expect(convertTo([1, 2, 3], [Types.String])[1]).to.equal("2");
                expect(convertTo({s: 1, i: "5"}, {s: Types.String, i: Types.Integer}).s).to.equal("1");
                expect(convertTo({i: "5"}, {s: Types.String, i: Types.Integer}).s).to.equal(undefined);

                let data = convertTo({s: {d: 2}, i: [5, "6"]}, {s: {d: Types.String}, i: [Types.Integer]});
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