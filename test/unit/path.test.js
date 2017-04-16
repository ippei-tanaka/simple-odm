import { expect } from 'chai';
import Path from '../../src/path';
import Types from '../../src/types';
import { SimpleOdmError } from '../../src/errors';

describe('path', function () {

    it('should not create a Path instance if a name is not string.', () =>
    {
        let error;

        try {
            new Path({});
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The path name has to be string.');
    });

    it('should not create a Path instance if an options argument is not on object.', () =>
    {
        let error;

        try {
            new Path("slug", true);
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The options argument of "slug" has to be an object.');
    });

    it('should have its name and default values.', () =>
    {
        const path = new Path("slug");
        const generator = function* () {};

        expect(path.name).to.equal("slug");
        expect(path.displayName).to.equal("slug");
        expect(path.type).to.equal(Types.String);
        expect(path.defaultValue).to.equal(undefined);
        expect(path.isUnique).to.equal(false);
        expect(path.isProjected).to.equal(true);
        expect(path.isRequiredWhenCreated).to.equal(false);
        expect(path.isRequiredWhenUpdated).to.equal(false);
        expect(path.requiredWhenCreatedErrorMessageBuilder).to.be.a('function');
        expect(path.requiredWhenUpdatedErrorMessageBuilder).to.be.a('function');
        expect(path.uniqueErrorMessageBuilder).to.be.a('function');
        expect(path.typeErrorMessageBuilder).to.be.a('function');
        expect(path.sanitizer).to.be.a('function');
        expect(path.validator).to.be.an.instanceof(generator.constructor);
    });

    it('should throw an error if the display name given is not string.', () =>
    {
        let error;

        try {
            new Path("slug", { display_name: 0 });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The display name of "slug" has to be string.');
    });

    it('should throw an error if the type given is not a type.', () =>
    {
        let error;

        try {
            new Path("slug", { type: "String" });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The type attribute of "slug" has to be a type.');
    });

    it('should not throw an error if the type given is a type.', () =>
    {
        let error;

        try {
            new Path("slug", { type: Types.Integer });
        } catch (e) {
            error = e || null;
        }

        expect(error).to.be.an('undefined');
    });

    it('should throw an error if the default value given is not valid.', () =>
    {
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
        expect(error.message).to.equal('The default value of "slug" is not valid as the "Integer" type.');
    });

    it('should throw an error if the default value given is not string and the type option is omitted.', () =>
    {
        let error;

        try {
            new Path("slug", {
                default_value: 0
            });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The default value of "slug" is not valid as the "String" type.');
    });

    it('should not throw an error if the default value given is valid.', () =>
    {
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
    });

    it('should throw an error if the unique attribute given is number.', () =>
    {
        let error;

        try {
            new Path("slug", {
                unique: 0
            });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The unique attribute of "slug" has to be either boolean or a function.');
    });

    it('should not throw an error if the unique attribute given is boolean or a function.', () =>
    {
        let error;

        try {
            new Path("slug", {
                unique: false
            });
            new Path("slug", {
                unique: () => {}
            });
        } catch (e) {
            error = e || null;
        }

        expect(error).to.be.an('undefined');
    });

    it('should check the projected attribute.', () =>
    {
        let error;

        try {
            new Path("slug", {
                projected: false
            });
        } catch (e) {
            error = e || null;
        }

        expect(error).to.be.an('undefined');

        error = null;

        try {
            new Path("slug", {
                projected: {}
            });
        } catch (e) {
            error = e || null;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The projected attribute of "slug" has to be boolean.');
    });

    it('should throw an error if the require attribute given is not boolean.', () =>
    {
        let error;

        try {
            new Path("slug", {
                required: 0
            });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The require attribute of "slug" has to be either boolean, an array, a function or an object.');
    });

    it('should not throw an error if the require attribute given is either boolean, an array or an object.', () =>
    {
        let error;

        try {
            new Path("slug", {
                required: []
            });
            new Path("slug", {
                required: {}
            });
            new Path("slug", {
                required: false
            });
        } catch (e) {
            error = e || null;
        }

        expect(error).to.be.an('undefined');
    });

    it('should return proper values for a required attribute.', () =>
    {
        let path;

        path = new Path("slug", {
            required: (v) => `Wow, ${v}?`
        });

        expect(path.isRequiredWhenCreated).to.equal(true);
        expect(path.isRequiredWhenUpdated).to.equal(true);
        expect(path.requiredWhenCreatedErrorMessageBuilder("Really")).to.equal('Wow, Really?');
        expect(path.requiredWhenUpdatedErrorMessageBuilder("Yeah")).to.equal('Wow, Yeah?');

        path = new Path("slug", {
            required: ["updated"]
        });

        expect(path.isRequiredWhenCreated).to.equal(false);
        expect(path.isRequiredWhenUpdated).to.equal(true);
        expect(path.requiredWhenCreatedErrorMessageBuilder).to.be.a('function');
        expect(path.requiredWhenUpdatedErrorMessageBuilder).to.be.a('function');

        path = new Path("slug", {
            required: {
                created: (v) => `Hey, ${v}!`,
                updated: false
            }
        });

        expect(path.isRequiredWhenCreated).to.equal(true);
        expect(path.isRequiredWhenUpdated).to.equal(false);
        expect(path.requiredWhenCreatedErrorMessageBuilder("You")).to.equal("Hey, You!");
        expect(path.requiredWhenUpdatedErrorMessageBuilder("You")).to.equal('The slug is required.');
    });

    it('should throw an error if a sanitize attribute given is integer.', () =>
    {
        let error;

        try {
            new Path("slug", {
                sanitize: 0
            });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The sanitize attribute of "slug" has to be a function.');
    });

    it('should not throw an error if a sanitize attribute given is a function.', () =>
    {
        let error;

        try {
            new Path("slug", {
                sanitize: () => {}
            });
        } catch (e) {
            error = e || null;
        }

        expect(error).to.be.an('undefined');
    });

    it('should throw an error if a validator attribute given is integer or a function.', () =>
    {
        let error;

        try {
            new Path("slug", {
                validate: 0
            });
        } catch (e) {
            error = e;
        }

        expect(error).to.be.an.instanceof(SimpleOdmError);
        expect(error.message).to.equal('The validate attribute of "slug" has to be a function.');

        error = undefined;

        try {
            new Path("slug", {
                validate: () => {}
            });
        } catch (e) {
            error = e || null;
        }

        expect(error).to.be.an('undefined');
    });

    it('should not throw an error if a validate attribute given is a function.', () =>
    {
        let error;

        try {
            new Path("slug", {
                validate: function* () {}
            });
        } catch (e) {
            error = e || null;
        }

        expect(error).to.be.an('undefined');
    });
});