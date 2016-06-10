import co from 'co';
import { expect } from 'chai';
import Path from '../../src/path';
import { Types } from '../../src/type';
import { SimpleOdmError } from '../../src/errors';

describe('path', function () {

    it('should not create a Path instance if a name is not string.', (done) => {
        co(function* () {
            let error;

            try {
                new Path({});
            } catch (e) {
                error = e;
            }

            expect(error).to.be.an.instanceof(SimpleOdmError);
            expect(error.message).to.equal('A path name has to be string.');

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should not create a Path instance if an options argument is not on object.', (done) => {
        co(function* () {
            let error;

            try {
                new Path("slug", true);
            } catch (e) {
                error = e;
            }

            expect(error).to.be.an.instanceof(SimpleOdmError);
            expect(error.message).to.equal('An options argument has to be an object.');

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should have its name and default values.', (done) => {
        co(function* () {
            const path = new Path("slug");
            const generator = function* () {};

            expect(path.name).to.equal("slug");
            expect(path.displayName).to.equal("slug");
            expect(path.type).to.equal(Types.String);
            expect(path.defaultValue).to.equal(undefined);
            expect(path.isUnique).to.equal(false);
            expect(path.isRequiredWhenCreated).to.equal(false);
            expect(path.isRequiredWhenUpdated).to.equal(false);
            expect(path.requiredErrorMessageBuilder).to.be.a('function');
            expect(path.uniqueErrorMessageBuilder).to.be.a('function');
            expect(path.typeErrorMessageBuilder).to.be.a('function');
            expect(path.sanitizer).to.be.a('function');
            expect(path.validator).to.be.an.instanceof(generator.constructor);

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should throw an error if the display name given is not string.', (done) => {
        co(function* () {
            let error;

            try {
                new Path("slug", { display_name: 0 });
            } catch (e) {
                error = e;
            }

            expect(error).to.be.an.instanceof(SimpleOdmError);
            expect(error.message).to.equal('A display name has to be string.');

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should throw an error if the type given is not a type.', (done) => {
        co(function* () {
            let error;

            try {
                new Path("slug", { type: "String" });
            } catch (e) {
                error = e;
            }

            expect(error).to.be.an.instanceof(SimpleOdmError);
            expect(error.message).to.equal('A type attribute has to be a type.');

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should not throw an error if the type given is a type.', (done) => {
        co(function* () {
            let error;

            try {
                new Path("slug", { type: Types.Integer });
            } catch (e) {
                error = e;
            }

            expect(error).to.be.an('undefined');

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should throw an error if the default value given is not valid.', (done) => {
        co(function* () {
            let error;

            try {
                new Path("slug", {
                    type: Types.Integer,
                    default_value: "test"
                });
            } catch (e) {
                error = e;
            }

            expect(error).to.be.an.instanceof(SimpleOdmError);
            expect(error.message).to.equal('The default value is not valid as the "Integer" type.');

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should throw an error if the default value given is not string and the type option is omitted.', (done) => {
        co(function* () {
            let error;

            try {
                new Path("slug", {
                    default_value: 0
                });
            } catch (e) {
                error = e;
            }

            expect(error).to.be.an.instanceof(SimpleOdmError);
            expect(error.message).to.equal('The default value is not valid as the "String" type.');

            done();
        }).catch((e) => {
            done(e);
        });
    });

    it('should not throw an error if the default value given is valid.', (done) => {
        co(function* () {
            let error;

            try {
                new Path("slug", {
                    type: Types.Integer,
                    default_value: 0
                });
            } catch (e) {
                error = e;
            }

            expect(error).to.be.an('undefined');

            done();
        }).catch((e) => {
            done(e);
        });
    });

});